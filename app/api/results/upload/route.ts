import { createClient } from '@/lib/supabase/server'
import { parseExcel } from '@/lib/excel'
import { NextResponse } from 'next/server'
import type { Department, Semester } from '@/lib/types'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const level = Number(formData.get('level'))
  const department = formData.get('department') as Department
  const session = formData.get('session') as string
  const semester = formData.get('semester') as Semester

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
    return NextResponse.json({ error: 'File must be .xlsx or .csv format' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const { columns, data } = parseExcel(buffer)

  // Transform data to match the new UI format
  const transformedData = data.map((row: any, index: number) => ({
    id: index,
    name: row.Name || row.name || 'Unknown',
    email: row.Email || row.email || '',
    document: row.Document || row.document || 'Result',
    note: row.Note || row.note || '',
    validation: (row.Email || row.email) ? 'ready' : 'missing-email',
    result: undefined,
    failReason: ''
  }))

  // Save to database but don't keep file on disk
  const { data: sheet, error } = await supabase
    .from('result_sheets')
    .insert({
      uploaded_by: user.id,
      level,
      department,
      session,
      semester,
      filename: file.name,
      columns,
      data: transformedData,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...sheet, rows: transformedData })
}