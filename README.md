# ReConnect - Lost and Found Portal

ReConnect is a full-stack lost-and-found web app for reporting items, discovering possible matches, and managing secure claims.

Live demo: https://reconnect-lost-found.vercel.app

## Features

- Secure authentication with Supabase Auth
- Lost/found item reporting with images and rich metadata
- Search and filtering by text, date, category, status, and type
- Claim workflow with approval/rejection and user notifications
- User dashboard for item and claim management
- Real-time in-app notifications
- Theme support (light/dark)
- Responsive UI optimized for desktop and mobile (including 320-430px refinements)

## Recent UI and Mobile Updates

This project includes a major UI refresh focused on a clean modern style and stronger mobile ergonomics:

- Unified token-driven theme system in [src/index.css](src/index.css)
- Improved section boundaries and panel hierarchy
- Route-level background consistency (single grid source in layout)
- Report page contextual mood background for lost/found state
- Mobile-first spacing and typography tuning across key pages
- Compact modal/popover behavior for narrow phone widths

## Tech Stack

Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui + Radix UI
- React Router
- TanStack Query
- Sonner + shadcn toast

Backend / Services
- Supabase
  - Postgres database
  - Authentication
  - Realtime subscriptions
  - Storage (item images)
  - Edge Functions (account deletion hook)

### **Database Schema**
```sql
-- Items Table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  date_lost_found DATE,
  status TEXT CHECK (status IN ('lost', 'found', 'claimed', 'reunited')),
  type TEXT CHECK (type IN ('lost', 'found')),
  images TEXT[],
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claims Table
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id),
  claimer_id UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  unique_identifiers TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

```

## Project Structure

```text
src/
  components/
    ui/
    AuthForm.tsx
    BellNotifications.tsx
    ClaimModal.tsx
    EditItemModal.tsx
    Footer.tsx
    Header.tsx
    ItemCard.tsx
    SettingsModal.tsx
  context/
    AuthContext.tsx
    LostFoundContext.tsx
    ThemeContext.tsx
  hooks/
  lib/
    supabaseClient.ts
    types.ts
    utils.ts
  pages/
    Auth.tsx
    Blog.tsx
    Browse.tsx
    Dashboard.tsx
    Home.tsx
    ReportItem.tsx
  utils/
    validation.ts
    passwordStrength.ts
```

## Getting Started

Prerequisites
- Node.js 18+
- npm
- Supabase project

1. Clone repository

```bash
git clone https://github.com/m-umer-mustafa/ReConnect-lost-and-found.git
cd ReConnect-lost-and-found
```

2. Install dependencies

```bash
npm install
```

3. Create `.env`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start development server

```bash
npm run dev
```

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run build:dev
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Notes for Contributors

- App-wide grid background is applied in layout ([src/App.tsx](src/App.tsx)); avoid reapplying `graph-paper-bg` inside routed pages to prevent visual double-draw.
- Keep mobile breakpoints in mind when adjusting paddings and fixed-width overlays.
- Prefer updating shared tokens/utilities in [src/index.css](src/index.css) before adding one-off styles.

## Deployment

Build:

```bash
npm run build
```

Deploy to your preferred host (Vercel recommended).

## License

MIT

## Support

- Issues: https://github.com/m-umer-mustafa/ReConnect-lost-and-found/issues
- Email: muhammadomermustafa@gmail.com
