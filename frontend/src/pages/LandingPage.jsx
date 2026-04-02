import React, { useContext } from 'react';
import { 
  Calendar, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight, 
  BarChart3, 
  QrCode,
  Sparkles,
  Globe,
  Mail,
  MapPin,
  Send
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import EventBuddyLogo from '../assets/EventBuddy.png';

const LandingPage = () => {
  const { currentUser } = useContext(AuthContext);

  if (currentUser) {
    if (currentUser.role === 'admin') return <Navigate to="/admin-dashboard" />;
    if (currentUser.role === 'organizer') return <Navigate to="/organizer-dashboard" />;
    return <Navigate to="/student-dashboard" />;
  }

  return (
    <div className="landing-container" style={{ 
      color: 'white',
      overflowX: 'hidden'
    }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 5%',
        position: 'relative',
        background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99, 102, 241, 0.1)',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          color: '#818cf8',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '2rem',
          animation: 'fadeInDown 0.8s ease'
        }}>
          <Sparkles size={16} />
          The Future of Event Management is Here
        </div>

        <h1 style={{ 
          fontSize: 'clamp(3rem, 8vw, 5.5rem)', 
          marginBottom: '1.5rem', 
          fontWeight: '800',
          lineHeight: '1.1',
          letterSpacing: '-0.04em',
          animation: 'fadeInUp 1s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          Elevate Your Events <br />
          With <img src={EventBuddyLogo} alt="EventBuddy" style={{ height: 'clamp(60px, 12vw, 100px)', marginTop: '0.5rem', objectFit: 'contain' }} />
        </h1>

        <p style={{ 
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
          color: '#94a3b8', 
          maxWidth: '800px', 
          marginBottom: '3rem', 
          lineHeight: '1.6',
          animation: 'fadeInUp 1.2s ease'
        }}>
          The all-in-one orchestration platform for modern enterprises. 
          Manage registrations, foster engagement with real-time chat, and 
          deliver verified certificates with unmatched ease.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          animation: 'fadeInUp 1.4s ease'
        }}>
          <Link to="/register" className="btn-primary" style={{ 
            padding: '18px 36px', 
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none'
          }}>
            Start Organizing Free <ArrowRight size={20} />
          </Link>
          <Link to="/login" style={{
            padding: '18px 36px',
            fontSize: '1.1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            borderRadius: '12px',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            Explore Events
          </Link>
        </div>

        {/* Floating elements for visual interest */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          opacity: '0.1',
          animation: 'float 6s infinite ease-in-out'
        }}><Calendar size={120} /></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          opacity: '0.1',
          animation: 'float 8s infinite ease-in-out reverse'
        }}><MessageSquare size={100} /></div>
      </section>


      {/* Features Section */}
      <section style={{ padding: '8rem 10%' }}>
        <div 
          data-aos="fade-up"
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
            Everything You Need <br /> To <span style={{ color: '#6366f1' }}>Rule Your Events</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            Powerful features designed to make event management feel like a breeze, not a chore.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {[
            {
              title: 'Smart Event Creation',
              desc: 'Our intuitive builder lets you launch professional event pages in minutes with custom branding.',
              icon: <Calendar size={32} color="#6366f1" />,
              bg: 'rgba(99, 102, 241, 0.05)'
            },
            {
              title: 'Real-time Communication',
              desc: 'Foster community with dedicated event chat rooms, instant notifications, and AI-powered moderation.',
              icon: <MessageSquare size={32} color="#a855f7" />,
              bg: 'rgba(168, 85, 247, 0.05)'
            },
            {
              title: 'QR Security & Check-in',
              desc: 'Ditch the spreadsheets. Use our secure QR system for lightning-fast attendee verification.',
              icon: <QrCode size={32} color="#10b981" />,
              bg: 'rgba(16, 185, 129, 0.05)'
            },
            {
              title: 'Verified Certificates',
              desc: 'Automatically generate and deliver blockchain-ready certificates to participants instantly.',
              icon: <ShieldCheck size={32} color="#f59e0b" />,
              bg: 'rgba(245, 158, 11, 0.05)'
            },
            {
              title: 'Deep Analytics',
              desc: 'Gain actionable insights with real-time tracking of registrations, engagement, and feedback.',
              icon: <BarChart3 size={32} color="#3b82f6" />,
              bg: 'rgba(59, 130, 246, 0.05)'
            },
            {
              title: 'Lost & Found Hub',
              desc: 'A smart community-driven platform to report and recover items lost during events.',
              icon: <Sparkles size={32} color="#ec4899" />,
              bg: 'rgba(236, 72, 153, 0.05)'
            }
          ].map((feature, i) => (
            <div key={i} 
              data-aos="zoom-in"
              data-aos-delay={i * 100}
              className="glass-card" style={{ 
              padding: '2.5rem',
              transition: 'transform 0.3s ease',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: feature.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{feature.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ 
        padding: '8rem 10%',
        background: 'linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.05), transparent)'
      }}>
        <div 
          data-aos="zoom-out"
          style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
            Four Steps to <span style={{ color: '#6366f1' }}>Success</span>
          </h2>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {[
            { step: '01', title: 'Design Your Vision', desc: 'Create a stunning event page with our drag-and-drop tools. Set dates, venues, and ticket types.' },
            { step: '02', title: 'Connect Your Audience', desc: 'Share your event link on social media or embed it on your site. Managing registrations is fully automated.' },
            { step: '03', title: 'Host with Confidence', desc: 'Use our real-time tools to monitor check-ins and engage with participants via our smart chat system.' },
            { step: '04', title: 'Recognize Achievement', desc: 'Awards verified certificates automatically based on attendance and performance.' }
          ].map((item, i) => (
            <div key={i} 
              data-aos="fade-left"
              data-aos-delay={i * 200}
              style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
              <span style={{ 
                fontSize: '4rem', 
                fontWeight: '900', 
                color: 'rgba(99, 102, 241, 0.2)',
                lineHeight: '1'
              }}>{item.step}</span>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.8rem' }}>{item.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '8rem 10%', textAlign: 'center' }}>
        <div 
          data-aos="flip-up"
          className="glass-card" style={{ 
          padding: '5rem 2rem', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800', maxWidth: '800px' }}>
            Ready to Revolutionize Your Events?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.3rem', maxWidth: '600px' }}>
            Join thousands of organizers making history with EventBuddy. 
            Free to start, powerful enough to scale.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '20px 40px', fontSize: '1.2rem', textDecoration: 'none' }}>
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer style={{ 
        padding: '8rem 10% 2rem', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(to bottom, #0a0f1d, #05070a)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Newsletter Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '3rem',
          paddingBottom: '5rem',
          marginBottom: '5rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
              Stay in the <span style={{ color: '#6366f1' }}>Loop</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              Get the latest updates, event tips, and platform news delivered directly to your inbox.
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            width: '100%', 
            maxWidth: '500px',
            background: 'rgba(255,255,255,0.03)',
            padding: '8px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <input type="email" placeholder="Enter your email" style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'white',
              padding: '12px 20px',
              fontSize: '1rem',
              outline: 'none'
            }} />
            <button className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Subscribe <Send size={18} />
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '4rem',
          marginBottom: '5rem'
        }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px'
            }}>
              <Link to="/">
                <img src={EventBuddyLogo} alt="EventBuddy" style={{ height: '50px', objectFit: 'contain' }} />
              </Link>
            </div>
            <p style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '1.05rem' }}>
              The definitive platform for enterprise-grade event orchestration. 
              Built for reliability, security, and world-class engagement.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              {[
                { icon: <MessageSquare size={20} />, href: '#' },
                { icon: <Globe size={20} />, href: '#' },
                { icon: <Calendar size={20} />, href: '#' }
              ].map((soc, i) => (
                <a key={i} href={soc.href} style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.color = '#6366f1';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {[
            { 
              title: 'Product', 
              links: [
                { name: 'Events Manager', href: '#' },
                { name: 'Analytics Pro', href: '#' },
                { name: 'QR Logic', href: '#' },
                { name: 'Secure Auth', href: '#' }
              ] 
            },
            { 
              title: 'Resources', 
              links: [
                { name: 'Documentation', href: '#' },
                { name: 'API Reference', href: '#' },
                { name: 'Community', href: '#' },
                { name: 'Help Center', href: '#' }
              ] 
            },
            { 
              title: 'Contact Us', 
              links: [
                { name: 'office@eventbuddy.com', icon: <Mail size={16} /> },
                { name: 'Silicon Valley, CA', icon: <MapPin size={16} /> }
              ] 
            }
          ].map((col, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white' }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href={link.href || '#'} style={{ 
                      color: '#94a3b8', 
                      transition: 'color 0.2s', 
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '1rem'
                    }} 
                    onMouseOver={(e) => e.target.style.color = '#6366f1'}
                    onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                    >
                      {link.icon} {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          paddingTop: '2.5rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          color: '#64748b',
          fontSize: '0.95rem'
        }}>
          <p>© 2026 EventBuddy Ecosystem. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#64748b'}>Privacy Policy</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#64748b'}>Terms of Service</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#64748b'}>Cookie Settings</a>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
