# FitTrack Gym Manager

A gym management web application built with React + Vite, TanStack Router, TailwindCSS v4, and shadcn/ui components.

## Project Overview

FitTrack is a full-featured gym management system with two roles:
- **Owner**: Can manage members, trainers, plans, attendance, revenue, and settings
- **Trainer**: Can view members and attendance

All data is stored in the browser's localStorage — no backend or database required.

## Architecture

- **Framework**: React 19 + TanStack Router (file-based routing)
- **Build Tool**: Vite 7 with standard `@vitejs/plugin-react` and `@tailwindcss/vite`
- **Styling**: TailwindCSS v4 + shadcn/ui components
- **Language**: TypeScript
- **Entry Point**: `index.html` → `src/main.tsx`

## Project Structure

```
index.html            # HTML entry point
src/
  main.tsx            # React entry point (ReactDOM.createRoot)
  router.tsx          # TanStack Router setup
  routeTree.gen.ts    # Auto-generated route tree (do not edit manually)
  styles.css          # Global styles + Tailwind
  routes/             # TanStack Router file-based routes
    __root.tsx        # Root layout component
    index.tsx         # Redirects to /login or /dashboard
    login.tsx         # Login page (Owner/Trainer roles)
    signup.tsx        # Gym registration
    forgot-password.tsx
    _owner.tsx        # Owner layout wrapper
    _owner.dashboard.tsx
    _owner.members.index.tsx
    _owner.members.$id.tsx
    _owner.members.new.tsx
    _owner.plans.tsx
    _owner.revenue.tsx
    _owner.attendance.tsx
    _owner.trainers.tsx
    _owner.settings.tsx
    _trainer.tsx      # Trainer layout wrapper
    _trainer.trainer.members.tsx
    _trainer.trainer.attendance.tsx
  components/
    AppShell.tsx      # Main navigation shell
    ui/               # shadcn/ui component library
  hooks/
    use-mobile.tsx
  lib/
    store.ts          # Core localStorage state management
    types.ts          # TypeScript types
    useStore.ts       # React hook for store
    theme.ts          # Dark mode management
    utils.ts          # Utility functions
```

## Development

```bash
npm run dev    # Start dev server on port 5000
npm run build  # Build for production
```

## Configuration

- Dev server: `0.0.0.0:5000` with `allowedHosts: true` (for Replit proxy)
- Deployment: Static site build to `dist/`
- Vite config: `vite.config.ts` (standard Vite + TanStack Router plugin)
