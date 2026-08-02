import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, FileSpreadsheet, MessageSquare, User } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  let profile = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  } catch (error) {
    profile = {
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      department: 'PET',
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink)', color: 'var(--chalk)' }}>
      <nav className="sticky top-0 z-20" style={{ background: 'rgba(15, 27, 43, 0.86)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap nav-inner">
          <div className="brand">
            <Link href="/" className="flex items-center gap-3">
              <div className="seal">R</div>
              <div>
                <div className="brand-name">REAS</div>
                <span className="brand-sub">Dashboard</span>
              </div>
            </Link>
          </div>
          <div className="nav-links desktop-only">
            <Link
              href="/dashboard"
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/results"
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Results
            </Link>
            <Link
              href="/dashboard/chat"
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </Link>
          </div>
          <div className="nav-links desktop-only">
            <Link
              href="/dashboard/profile"
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <User className="w-5 h-5" />
              <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11.5px' }}>
                {profile?.full_name || 'Profile'}
              </span>
            </Link>
            <form action="/auth/logout" method="POST">
              <button type="submit" className="btn btn-ghost">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
          <div className="nav-links mobile-only">
            <form action="/auth/logout" method="POST">
              <button type="submit" className="btn btn-ghost">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(15, 27, 43, 0.86)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--line)' }}>
        <div className="flex justify-around py-3">
          <Link href="/dashboard" className="flex flex-col items-center" style={{ color: 'var(--chalk-dim)' }}>
            <LayoutDashboard className="w-5 h-5" />
            <span style={{ fontSize: '10px', marginTop: '4px', fontFamily: 'var(--font-ibm-plex-mono)' }}>Dashboard</span>
          </Link>
          <Link href="/dashboard/results" className="flex flex-col items-center" style={{ color: 'var(--chalk-dim)' }}>
            <FileSpreadsheet className="w-5 h-5" />
            <span style={{ fontSize: '10px', marginTop: '4px', fontFamily: 'var(--font-ibm-plex-mono)' }}>Results</span>
          </Link>
          <Link href="/dashboard/chat" className="flex flex-col items-center" style={{ color: 'var(--chalk-dim)' }}>
            <MessageSquare className="w-5 h-5" />
            <span style={{ fontSize: '10px', marginTop: '4px', fontFamily: 'var(--font-ibm-plex-mono)' }}>Chat</span>
          </Link>
          <Link href="/dashboard/profile" className="flex flex-col items-center" style={{ color: 'var(--chalk-dim)' }}>
            <User className="w-5 h-5" />
            <span style={{ fontSize: '10px', marginTop: '4px', fontFamily: 'var(--font-ibm-plex-mono)' }}>Profile</span>
          </Link>
        </div>
      </div>

      <main className="wrap" style={{ paddingTop: '48px', paddingBottom: '100px' }}>
        {children}
      </main>
    </div>
  )
}
