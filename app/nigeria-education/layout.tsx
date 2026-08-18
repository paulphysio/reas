import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nigerian Education Directory - Universities, Polytechnics & Colleges',
  description: 'Comprehensive directory of Nigerian universities, polytechnics, colleges, and secondary schools. Find academic institutions across all 36 states including federal, state, and private institutions.',
  keywords: [
    'Nigerian universities',
    'Nigeria polytechnics',
    'Nigeria colleges',
    'Nigeria secondary schools',
    'federal universities Nigeria',
    'state universities Nigeria',
    'private universities Nigeria',
    'Nigeria education system',
    'academic institutions Nigeria',
    'tertiary institutions Nigeria',
    'Nigeria school directory',
    'education Nigeria'
  ],
}

export default function NigeriaEducationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
