'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        🎉 Login réussi !
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Bienvenue sur votre dashboard DockFlow !
      </p>
      
      <div style={{ 
        background: '#f0f9ff', 
        padding: '1rem', 
        borderRadius: '0.5rem',
        border: '1px solid #0ea5e9'
      }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
          ✅ Votre authentification fonctionne parfaitement !
        </h2>
        <p>Le token JWT a été stocké et vous êtes maintenant connecté.</p>
      </div>

      {/* TODO: Plus tard - Liste des documents, sidebar, etc. */}
    </div>
  )
}