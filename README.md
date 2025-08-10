# 🧳 ReConnect - Lost & Found Portal

A modern, full-stack web application for reporting and reuniting lost and found items with advanced features including secure authentication, real-time notifications, and intelligent claim handling.

**Live Demo**: [reconnect-lost-found.vercel.app](https://reconnect-lost-found.vercel.app)

---

## 🚀 Features

### 🔐 **Secure Authentication & User Management**
- **Email & Password Authentication** via Supabase Auth
- **User Profile Management** with customizable settings
- **Session Management** with secure token handling
- **Password Reset** functionality

### 📝 **Comprehensive Item Reporting**
- **Lost & Found Item Reporting** with rich details
- **Multi-image Upload** support with cloud storage
- **Location Tracking** with Google Maps integration
- **Category Classification** (Electronics, Documents, Clothing, etc.)
- **Status Tracking** (Lost, Found, Claimed, Reunited)
- **Date Tracking** for when items were lost/found

### 🔍 **Advanced Search & Discovery**
- **Real-time Search** across titles, descriptions, and locations
- **Smart Filtering** by category, location, date range, and status
- **Interactive Map View** for location-based browsing
- **Responsive Grid Layout** optimized for all devices

### 🤝 **Intelligent Claim System**
- **Secure Claim Submission** with unique identifier verification
- **Multi-step Claim Process** with detailed reasoning
- **Real-time Notifications** for claim status updates
- **Claim Management Dashboard** for both claimers and item owners
- **Approval/Rejection Workflow** with automated notifications

### 📊 **User Dashboard**
- **Personal Item Management** with edit/delete capabilities
- **Claim Tracking** for submitted and received claims
- **Statistics Overview** showing items reunited and active claims
- **Quick Actions** for reporting new items and managing existing ones

### 🔔 **Real-time Notifications**
- **Email Notifications** for claim updates
- **In-app Notifications** for immediate feedback
- **Claim Status Updates** with detailed information
- **Item Reunited Confirmations** with celebration animations

### 🎨 **Modern UI/UX**
- **Responsive Design** that works on all devices
- **Dark/Light Theme Toggle** with system preference detection
- **Smooth Animations** and transitions
- **Glass-morphism Design** with modern aesthetics
- **Accessibility Features** for inclusive design

---

## 🏗️ **Architecture & Tech Stack**

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **ShadCN/UI** for consistent component design
- **Framer Motion** for animations
- **React Router** for navigation

### **Backend**
- **Supabase** for:
  - **PostgreSQL Database** with real-time subscriptions
  - **Authentication & Authorization**
  - **File Storage** for images
  - **Edge Functions** for serverless operations
- **Supabase Client SDK** for seamless integration

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
```

---

## 📁 **Project Structure**

```
reconnect-lost-found/
├── src/
│   ├── components/
│   │   ├── ui/           # ShadCN UI components
│   │   ├── AuthForm.tsx
│   │   ├── ReportItemForm.tsx
│   │   ├── ItemCard.tsx
│   │   ├── ClaimModal.tsx
│   │   └── Dashboard/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Browse.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ReportItem.tsx
│   │   └── Auth.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── LostFoundContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── styles/
├── public/
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account and project

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/m-umer-mustafa/ReConnect-lost-and-found.git
cd reconnect-lost-found
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Environment Setup**
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Database Setup**
Run the SQL schema provided above in your Supabase project

5. **Start development**
```bash
npm run dev
```

### **Deployment**

1. **Build for production**
```bash
npm run build
```

2. **Deploy to Vercel**
```bash
npm run deploy
```

---

## 🔧 **Development Commands**

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 📊 **Performance Metrics**

- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: Optimized with code splitting

---

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) for details.

---

## 📞 **Support & Contact**

- **Issues**: [GitHub Issues](https://github.com/m-umer-mustafa/ReConnect-lost-and-found.git/issues)
- **Email**: muhammadomermustafa@gmail.com

---

## 🙏 **Acknowledgments**

- **Supabase** for the amazing backend platform
- **ShadCN/UI** for the beautiful component library
- **Tailwind CSS** for the utility-firstI have gathered the following information about the project and its features from the 
