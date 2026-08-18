import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Academic Result Management System - Best Practices & Solutions',
  description: 'Learn about academic result management systems, advising sheet delivery, and student result communication. Discover best practices for Nigerian universities, polytechnics, and schools.',
  keywords: [
    'academic result management system',
    'student result management',
    'advising sheet delivery',
    'report sheet management',
    'academic administration software',
    'university result processing',
    'grade management system',
    'academic record automation',
    'student grade communication',
    'education result software'
  ],
}

export default function AcademicResultManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
