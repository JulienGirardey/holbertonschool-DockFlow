# Pages de Loading - DocFlow

Ce document explique comment utiliser les différentes pages et composants de loading dans DocFlow.

## 📄 Pages de Loading Automatiques

Next.js 13+ utilise automatiquement les fichiers `loading.tsx` dans chaque dossier de route.

### 1. Loading Global (`app/loading.tsx`)
Se déclenche lors du chargement initial de l'application.

```tsx
'use client' // ⚠️ Requis pour les animations CSS-in-JS

export default function Loading() {
  // Utilisation automatique par Next.js
  return <LoadingComponent />
}
```

### 2. Loading Dashboard (`app/dashboard/loading.tsx`)
Se déclenche lors de la navigation vers `/dashboard`.

```tsx
// Utilisation automatique lors de la navigation vers /dashboard
```

### 3. Loading Auth (`app/login/loading.tsx`, `app/register/loading.tsx`)
Se déclenche lors de la navigation vers les pages d'authentification.

## 🔧 Composant LoadingScreen Réutilisable

### Import et utilisation de base

```tsx
import LoadingScreen from '../components/LoadingScreen'

// ⚠️ LoadingScreen est automatiquement 'use client'
// Utilisez-le dans vos composants clients

// Utilisation basique
<LoadingScreen />

// Avec message personnalisé
<LoadingScreen message="Chargement des documents..." />

// Sans logo
<LoadingScreen message="Sauvegarde..." showLogo={false} />

// En taille réduite (non plein écran)
<LoadingScreen 
  message="Traitement..." 
  fullScreen={false} 
  size="sm" 
/>
```

### Props disponibles

```tsx
interface LoadingScreenProps {
  message?: string        // Message à afficher (défaut: "Chargement...")
  showLogo?: boolean     // Afficher le logo DocFlow (défaut: true)
  fullScreen?: boolean   // Mode plein écran (défaut: true)
  size?: 'sm' | 'md' | 'lg'  // Taille du spinner (défaut: 'md')
}
```

### Exemples d'utilisation

```tsx
// Dans le dashboard - Loading de section
{profileLoading ? (
  <LoadingScreen 
    message="Chargement du profil..." 
    fullScreen={false}
    size="md"
  />
) : (
  // Contenu du profil
)}

// Loading inline
{documentsLoading ? (
  <LoadingScreen 
    message="Chargement des documents..." 
    showLogo={false}
    fullScreen={false}
    size="sm"
  />
) : (
  // Liste des documents
)}

// Loading modal/overlay
{aiGenerating && (
  <div className="modal-overlay">
    <LoadingScreen 
      message="L'IA génère votre contenu..." 
      fullScreen={false}
      size="lg"
    />
  </div>
)}
```

## 🎨 Classes CSS d'Animation

Des classes utilitaires sont disponibles dans `global.css` :

```css
.animate-loading-pulse  /* Effet de pulsation */
.animate-shimmer       /* Effet shimmer */
.animate-loading-bar   /* Barre de progression */
```

### Utilisation des classes

```tsx
// Skeleton avec animation pulse
<div className="animate-loading-pulse" style={{
  height: '20px',
  background: 'var(--gray-200)',
  borderRadius: 'var(--radius-md)'
}} />

// Élément avec effet shimmer
<div style={{ position: 'relative', overflow: 'hidden' }}>
  {/* Contenu */}
  <div className="animate-shimmer" style={{
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
  }} />
</div>
```

## 🚀 Bonnes Pratiques

### 1. Utilisez les bonne tailles
- `size="sm"` : Pour les éléments inline ou petits
- `size="md"` : Pour les sections de contenu
- `size="lg"` : Pour les modals ou écrans complets

### 2. Messages descriptifs
```tsx
// ❌ Générique
<LoadingScreen message="Chargement..." />

// ✅ Spécifique
<LoadingScreen message="Sauvegarde du document..." />
<LoadingScreen message="Génération avec IA..." />
<LoadingScreen message="Synchronisation des données..." />
```

