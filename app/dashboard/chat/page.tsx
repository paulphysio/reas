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
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ font: '700 34px Lora,Georgia,serif', marginBottom: '8px' }}>Conversations</h1>
          <p style={{ color: 'var(--reas-muted)', lineHeight: '1.6', fontSize: '15px' }}>
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
                background: 'var(--reas-card)', 
                borderRadius: '12px', 
                padding: '20px 24px',
                border: '1px solid var(--reas-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                textDecoration: 'none',
                transition: 'transform 0.18s ease'
              }}
            >
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'oklch(94% 0.015 258)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <MessageSquare style={{ width: '20px', height: '20px', color: 'oklch(42% 0.16 258)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ font: '600 16px system-ui,sans-serif', marginBottom: '4px' }}>
                  Conversation
                </h3>
                <p style={{ color: 'var(--reas-muted)', fontSize: '13px' }}>
                  {new Date(conv.conversations?.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ color: 'var(--reas-muted)' }}>→</div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ 
          background: 'var(--reas-card)', 
          borderRadius: '12px', 
          padding: '64px 38px',
          border: '1px solid var(--reas-border)',
          textAlign: 'center'
        }}>
          <MessageSquare style={{ width: '48px', height: '48px', color: 'var(--reas-muted)', margin: '0 auto 16px' }} />
          <h3 style={{ font: '600 16px system-ui,sans-serif', marginBottom: '8px' }}>
            No conversations yet
          </h3>
          <p style={{ color: 'var(--reas-muted)', marginBottom: '20px', fontSize: '14px' }}>
            Start a new conversation with a colleague
          </p>
          <button style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'oklch(42% 0.16 258)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            font: '600 14px system-ui,sans-serif'
          }}>
            <Plus style={{ width: '18px', height: '18px' }} />
            New Conversation
          </button>
        </div>
      )}
    </div>
  )
}
