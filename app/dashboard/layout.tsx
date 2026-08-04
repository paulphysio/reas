import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, FileSpreadsheet, MessageSquare, User, Mail } from 'lucide-react'

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
    <div className="min-h-screen" style={{ background: 'oklch(99% 0.004 258)', color: 'oklch(20% 0.02 258)', '--reas-text': 'oklch(20% 0.02 258)', '--reas-card': '#fff', '--reas-bg': 'oklch(99% 0.004 258)', '--reas-border': 'oklch(88% 0.02 258)', '--reas-muted': 'oklch(45% 0.02 258)', '--reas-divider': 'oklch(94% 0.015 258)', '--reas-tablehead': 'oklch(94% 0.015 258)' } as React.CSSProperties}>
      <nav className="sticky top-0 z-20" style={{ background: 'oklch(99% 0.004 258 / 0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid oklch(88% 0.02 258)' }}>
        <div className="wrap nav-inner px-5 md:px-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div className="brand">
            <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'var(--reas-text)' }}>
              <div className="seal" style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'oklch(42% 0.16 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 14px Lora,Georgia,serif' }}>R</div>
              <div>
                <div className="brand-name" style={{ font: '700 16px Lora,Georgia,serif', letterSpacing: '-0.01em' }}>REAS</div>
                <span className="brand-sub" style={{ font: '400 11px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Dashboard</span>
              </div>
            </Link>
          </div>
          <div className="nav-links desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/dashboard"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', color: 'var(--reas-text)', font: '600 13px system-ui,sans-serif' }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/results"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', color: 'var(--reas-text)', font: '600 13px system-ui,sans-serif' }}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Results
            </Link>
            <Link
              href="/dashboard/mail"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', color: 'var(--reas-text)', font: '600 13px system-ui,sans-serif' }}
            >
              <Mail className="w-4 h-4" />
              Mail Automation
            </Link>
            <Link
              href="/dashboard/chat"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', color: 'var(--reas-text)', font: '600 13px system-ui,sans-serif' }}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </Link>
          </div>
          <div className="nav-links desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/dashboard/profile"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', color: 'var(--reas-text)', font: '600 13px system-ui,sans-serif' }}
            >
              <User className="w-5 h-5" />
              <span style={{ fontSize: '12px' }}>
                {profile?.full_name || 'Profile'}
              </span>
            </Link>
            <form action="/auth/logout" method="POST">
              <button type="submit" style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--reas-text)' }}>
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
          <div className="nav-links mobile-only">
            <form action="/auth/logout" method="POST">
              <button type="submit" style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--reas-text)' }}>
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ background: 'oklch(99% 0.004 258 / 0.92)', backdropFilter: 'blur(8px)', borderTop: '1px solid oklch(88% 0.02 258)' }}>
        <div className="flex justify-around py-3">
          <Link href="/dashboard" className="flex flex-col items-center" style={{ color: 'var(--reas-muted)' }}>
            <LayoutDashboard className="w-5 h-5" />
            <span style={{ fontSize: '10px', marginTop: '4px' }}>Dashboard</span>
          </Link>
          <Link href="/dashboard/results" className="flex flex-col items-center" style={{ color: 'var(--reas-muted)' }}>
            <FileSpreadsheet className="w-5 h-5" />
            <span style={{ fontSize: '10px', marginTop: '4px' }}>Results</span>
          </Link>
          <Link href="/dashboard/mail" className="flex flex-col items-center" style={{ color: 'var(--reas-muted)' }}>
            <Mail className="w-5 h-5" />
            <span style={{ fontSize: '10px', marginTop: '4px' }}>Mail</span>
          </Link>
          <Link href="/dashboard/chat" className="flex flex-col items-center" style={{ color: 'var(--reas-muted)' }}>
            <MessageSquare className="w-5 h-5" />
            <span style={{ fontSize: '10px', marginTop: '4px' }}>Chat</span>
          </Link>
          <Link href="/dashboard/profile" className="flex flex-col items-center" style={{ color: 'var(--reas-muted)' }}>
            <User className="w-5 h-5" />
            <span style={{ fontSize: '10px', marginTop: '4px' }}>Profile</span>
          </Link>
        </div>
      </div>

      <main style={{ paddingTop: '48px', paddingBottom: '100px' }}>
        {children}
      </main>
    </div>
  )
}
