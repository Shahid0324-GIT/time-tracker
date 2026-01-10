# Freelance Flow - Frontend

> Next.js 16 frontend for time tracking application

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to frontend:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment:**

```bash
cp .env.example .env.local
# Edit .env.local with your backend URL
```

4. **Run development server:**

```bash
npm run dev
```

Open http://localhost:3000

## 📋 Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── time-tracker/
│   │   └── invoices/
│   ├── auth/
│   │   └── callback/     # OAuth callback
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── providers.tsx     # React Query provider
│
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components (sidebar, header)
│   ├── clients/          # Client-related components
│   ├── projects/         # Project-related components
│   ├── time-tracker/     # Timer components
│   ├── invoices/         # Invoice components
│   └── theme-provider.tsx
│
├── lib/
│   ├── api/              # API client functions
│   │   ├── client.ts     # Axios instance
│   │   ├── auth.ts
│   │   ├── clients.ts
│   │   ├── projects.ts
│   │   ├── time-entries.ts
│   │   └── invoices.ts
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useClients.ts
│   │   ├── useProjects.ts
│   │   ├── useTimeEntries.ts
│   │   └── useInvoices.ts
│   ├── stores/           # Zustand stores
│   │   ├── authStore.ts
│   │   └── timerStore.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   └── utils/            # Utility functions
│       ├── cn.ts
│       ├── format.ts
│       └── constants.ts
│
└── public/               # Static assets
```

## 🎨 Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Zustand** - State management
- **TanStack Query** - Server state
- **Axios** - HTTP client
- **next-themes** - Dark mode

## 🧩 Key Components

### Authentication

- Email/password login
- OAuth (Google, GitHub)
- Protected routes
- Token management

### Dashboard

- Responsive sidebar
- Breadcrumb navigation
- Theme toggle
- User menu

### Timer

- Real-time tracking
- Persistent state
- Start/stop/pause
- Project selection

### Invoices

- Generate from time entries
- PDF download
- Status management
- Client filtering

## 📱 Responsive Design

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

All components are fully responsive with mobile-first design.

## 🌓 Dark Mode

Full dark mode support using `next-themes`:

- System preference detection
- Manual toggle
- Persistent across sessions

## 🏗️ Building

```bash
npm run build
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variable:

```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

4. Deploy automatically

## 🎨 Styling

### Component Library

Using shadcn/ui for:

- Buttons, inputs, cards
- Dialogs, dropdowns, sheets
- Tables, forms, toasts

### CSS Variables

Theme colors defined in `app/globals.css`

## 📦 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
```

## 🔧 Configuration

### TypeScript

- Strict mode enabled
- Path aliases configured (`@/*`)

### ESLint

- Next.js recommended rules
- TypeScript support

### Prettier

- Auto-formatting on save
- Tailwind CSS plugin

## 🤝 Contributing

1. Follow existing code style
2. Use TypeScript types
3. Add tests for new features
4. Update documentation

## 📄 License

MIT License

---
