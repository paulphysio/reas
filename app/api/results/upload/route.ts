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
  if (!file.name.endsWith('.xlsx')) {
    return NextResponse.json({ error: 'File must be .xlsx format' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const { columns, data } = parseExcel(buffer)

  // File is never written to disk → auto "deleted" after processing
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
      data,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(sheet)
}
