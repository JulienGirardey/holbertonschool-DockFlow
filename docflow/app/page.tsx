'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<'what' | 'why' | 'how'>('what');
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header Navigation */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#e5e7eb',
        borderRadius: '2rem',
        margin: '1rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Logo */}
        <div style={{
          backgroundColor: '#60a5fa',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '2rem',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          cursor: 'pointer'
        }}>
          DocFlow
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setActiveSection('what')}
            style={{
              backgroundColor: activeSection === 'what' ? '#3b82f6' : '#93c5fd',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '2rem',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }}
          >
            What is it
          </button>

          <button
            onClick={() => setActiveSection('why')}
            style={{
              backgroundColor: activeSection === 'why' ? '#3b82f6' : '#93c5fd',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '2rem',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }}
          >
            Why use it
          </button>

          <button
            onClick={() => setActiveSection('how')}
            style={{
              backgroundColor: activeSection === 'how' ? '#3b82f6' : '#93c5fd',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '2rem',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }}
          >
            How to use
          </button>
        </nav>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSignIn}
            style={{
              backgroundColor: 'transparent',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              borderRadius: '2rem',
              border: '2px solid #9ca3af',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#6b7280';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
          >
            Sign In
          </button>

          <button
            onClick={handleRegister}
            style={{
              backgroundColor: '#60a5fa',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '2rem',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#60a5fa';
            }}
          >
            Register
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        margin: '2rem',
        backgroundColor: 'white',
        borderRadius: '1rem',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '3rem 2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        
        {/* What is it Section */}
        {activeSection === 'what' && (
          <div style={{ 
            textAlign: 'center',
            maxWidth: '800px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '2rem',
              fontStyle: 'italic'
            }}>
              What is it
            </h1>

            <div style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              lineHeight: '1.8',
              marginBottom: '3rem'
            }}>
              <p style={{ marginBottom: '1.5rem' }}>
                <strong>DocFlow</strong> is an intelligent document editor that combines 
                the power of AI with an intuitive interface to create, 
                edit and organize your professional documents.
              </p>
              <p>
                Transform your ideas into structured and professional documents 
                with the help of our integrated AI assistant.
              </p>
            </div>

            <button
              onClick={handleRegister}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '2rem',
                border: 'none',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🚀 Get Started Free
            </button>
          </div>
        )}

        {/* Why use it Section */}
        {activeSection === 'why' && (
          <div style={{ 
            textAlign: 'center',
            maxWidth: '800px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '2rem',
              fontStyle: 'italic'
            }}>
              Why use it
            </h1>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid #bfdbfe'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#1e40af',
                  marginBottom: '1rem' 
                }}>
                  AI Powered
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  AI assistant to improve, summarize, translate and restructure 
                  your documents automatically.
                </p>
              </div>

              <div style={{
                backgroundColor: '#f0fdf4',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid #bbf7d0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💾</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#15803d',
                  marginBottom: '1rem' 
                }}>
                  Auto Save
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  Your changes are automatically saved. 
                  Never lose your data again!
                </p>
              </div>

              <div style={{
                backgroundColor: '#fef3c7',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid #fed7aa'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#d97706',
                  marginBottom: '1rem' 
                }}>
                  Fast Interface
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  Modern and intuitive interface for maximum productivity. 
                  Create documents in just a few clicks.
                </p>
              </div>
            </div>

            <button
              onClick={handleRegister}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '2rem',
                border: 'none',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ✨ Discover DocFlow
            </button>
          </div>
        )}

        {/* How to use Section */}
        {activeSection === 'how' && (
          <div style={{ 
            textAlign: 'center',
            maxWidth: '800px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '2rem',
              fontStyle: 'italic'
            }}>
              How to use
            </h1>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                backgroundColor: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid #e2e8f0'
              }}>
                <div style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}>
                  1
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#1e293b',
                    marginBottom: '0.5rem' 
                  }}>
                    Create your account
                  </h3>
                  <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                    Sign up for free in seconds and access your personal workspace.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                backgroundColor: '#f0fdf4',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid #bbf7d0'
              }}>
                <div style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}>
                  2
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#1e293b',
                    marginBottom: '0.5rem' 
                  }}>
                    Create your documents
                  </h3>
                  <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                    Use our intuitive editor to create and structure your professional documents.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                backgroundColor: '#fdf4ff',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid #e9d5ff'
              }}>
                <div style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}>
                  3
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#1e293b',
                    marginBottom: '0.5rem' 
                  }}>
                    Use AI features
                  </h3>
                  <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                    Let our AI improve, summarize or translate your documents automatically.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRegister}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '2rem',
                border: 'none',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🎯 Start Now
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        <p style={{ fontStyle: 'italic' }}>
          DocFlow - Create intelligent documents with AI
        </p>
      </footer>
    </div>
  );
}
