import Link from 'next/link'

export default function NigeriaEducationPage() {
  const states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]

  const institutionTypes = [
    {
      name: 'Federal Universities',
      description: 'Government-funded universities with national coverage',
      examples: ['University of Lagos', 'University of Ibadan', 'Ahmadu Bello University']
    },
    {
      name: 'State Universities',
      description: 'State-owned institutions serving regional needs',
      examples: ['Lagos State University', 'Osun State University', 'Delta State University']
    },
    {
      name: 'Private Universities',
      description: 'Privately-funded institutions with specialized programs',
      examples: ['Covenant University', 'Babcock University', 'Afe Babalola University']
    },
    {
      name: 'Polytechnics',
      description: 'Technical and vocational education institutions',
      examples: ['Yaba College of Technology', 'Kaduna Polytechnic', 'Auchi Polytechnic']
    },
    {
      name: 'Colleges of Education',
      description: 'Teacher training and educational institutions',
      examples: ['Federal College of Education Zaria', 'College of Education Warri']
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
            Nigerian Education Directory
          </h1>
          <p style={{ font: '400 18px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', maxWidth: '700px', margin: '0 auto' }}>
            Comprehensive directory of Nigerian universities, polytechnics, colleges, and secondary schools. 
            Find academic institutions across all 36 states including federal, state, and private institutions.
          </p>
        </div>

        {/* Institution Types */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ font: '700 28px "Lora",Georgia,serif', marginBottom: '32px' }}>Types of Nigerian Institutions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px' }}>
            {institutionTypes.map((type, index) => (
              <div key={index} style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '8px' }}>{type.name}</h3>
                <p style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '16px' }}>{type.description}</p>
                <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>
                  <strong>Examples:</strong> {type.examples.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* States Directory */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ font: '700 28px "Lora",Georgia,serif', marginBottom: '32px' }}>Institutions by State</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
            {states.map((state) => (
              <Link
                key={state}
                href={`/nigeria-education/${state.toLowerCase().replace(' ', '-')}`}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  background: '#fff',
                  border: '1px solid oklch(88% 0.02 258)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'oklch(22% 0.035 258)',
                  font: '400 14px system-ui,sans-serif',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {state}
              </Link>
            ))}
          </div>
        </div>

        {/* Academic Result Management */}
        <div style={{ background: 'oklch(42% 0.16 258)', borderRadius: '16px', padding: '48px', color: '#fff', marginBottom: '48px' }}>
          <h2 style={{ font: '700 32px "Lora",Georgia,serif', marginBottom: '16px' }}>Streamline Academic Result Delivery</h2>
          <p style={{ font: '400 18px system-ui,sans-serif', marginBottom: '32px', opacity: 0.9 }}>
            Yuvlex helps Nigerian institutions automate advising sheet delivery, report sheet management, and student result communication with secure, efficient email automation.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/pricing"
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
              View Pricing
            </Link>
            <Link
              href="/support"
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
              Contact Support
            </Link>
          </div>
        </div>

        {/* SEO Content */}
        <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ font: '700 24px "Lora",Georgia,serif', marginBottom: '16px' }}>About Nigerian Education System</h2>
          <div style={{ font: '400 15px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '16px' }}>
              Nigeria's education system is one of the largest in Africa, comprising over 170 universities, 
              numerous polytechnics, colleges of education, and thousands of secondary schools. The system 
              is structured into federal, state, and private institutions, each serving different educational 
              needs across the country's 36 states and Federal Capital Territory.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Federal universities are funded by the federal government and typically offer the widest range 
              of programs. State universities are owned and funded by state governments, often focusing on 
              regional development needs. Private universities have grown significantly in recent years, 
              offering specialized programs and often featuring modern facilities.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Polytechnics and colleges of education focus on technical and teacher training respectively, 
              providing crucial vocational skills that support Nigeria's economic development. These institutions 
              play a vital role in producing skilled manpower for various sectors of the economy.
            </p>
            <p>
              Yuvlex supports all types of Nigerian educational institutions with modern academic result 
              management solutions, helping streamline administrative processes and improve communication 
              between institutions, students, and parents.
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
