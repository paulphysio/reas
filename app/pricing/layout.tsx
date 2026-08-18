import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Affordable pricing plans for Yuvlex academic result management system. Choose between pay-per-student or institution license options for Nigerian universities, polytechnics, and schools.',
  keywords: ['Yuvlex pricing', 'academic result management cost', 'university software pricing', 'institution license', 'pay per student', 'education technology pricing'],
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
