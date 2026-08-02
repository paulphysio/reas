import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Trash2 } from 'lucide-react'
import { findEmailColumn, buildStudentRowHtml } from '@/lib/excel'

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params

  const { data: sheet } = await supabase
    .from('result_sheets')
    .select('*')
    .eq('id', id)
    .single()

  if (!sheet) {
    notFound()
  }

  const emailColumn = findEmailColumn(sheet.columns)
  const hasEmailColumn = !!emailColumn

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/results"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sheet.filename || 'Untitled'}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {sheet.department} - Level {sheet.level} - {sheet.session} ({sheet.semester})
            </p>
          </div>
        </div>
        {hasEmailColumn && (
          <form action={`/api/results/${sheet.id}/send-emails`} method="POST">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Emails
            </button>
          </form>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Sheet Preview</h3>
            <p className="text-sm text-gray-500">
              {sheet.data.length} rows • {sheet.columns.length} columns
            </p>
          </div>

          {!hasEmailColumn && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
              No email column found. Cannot send bulk emails. Please ensure your Excel file has a column named "Email", "EMAIL", or "email".
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {sheet.columns.map((col: string) => (
                    <th
                      key={col}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        col === emailColumn ? 'bg-green-100' : ''
                      }`}
                    >
                      {col}
                      {col === emailColumn && ' (Email)'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sheet.data.slice(0, 50).map((row: any, idx: number) => (
                  <tr key={idx}>
                    {sheet.columns.map((col: string) => (
                      <td
                        key={col}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          col === emailColumn ? 'text-green-600 font-medium' : 'text-gray-900'
                        }`}
                      >
                        {row[col] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {sheet.data.length > 50 && (
              <div className="text-center py-4 text-sm text-gray-500">
                Showing first 50 of {sheet.data.length} rows
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