### 3. Gestion des états
```tsx
const [isLoading, setIsLoading] = useState(false)
const [loadingMessage, setLoadingMessage] = useState('')

const handleOperation = async () => {
  setIsLoading(true)
  setLoadingMessage('Préparation...')
  
  try {
    // Étape 1
    setLoadingMessage('Traitement des données...')
    await step1()
    
    // Étape 2
    setLoadingMessage('Finalisation...')
    await step2()
    
  } finally {
    setIsLoading(false)
  }
}

return (
  <div>
    {isLoading ? (
      <LoadingScreen message={loadingMessage} />
    ) : (
      // Contenu normal
    )}
  </div>
)
```

### 4. Évitez les loadings trop courts
```tsx
// Pour éviter les flashs de loading
const [showLoading, setShowLoading] = useState(false)

useEffect(() => {
  if (isLoading) {
    const timer = setTimeout(() => setShowLoading(true), 200)
    return () => clearTimeout(timer)
  } else {
    setShowLoading(false)
  }
}, [isLoading])

return showLoading ? <LoadingScreen /> : <Content />
```

## 🎯 Résumé

- **Pages automatiques** : `loading.tsx` dans chaque dossier de route
- **Composant réutilisable** : `LoadingScreen` pour les cas spécifiques
- **Classes CSS** : Pour les animations personnalisées
- **Messages descriptifs** : Toujours indiquer ce qui se passe
- **Tailles appropriées** : Adapter selon le contexte

L'objectif est d'offrir une expérience utilisateur fluide avec des feedbacks visuels clairs ! 🎨

## 🔄 Migration depuis PageTransition

L'ancien composant `PageTransition` a été supprimé car il créait des conflits avec les pages de loading Next.js automatiques.

### ❌ Ancien système (supprimé)
```tsx
import PageTransition from '../components/PageTransition'

export default function MyPage() {
  return (
    <PageTransition>
      {/* Contenu de la page */}
    </PageTransition>
  )
}
```

### ✅ Nouveau système (recommandé)
```tsx
// Utilisez les pages loading.tsx automatiques de Next.js
// Ou ajoutez simplement une classe CSS pour une animation simple

export default function MyPage() {
  return (
    <div className="animate-fadeInUp">
      {/* Contenu de la page */}
    </div>
  )
}
```

### Avantages du nouveau système :
- ❌ **Plus de double loading** : Une seule animation cohérente
- ⚡ **Performance** : Les loading.tsx sont optimisés par Next.js  
- 🎯 **UX améliorée** : Transitions plus fluides et prévisibles
- 🛠️ **Maintenance** : Moins de code à maintenir

## ⚠️ Erreurs Courantes et Solutions

### 1. Erreur "client-only cannot be imported from Server Component"

**Problème** : Les composants de loading utilisent `styled-jsx` qui requiert le côté client.

**Solution** : Ajoutez `'use client'` en haut de vos fichiers loading :

```tsx
'use client' // ✅ Ajoutez ceci

export default function Loading() {
  return (
    // Votre composant avec styled-jsx
  )
}
```

### 2. Erreur "viewport metadata"

**Problème** : Next.js 14+ sépare la configuration viewport des métadonnées.

**Solution** : Utilisez `generateViewport()` dans `layout.tsx` :

```tsx
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  // Métadonnées sans viewport
}

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    // ...autres options viewport
  }
}
```

### 3. Loading qui ne s'affiche pas

**Problème** : Le loading est trop rapide ou mal placé.

**Solution** : Ajoutez un délai minimum :

```tsx
const [showLoading, setShowLoading] = useState(false)

useEffect(() => {
  if (isLoading) {
    const timer = setTimeout(() => setShowLoading(true), 200)
    return () => clearTimeout(timer)
  } else {
    setShowLoading(false)
  }
}, [isLoading])
```

### 4. Animations qui ne fonctionnent pas

**Problème** : Les classes CSS ne sont pas chargées ou mal appliquées.

**Solution** : Vérifiez que `global.css` est importé et utilisez les bonnes classes :

```tsx
// ✅ Correct
<div className="animate-loading-pulse" />

// ❌ Incorrect
<div className="pulse" />
```