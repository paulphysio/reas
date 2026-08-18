import Link from 'next/link'

export default function AcademicResultManagementPage() {
  const benefits = [
    {
      title: 'Automated Result Processing',
      description: 'Eliminate manual data entry and reduce errors with automated advising sheet processing and grade calculation.',
      icon: '⚡'
    },
    {
      title: 'Secure Email Delivery',
      description: 'Deliver student results directly to email inboxes with secure, encrypted communication channels.',
      icon: '🔒'
    },
    {
      title: 'Real-time Tracking',
      description: 'Monitor result delivery status in real-time with comprehensive tracking and reporting dashboards.',
      icon: '📊'
    },
    {
      title: 'Multi-institution Support',
      description: 'Support for universities, polytechnics, colleges, and secondary schools with customizable workflows.',
      icon: '🏫'
    }
  ]

  const features = [
    'Excel file upload with automatic column detection',
    'Customizable email templates with institution branding',
    'Bulk email sending with delivery confirmation',
    'Student data privacy and security compliance',
    'Department and school-based access control',
    'Historical result archive and retrieval',
    'Session and semester management',
    'Comment and signature customization'
  ]

  const bestPractices = [
    {
      title: 'Data Accuracy',
      content: 'Ensure all student data is verified before uploading to minimize delivery errors and maintain academic integrity.'
    },
    {
      title: 'Communication Timing',
      content: 'Send results promptly after grading to keep students informed and maintain transparency in academic processes.'
    },
    {
      title: 'Privacy Protection',
      content: 'Implement strict data protection measures to safeguard student information and comply with privacy regulations.'
    },
    {
      title: 'System Integration',
      content: 'Integrate result management with existing student information systems for seamless data flow and reduced duplication.'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(22% 0.035 258)', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid oklch(88% 0.02 258)', padding: '16px clamp(16px,4vw,48px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'oklch(22% 0.035 258)' }}>
          <img src="/yuvlex.png" alt="Yuvlex" style={{ width: '28px', height: '28px' }} />
          <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Yuvlex</div>
        </Link>
      </div>

      {/* Hero Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ font: '700 42px "Lora",Georgia,serif', marginBottom: '16px', lineHeight: 1.2 }}>
            Academic Result Management System
          </h1>
          <p style={{ font: '400 18px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', maxWidth: '700px', margin: '0 auto' }}>
            Comprehensive guide to academic result management, advising sheet delivery, and student result communication for Nigerian educational institutions.
          </p>
        </div>

        {/* Benefits */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ font: '700 28px "Lora",Georgia,serif', marginBottom: '32px' }}>Key Benefits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px' }}>
            {benefits.map((benefit, index) => (
              <div key={index} style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{benefit.icon}</div>
                <h3 style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '8px' }}>{benefit.title}</h3>
                <p style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.6 }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ font: '700 28px "Lora",Georgia,serif', marginBottom: '32px' }}>Essential Features</h2>
          <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '16px' }}>
              {features.map((feature, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(42% 0.16 258)', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ font: '400 15px system-ui,sans-serif', color: 'oklch(22% 0.035 258)' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ font: '700 28px "Lora",Georgia,serif', marginBottom: '32px' }}>Best Practices</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px' }}>
            {bestPractices.map((practice, index) => (
              <div key={index} style={{ background: 'oklch(96% 0.015 258)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '12px' }}>{practice.title}</h3>
                <p style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.6 }}>
                  {practice.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'oklch(42% 0.16 258)', borderRadius: '16px', padding: '48px', color: '#fff', marginBottom: '48px' }}>
          <h2 style={{ font: '700 32px "Lora",Georgia,serif', marginBottom: '16px' }}>Transform Your Result Management</h2>
          <p style={{ font: '400 18px system-ui,sans-serif', marginBottom: '32px', opacity: 0.9 }}>
            Join Nigerian institutions using Yuvlex to streamline academic result delivery with secure, efficient automation.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/auth/register"
              style={{
                padding: '14px 28px',
                background: '#fff',
                color: 'oklch(42% 0.16 258)',
                borderRadius: '8px',
                textDecoration: 'none',
                font: '600 15px system-ui,sans-serif',
                fontWeight: 600
              }}
            >
              Get Started
            </Link>
            <Link
              href="/pricing"
              style={{
                padding: '14px 28px',
                background: 'transparent',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                font: '600 15px system-ui,sans-serif',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Educational Content */}
        <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ font: '700 24px "Lora",Georgia,serif', marginBottom: '16px' }}>Understanding Academic Result Management</h2>
          <div style={{ font: '400 15px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '16px' }}>
              Academic result management systems are essential tools for modern educational institutions. 
              These systems streamline the process of collecting, processing, and distributing student grades 
              and academic performance data. For Nigerian universities, polytechnics, and secondary schools, 
              effective result management ensures timely communication with students and parents while maintaining 
              data accuracy and security.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Traditional methods of result distribution often involve manual processes, paper-based documentation, 
              and delayed communication. Modern academic result management systems like Yuvlex automate these processes, 
              reducing administrative burden and improving the overall student experience. Features such as automated 
              email delivery, real-time tracking, and secure data storage represent significant improvements over 
              conventional approaches.
            </p>
            <p style={{ marginBottom: '16px' }}>
              When selecting an academic result management system, institutions should consider factors such as 
              scalability, security features, integration capabilities, and ease of use. The system should accommodate 
              different institutional types and sizes, from small secondary schools to large federal universities, 
              while maintaining consistent performance and reliability.
            </p>
            <p>
              Yuvlex provides a comprehensive solution tailored to the Nigerian educational context, supporting 
              the specific needs of universities, polytechnics, colleges, and secondary schools with features designed 
              for local requirements and international best practices.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#fff', borderTop: '1px solid oklch(88% 0.02 258)', padding: '32px 24px', marginTop: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>
            Yuvlex — Academic Result Management System for Nigerian Institutions
          </div>
        </div>
      </div>
    </div>
  )
}
