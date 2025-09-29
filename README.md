# DockFlow - Technical Documentation Platform

## 📋 Project Overview

DockFlow is a web application designed for students to create, manage, and enhance technical documentation using AI. This project serves as the final year project for Holberton School.

## 🚀 Features

### Must Have
- ✅ Create new resources with title, objective, and content
- ✅ AI-powered document structuring and generation
- ✅ View and manage saved resources
- ✅ Secure user authentication and account management

### Should Have
- 🔄 Edit and delete resources
- 🔄 Password reset functionality

### Could Have
- 📋 Tag and categorize resources
- 📄 Export documents as PDF/Markdown

## 🏗️ Architecture

```
Next.js Full-Stack Application ↔ Database (PostgreSQL) ↔ External APIs (OpenAI)
    (Frontend + API Routes)
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Frontend**: React with TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI API
- **Authentication**: NextAuth.js (JWT)
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel, Docker

## 📊 Database Schema

### Main Entities
- **Users**: Authentication and profile management
- **Documents**: User's documentation resources
- **AiRequests**: AI generation history
- **Settings**: User preferences

## 🔗 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- Next Auth routes for login/logout

### Documents
- `GET /api/documents` - List user documents
- `POST /api/documents` - Create new document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document
- `POST /api/documents/[id]/generate` - Generate AI content

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## 🧪 Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright for user flows
- **Manual Testing**: Postman collections for API testing

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- OpenAI API Key

### Installation
```bash
# Clone the repository
git clone https://github.com/[username]/holbertonschool-DockFlow.git

# Install dependencies
cd holbertonschool-DockFlow
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Setup database
npx prisma migrate dev

# Run the development server
npm run dev
```

## 🌿 Git Workflow

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: New features
- **hotfix/***: Critical fixes

## 📝 Project Timeline

- **Phase 1**: ✅ Project setup and basic authentication
  - ✅ Next.js project initialization
  - 🔄 Database setup with Prisma
  - 🔄 NextAuth.js configuration
  
- **Phase 2**: 📝 Document CRUD operations
- **Phase 3**: 📝 AI integration
- **Phase 4**: 📝 Testing and deployment

## 👥 Contributors

- GIRARDEY Julien - Holberton School Student

## 📄 License

This project is part of Holberton School curriculum.
