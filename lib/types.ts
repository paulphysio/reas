export type Department = 'PET' | 'CHEM' | 'MECH'
export type Semester = 'Harmattan' | 'Rain'
export type EmailStatus = 'pending' | 'sent' | 'failed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          department: Department | null
          is_hod: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          department?: Department | null
          is_hod?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          department?: Department | null
          is_hod?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      result_sheets: {
        Row: {
          id: string
          uploaded_by: string
          level: number
          department: Department
          session: string
          semester: Semester
          filename: string | null
          columns: string[]
          data: Record<string, any>[]
          created_at: string
        }
        Insert: {
          id?: string
          uploaded_by: string
          level: number
          department: Department
          session: string
          semester: Semester
          filename?: string | null
          columns: string[]
          data: Record<string, any>[]
          created_at?: string
        }
        Update: {
          id?: string
          uploaded_by?: string
          level?: number
          department?: Department
          session?: string
          semester?: Semester
          filename?: string | null
          columns?: string[]
          data?: Record<string, any>[]
          created_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          result_sheet_id: string | null
          recipient_email: string
          student_name: string | null
          status: EmailStatus
          error: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          result_sheet_id?: string | null
          recipient_email: string
          student_name?: string | null
          status: EmailStatus
          error?: string | null
          sent_at?: string
        }
        Update: {
          id?: string
          result_sheet_id?: string | null
          recipient_email?: string
          student_name?: string | null
          status?: EmailStatus
          error?: string | null
          sent_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          created_at: string
        }
        Insert: {
          id?: string
          created_at?: string
        }
        Update: {
          id?: string
          created_at?: string
        }
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          user_id?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
    }
  }
}

export interface ExcelData {
  columns: string[]
  data: Record<string, any>[]
}

export interface EmailResult {
  email: string
  status: 'sent' | 'failed'
  error?: string
}
