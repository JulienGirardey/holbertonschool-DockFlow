'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageTransition from './components/PageTransition';
import ThemeToggle from './components/ThemeToggle';

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
    <PageTransition>
      <div className="page-container">
        {/* Header Navigation */}
        <header className="header-container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          borderRadius: '2rem',
          margin: '1rem'
        }}>
          {/* Logo */}
          <div className="logo">
            DocFlow
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveSection('what')}
              className={`nav-button ${activeSection === 'what' ? 'active' : ''}`}
            >
              What is it
            </button>

            <button
              onClick={() => setActiveSection('why')}
              className={`nav-button ${activeSection === 'why' ? 'active' : ''}`}
            >
              Why use it
            </button>

            <button
              onClick={() => setActiveSection('how')}
              className={`nav-button ${activeSection === 'how' ? 'active' : ''}`}
            >
              How to use
            </button>
          </nav>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ThemeToggle />
            
            <button
              onClick={handleSignIn}
              className="auth-button-outline"
            >
              Sign In
            </button>

          </div>
        </header>

        {/* Main Content */}
        <main className="main-container">
          
          {/* What is it Section */}
          {activeSection === 'what' && (
            <div style={{ 
              textAlign: 'center',
              maxWidth: '800px',
              width: '100%'
            }}>
              <h1 className="section-title">
                What is it
              </h1>

              <div className="section-description">
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
                className="cta-button"
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
              <h1 className="section-title">
                Why use it
              </h1>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
              }}>
                <div className="summer-card-1">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: 'var(--primary-700)',
                    marginBottom: '1rem' 
                  }}>
                    AI Powered
                  </h3>
                  <p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
                    AI assistant to improve, summarize, translate and restructure 
                    your documents automatically.
                  </p>
                </div>

                <div className="summer-card-2">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💾</div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: 'var(--success-600)',
                    marginBottom: '1rem' 
                  }}>
                    Auto Save
                  </h3>
                  <p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
                    Your changes are automatically saved. 
                    Never lose your data again!
                  </p>
                </div>

                <div className="summer-card-3">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: 'var(--gray-700)',
                    marginBottom: '1rem' 
                  }}>
                    Fast Interface
                  </h3>
                  <p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
                    Modern and intuitive interface for maximum productivity. 
                    Create documents in just a few clicks.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRegister}
                className="cta-button"
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
              <h1 className="section-title">
                How to use
              </h1>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                marginBottom: '3rem'
              }}>
                <div className="step-container">
                  <div className="step-number step-1">
                    1
                  </div>
                  <div className="step-content">
                    <h3 className="step-title">
                      Create your account
                    </h3>
                    <p className="step-description">
                      Sign up for free in seconds and access your personal workspace.
                    </p>
                  </div>
                </div>

                <div className="step-container">
                  <div className="step-number step-2">
                    2
                  </div>
                  <div className="step-content">
                    <h3 className="step-title">
                      Create your documents
                    </h3>
                    <p className="step-description">
                      Use our intuitive editor to create and structure your professional documents.
                    </p>
                  </div>
                </div>

                <div className="step-container">
                  <div className="step-number step-3">
                    3
                  </div>
                  <div className="step-content">
                    <h3 className="step-title">
                      Use AI features
                    </h3>
                    <p className="step-description">
                      Let our AI improve, summarize or translate your documents automatically.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRegister}
                className="cta-button"
              >
                🎯 Start Now
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p style={{ fontStyle: 'italic' }}>
            DocFlow - Create intelligent documents with AI
          </p>
        </footer>
      </div>
    </PageTransition>
  );
}
