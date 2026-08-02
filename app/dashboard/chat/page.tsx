import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MessageSquare, Plus } from 'lucide-react'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div style={{ color: 'var(--chalk)' }}>Please log in to view conversations.</div>
  }

  let conversations = null
  try {
    const { data } = await supabase
      .from('conversation_participants')
      .select('conversation_id, conversations(*)')
      .eq('user_id', user.id)
    conversations = data
  } catch (error) {
    console.log('Conversations table not created yet')
  }

  return (
    <div style={{ paddingTop: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <p className="eyebrow">Chat</p>
          <h1 style={{ marginBottom: '8px' }}>Conversations</h1>
          <p style={{ color: 'var(--chalk-dim)', lineHeight: '1.65' }}>
            Communicate with colleagues in real-time
          </p>
        </div>
      </div>

      {conversations && conversations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {conversations.map((conv: any) => (
            <Link
              key={conv.conversation_id}
              href={`/dashboard/chat/${conv.conversation_id}`}
              style={{ 
                background: 'var(--paper)', 
                borderRadius: '6px', 
                padding: '24px 32px',
                color: 'var(--ink)',
                boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                textDecoration: 'none',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease'
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--gold-soft)', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <MessageSquare style={{ width: '24px', height: '24px', color: '#8a6b1e' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '600', fontSize: '18px', color: 'var(--ink)', marginBottom: '4px' }}>
                  Conversation
                </h3>
                <p style={{ color: '#7a7264', fontSize: '13px' }}>
                  {new Date(conv.conversations?.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ color: '#7a7264' }}>→</div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ 
          background: 'var(--paper)', 
          borderRadius: '6px', 
          padding: '64px 38px',
          color: 'var(--ink)',
          boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}>
          <MessageSquare style={{ width: '64px', height: '64px', color: '#7a7264', margin: '0 auto 24px' }} />
          <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '600', fontSize: '20px', color: 'var(--ink)', marginBottom: '12px' }}>
            No conversations yet
          </h3>
          <p style={{ color: '#7a7264', marginBottom: '24px', fontSize: '14px' }}>
            Start a new conversation with a colleague
          </p>
          <button className="btn btn-gold btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus style={{ width: '20px', height: '20px' }} />
            New Conversation
          </button>
        </div>
      )}
    </div>
  )
}
