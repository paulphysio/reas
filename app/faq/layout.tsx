import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Yuvlex academic result management system. Learn about features, pricing, security, and how to get started with our platform.',
  keywords: ['Yuvlex FAQ', 'frequently asked questions', 'academic result management questions', 'Yuvlex features', 'how Yuvlex works'],
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
