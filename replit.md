# FitTrack Gym Manager

A gym management web application built with TanStack Start (React + Vite), TailwindCSS, and shadcn/ui components.

## Project Overview

FitTrack is a full-featured gym management system with two roles:
- **Owner**: Can manage members, trainers, plans, attendance, revenue, and settings
- **Trainer**: Can view members and attendance

## Architecture

- **Framework**: TanStack Start (React 19 + TanStack Router)
- **Build Tool**: Vite 7 with `@lovable.dev/vite-tanstack-config`
- **Styling**: TailwindCSS v4 + shadcn/ui components
- **Language**: TypeScript

## Project Structure

```
src/
  routes/           # TanStack Router file-based routes
    __root.tsx      # Root layout with HTML shell
    index.tsx       # Redirects to login
    login.tsx       # Login page (Owner/Trainer roles)
    signup.tsx      # Gym registration
    forgot-password.tsx
    _owner.tsx      # Owner layout
    _owner.dashboard.tsx
    _owner.members.index.tsx
    _owner.members.$id.tsx
    _owner.members.new.tsx
    _owner.plans.tsx
    _owner.revenue.tsx
    _owner.attendance.tsx
    _owner.trainers.tsx
    _owner.settings.tsx
    _trainer.tsx    # Trainer layout
    _trainer.trainer.members.tsx
    _trainer.trainer.attendance.tsx
  components/
    AppShell.tsx    # Main navigation shell
    ui/             # shadcn/ui component library
  hooks/
    use-mobile.tsx
  styles.css        # Global styles + Tailwind
  routeTree.gen.ts  # Auto-generated route tree
```

## Development

```bash
npm run dev    # Start dev server on port 5000
npm run build  # Build for production
```

## Configuration

- Dev server: `0.0.0.0:5000` with `allowedHosts: true` (for Replit proxy)
- Deployment: Static site build to `dist/`
- Vite config: `vite.config.ts` (uses `@lovable.dev/vite-tanstack-config`)
