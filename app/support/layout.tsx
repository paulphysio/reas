import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support Center',
  description: 'Get help with Yuvlex academic result management system. Find answers to common questions, contact our support team, and access troubleshooting guides.',
  keywords: ['Yuvlex support', 'help center', 'customer service', 'technical support', 'academic result management help'],
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
