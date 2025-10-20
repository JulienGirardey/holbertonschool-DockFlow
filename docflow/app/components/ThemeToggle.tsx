'use client';

import { useState, useEffect } from 'react';

function setFavicon(theme: 'dark' | 'light') {
  const head = document.head;
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (link) head.removeChild(link);
  link = document.createElement('link');
  link.rel = 'icon';
  link.href = theme === 'dark' ? '/favicon-dark.ico' : '/favicon-light.ico';
  head.appendChild(link);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Récupérer le thème sauvegardé ou détecter la préférence système
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    applyTheme(initialTheme);
	setFavicon(initialTheme);
  }, []);

  useEffect(() => {
	if (isClient) {
		setFavicon(theme);
	}
  }, [theme, isClient]);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!isClient) {
    return null; // Évite les erreurs d'hydratation
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        style={{
          position: 'relative',
          width: '64px',
          height: '34px',
          borderRadius: '17px',
          border: 'none',
          cursor: 'pointer',
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #1e293b, #334155)' 
            : 'linear-gradient(135deg, #fbbf24, #f97316)',
          boxShadow: theme === 'dark'
            ? '0 4px 14px rgba(59, 130, 246, 0.3)'
            : '0 4px 14px rgba(249, 115, 22, 0.4)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme === 'dark' 
            ? 'radial-gradient(circle at 20% 50%, #3b82f6, transparent)'
            : 'radial-gradient(circle at 80% 50%, #fbbf24, transparent)',
          transition: 'all 0.4s ease'
        }} />
        
        {/* Toggle Circle */}
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: theme === 'dark' ? 'calc(100% - 31px)' : '3px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            transform: `rotate(${theme === 'dark' ? '360deg' : '0deg'})`
          }}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
        
        {/* Stars animation for dark mode */}
        {theme === 'dark' && (
          <>
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '12px',
              fontSize: '8px',
              opacity: 0.6,
              animation: 'twinkle 2s infinite alternate'
            }}>✨</div>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '8px',
              fontSize: '6px',
              opacity: 0.4,
              animation: 'twinkle 2.5s infinite alternate'
            }}>⭐</div>
          </>
        )}
      </button>
    </div>
  );
}