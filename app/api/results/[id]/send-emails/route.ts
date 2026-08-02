import { createClient } from '@/lib/supabase/server'
import { sendBulkResults } from '@/lib/email'
import { findEmailColumn, buildStudentRowHtml } from '@/lib/excel'
import { NextResponse } from 'next/server'
import type { EmailStatus } from '@/lib/types'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sheet } = await supabase
    .from('result_sheets')
    .select('*')
    .eq('id', id)
    .single()

  if (!sheet) {
    return NextResponse.json({ error: 'Sheet not found' }, { status: 404 })
  }

  const emailColumn = findEmailColumn(sheet.columns)
  if (!emailColumn) {
    return NextResponse.json({ error: 'No email column found' }, { status: 400 })
  }

  // Extract student data
  const students = sheet.data
    .filter((row: any) => row[emailColumn])
    .map((row: any) => ({
      email: row[emailColumn],
      name: row['Name'] || row['name'] || row['Student Name'] || row['Student'] || 'Student',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Harmattan Semester Results</h2>
          <p>Dear ${row['Name'] || row['name'] || 'Student'},</p>
          <p>Your results for ${sheet.department} Level ${sheet.level} (${sheet.session} - ${sheet.semester}) are as follows:</p>
          ${buildStudentRowHtml(row, sheet.columns)}
          <p style="margin-top: 20px; color: #666;">Best regards,<br>REAS Administration</p>
        </div>
      `,
    }))

  if (students.length === 0) {
    return NextResponse.json({ error: 'No students with email addresses found' }, { status: 400 })
  }

  // Send emails
  const results = await sendBulkResults(students)

  // Log email results
  const emailLogs = results.map(result => ({
    result_sheet_id: sheet.id,
    recipient_email: result.email,
    student_name: students.find((s: any) => s.email === result.email)?.name || null,
    status: result.status as EmailStatus,
    error: result.error || null,
  }))

  await supabase.from('email_logs').insert(emailLogs as any)

  const sent = results.filter(r => r.status === 'sent').length
  const failed = results.filter(r => r.status === 'failed').length

  return NextResponse.json({
    total: results.length,
    sent,
    failed,
    results,
  })
}
