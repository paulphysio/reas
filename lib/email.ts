import nodemailer from 'nodemailer'
import pLimit from 'p-limit'
import type { EmailResult } from './types'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for port 465 (SSL)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendBulkResults(
  students: { email: string; name: string; htmlBody: string }[]
): Promise<EmailResult[]> {
  const limit = pLimit(7) // exactly 7 concurrent as requested
  const results = await Promise.all(
    students.map(student =>
      limit(async () => {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: student.email,
            subject: 'Harmattan semester results',
            html: student.htmlBody,
          })
          return { email: student.email, status: 'sent' as const }
        } catch (err: any) {
          return { email: student.email, status: 'failed' as const, error: err.message }
        }
      })
    )
  )
  return results
}
