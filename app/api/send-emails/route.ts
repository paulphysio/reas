import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  console.log('[SEND-EMAILS] Starting email send process')
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('[SEND-EMAILS] No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[SEND-EMAILS] User authenticated:', user.id)

    const body = await request.json()
    const { rows, sheet_id, columns, emailColumn, year, semester, session, level, comment, signature } = body

    console.log('[SEND-EMAILS] Request body:', { 
      rowsCount: rows?.length, 
      sheet_id, 
      columns, 
      emailColumn,
      hasComment: !!comment,
      hasSignature: !!signature
    })

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      console.error('[SEND-EMAILS] No records provided')
      return NextResponse.json({ error: 'No records provided' }, { status: 400 })
    }

    if (!emailColumn) {
      console.error('[SEND-EMAILS] Email column not specified')
      return NextResponse.json({ error: 'Email column not specified' }, { status: 400 })
    }

    // Check SMTP configuration
    console.log('[SEND-EMAILS] Checking SMTP configuration')
    console.log('[SEND-EMAILS] SMTP_HOST:', process.env.SMTP_HOST)
    console.log('[SEND-EMAILS] SMTP_PORT:', process.env.SMTP_PORT)
    console.log('[SEND-EMAILS] SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET')
    console.log('[SEND-EMAILS] SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET')
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[SEND-EMAILS] SMTP credentials not configured')
      return NextResponse.json({ error: 'SMTP credentials not configured' }, { status: 500 })
    }

    // Create transporter
    console.log('[SEND-EMAILS] Creating SMTP transporter')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Verify SMTP connection
    console.log('[SEND-EMAILS] Verifying SMTP connection')
    try {
      await transporter.verify()
      console.log('[SEND-EMAILS] SMTP connection verified successfully')
    } catch (verifyError) {
      console.error('[SEND-EMAILS] SMTP verification failed:', verifyError)
      return NextResponse.json({ 
        error: 'SMTP connection failed', 
        details: verifyError instanceof Error ? verifyError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Find name column
    const nameColumn = columns.find((c: string) => c.toLowerCase().includes('name')) || columns[0]
    console.log('[SEND-EMAILS] Using name column:', nameColumn)

    // Send emails and log each attempt
    console.log('[SEND-EMAILS] Starting to send', rows.length, 'emails')
    const results = await Promise.allSettled(
      rows.map(async (row: any, index: number) => {
        const email = row[emailColumn]
        const name = row[nameColumn] || 'Student'
        
        console.log(`[SEND-EMAILS] Processing row ${index + 1}/${rows.length}:`, { email, name })
        
        if (!email) {
          console.warn(`[SEND-EMAILS] Row ${index + 1}: Missing email`)
          return { rowId: row.id, status: 'failed', reason: 'Missing email' }
        }

        try {
          // Build email body with all columns
          let bodyContent = `<p>Dear ${name},</p>`
          bodyContent += `<p>Your ${semester} ${year} advising record for ${session} is below:</p>`
          bodyContent += `<table style="border-collapse: collapse; width: 100%; margin: 20px 0;">`
          
          columns.forEach((col: string) => {
            if (col !== emailColumn) {
              bodyContent += `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px; font-weight: 600;">${col}</td>
                  <td style="padding: 8px;">${row[col] || ''}</td>
                </tr>
              `
            }
          })
          
          bodyContent += `</table>`
          
          if (comment) {
            bodyContent += `<p><strong>Adviser Note:</strong> ${comment}</p>`
          }
          if (signature) {
            bodyContent += `<p><strong>Sent by:</strong> ${signature}</p>`
          }

          const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@reas.app',
            to: email,
            subject: `Your ${semester} ${year} Advising Record`,
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: oklch(42% 0.16 258);">Your Advising Record</h2>
                ${bodyContent}
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">This email was sent by Reas - Advising record delivery system.</p>
              </div>
            `,
          }

          console.log(`[SEND-EMAILS] Sending email to ${email}`)
          const info = await transporter.sendMail(mailOptions)
          console.log(`[SEND-EMAILS] Email sent successfully to ${email}:`, info.messageId)

          // Log successful email
          if (sheet_id) {
            await supabase.from('email_logs').insert({
              result_sheet_id: sheet_id,
              recipient_email: email,
              student_name: name,
              document: JSON.stringify(row),
              note: comment || '',
              status: 'sent',
            })
            console.log(`[SEND-EMAILS] Logged successful email to database`)
          }

          return { rowId: row.id, status: 'sent' }
        } catch (error) {
          console.error(`[SEND-EMAILS] Failed to send email to ${email}:`, error)
          
          // Log failed email
          if (sheet_id) {
            await supabase.from('email_logs').insert({
              result_sheet_id: sheet_id,
              recipient_email: email,
              student_name: name,
              document: JSON.stringify(row),
              note: comment || '',
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }

          return { rowId: row.id, status: 'failed', reason: error instanceof Error ? error.message : 'Unknown error' }
        }
      })
    )

    console.log('[SEND-EMAILS] All emails processed')
    const sent = results.filter(r => r.status === 'fulfilled' && r.value.status === 'sent').length
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status === 'failed')).length

    console.log('[SEND-EMAILS] Results:', { sent, failed, total: rows.length })

    // Update result sheet with counts
    if (sheet_id) {
      console.log('[SEND-EMAILS] Updating result sheet counts')
      await supabase
        .from('result_sheets')
        .select('id')
        .eq('id', sheet_id)
        .single()
        .then(({ data: sheet }) => {
          if (sheet) {
            return supabase
              .from('email_logs')
              .select('status')
              .eq('result_sheet_id', sheet_id)
              .then(({ data: logs }) => {
                const sentCount = logs?.filter(l => l.status === 'sent').length || 0
                const failedCount = logs?.filter(l => l.status === 'failed').length || 0
                console.log('[SEND-EMAILS] Updating counts:', { sentCount, failedCount })
                return supabase
                  .from('result_sheets')
                  .update({ 
                    sent_count: sentCount,
                    failed_count: failedCount,
                  })
                  .eq('id', sheet_id)
              })
          }
        })
    }

    const detailedResults = results.map((r, i) => {
      if (r.status === 'fulfilled') {
        return r.value
      }
      return { rowId: rows[i].id, status: 'failed', reason: 'Promise rejected' }
    })

    console.log('[SEND-EMAILS] Returning success response')
    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: rows.length,
      results: detailedResults,
      sheetId: sheet_id,
    })
  } catch (error) {
    console.error('[SEND-EMAILS] Error in send-emails API:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
