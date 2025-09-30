import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Nettoyer les données existantes
  await prisma.aiRequest.deleteMany()
  await prisma.generatedDocument.deleteMany()
  await prisma.userDocuments.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.user.deleteMany()

  // Créer des utilisateurs de test
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: hashedPassword,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: hashedPassword,
    },
  })

  console.log('✅ Users created')

  // Créer les settings pour les utilisateurs
  await prisma.settings.createMany({
    data: [
      {
        userId: user1.id,
        language: 'en',
        colorMode: 'dark',
      },
      {
        userId: user2.id,
        language: 'fr',
        colorMode: 'light',
      },
    ],
  })

  console.log('✅ Settings created')

  // Créer des documents de test
  const doc1 = await prisma.userDocuments.create({
    data: {
      userId: user1.id,
      title: 'React Hooks Guide',
      objective: 'Learn React hooks and their implementation',
      rawContent: `
        React Hooks are functions that let you use state and other React features without writing a class.
        
        useState: Manages component state
        useEffect: Handles side effects
        useContext: Accesses context values
        useReducer: Manages complex state logic
        useMemo: Memoizes expensive computations
        useCallback: Memoizes functions
        
        Best practices:
        - Only call hooks at the top level
        - Only call hooks from React functions
        - Use custom hooks to share stateful logic
      `,
    },
  })

  const doc2 = await prisma.userDocuments.create({
    data: {
      userId: user1.id,
      title: 'PostgreSQL Performance Tips',
      objective: 'Optimize PostgreSQL database performance',
      rawContent: `
        PostgreSQL Performance Optimization:
        
        Indexing strategies:
        - B-tree indexes for equality and range queries
        - Hash indexes for equality queries only
        - GIN indexes for full-text search
        - Partial indexes for filtered queries
        
        Query optimization:
        - Use EXPLAIN ANALYZE to understand query plans
        - Avoid SELECT * in production
        - Use appropriate WHERE clauses
        - Consider query rewriting
        
        Configuration tuning:
        - shared_buffers: 25% of RAM
        - work_mem: depends on concurrent connections
        - maintenance_work_mem: for VACUUM and CREATE INDEX
      `,
    },
  })

  const doc3 = await prisma.userDocuments.create({
    data: {
      userId: user2.id,
      title: 'Docker Best Practices',
      objective: 'Learn Docker containerization best practices',
      rawContent: `
        Docker Best Practices:
        
        Dockerfile optimization:
        - Use multi-stage builds
        - Minimize layers
        - Use .dockerignore
        - Don't run as root
        
        Image optimization:
        - Use official base images
        - Keep images small
        - Use specific tags, not 'latest'
        - Scan for vulnerabilities
        
        Security:
        - Use non-root users
        - Keep base images updated
        - Limit container capabilities
        - Use secrets management
      `,
    },
  })

  console.log('✅ Documents created')

  // Créer des documents générés par l'IA
  await prisma.generatedDocument.createMany({
    data: [
      {
        userDocumentId: doc1.id,
        generatedContent: `
# React Hooks Guide

## Introduction
React Hooks are revolutionary functions that enable state and lifecycle management in functional components.

## Core Hooks

### useState Hook
- **Purpose**: State management in functional components
- **Syntax**: \`const [state, setState] = useState(initialValue)\`
- **Use cases**: Form inputs, toggles, counters

### useEffect Hook
- **Purpose**: Side effects and lifecycle management
- **Syntax**: \`useEffect(callback, dependencies)\`
- **Use cases**: API calls, subscriptions, DOM manipulation

### useContext Hook
- **Purpose**: Access React Context values
- **Benefits**: Avoid prop drilling
- **Implementation**: Requires Context Provider setup

## Advanced Hooks

### useReducer Hook
- **When to use**: Complex state logic with multiple sub-values
- **Benefits**: Predictable state updates
- **Pattern**: Similar to Redux reducers

### Performance Hooks
- **useMemo**: Expensive computation memoization
- **useCallback**: Function memoization
- **Rule**: Use only when performance benefits are measurable

## Best Practices
1. Always call hooks at the component's top level
2. Never call hooks inside loops or conditions
3. Create custom hooks for reusable stateful logic
4. Follow the eslint-plugin-react-hooks rules
        `,
      },
      {
        userDocumentId: doc2.id,
        generatedContent: `
# PostgreSQL Performance Optimization Guide

## Indexing Strategies

### B-tree Indexes (Default)
- **Best for**: Equality and range queries
- **Syntax**: \`CREATE INDEX idx_name ON table(column)\`
- **Performance**: O(log n) lookup time

### Specialized Indexes
- **Hash indexes**: Equality queries only
- **GIN indexes**: Full-text search, arrays, JSONB
- **GiST indexes**: Geometric data, full-text search

### Partial Indexes
\`\`\`sql
CREATE INDEX idx_active_users ON users(email) 
WHERE active = true;
\`\`\`

## Query Optimization

### Analysis Tools
1. **EXPLAIN ANALYZE**: Shows actual execution stats
2. **pg_stat_statements**: Query performance tracking
3. **Auto Explain**: Log slow queries automatically

### Optimization Techniques
- Use covering indexes when possible
- Avoid functions in WHERE clauses
- Consider query rewriting for better plans
- Use appropriate JOIN types

## Configuration Tuning

### Memory Settings
- **shared_buffers**: 25% of total RAM
- **work_mem**: 4MB × concurrent connections
- **maintenance_work_mem**: 256MB for maintenance operations

### Connection Settings
- **max_connections**: Balance with available memory
- **connection pooling**: Use PgBouncer for high concurrency
        `,
      },
    ],
  })

  console.log('✅ Generated documents created')

  // Créer des requêtes AI de test
  await prisma.aiRequest.createMany({
    data: [
      {
        userId: user1.id,
        userDocumentId: doc1.id,
        prompt: 'Structure this React hooks content into a comprehensive guide',
        response: 'Generated a structured guide with sections for introduction, core hooks, advanced hooks, and best practices.',
      },
      {
        userId: user1.id,
        userDocumentId: doc2.id,
        prompt: 'Create a technical documentation for PostgreSQL performance optimization',
        response: 'Generated documentation covering indexing strategies, query optimization, and configuration tuning.',
      },
      {
        userId: user2.id,
        userDocumentId: doc3.id,
        prompt: 'Format this Docker content into a best practices guide',
        response: 'Structured the content into sections covering Dockerfile optimization, image optimization, and security practices.',
      },
    ],
  })

  console.log('✅ AI requests created')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })