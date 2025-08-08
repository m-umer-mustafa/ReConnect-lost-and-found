Here’s a clean and professional `README.md` for your **Lost & Found System** with all the features and deployment details you described, styled to match modern GitHub projects:

---

```md
# 🧳 Lost & Found Portal

A full-stack web application for reporting lost or found items, with built-in authentication, secure claim handling, and real-time status tracking.

Live Demo: [lostandfound.vercel.app](https://lostandfound.vercel.app)

---

## 🚀 Features

- 🔐 **Secure Authentication** (Email + Password via Supabase)
- 📝 **Add Lost or Found Items**
  - Title, description, location
  - Upload image (optional)
  - Set status: `lost`, `found`, `claimed`
- 📅 **Track Item Dates**
  - Date item was lost or found
- 🔍 **Claim Items**
  - Submit unique identifying signs + reason
  - Notification sent to uploader
  - Uploader can approve or reject claims
- 🌍 **Location Tracking**
  - Attach city/area where item was found/lost
- ✨ **Responsive UI with Soothing Theme**
- 🧼 **Blurred Modals + Smooth Animations**
- ⚡ **Deployed on Vercel**


## 🔧 Tech Stack

### Frontend:
- **React (TypeScript)** with Vite
- **Tailwind CSS** for styling
- **ShadCN/UI** components
- **Framer Motion** for animations

### Backend:
- **Supabase** (auth + database + storage)
- **Supabase client SDK** for integration

## 📁 Folder Structure

src/
│
├── components/        # Reusable UI components
├── pages/             # Page-level views (Home, AddItem, etc.)
├── lib/               # Supabase client + utilities
├── styles/            # Tailwind + custom themes
└── App.tsx            # App entry

````

---

## ⚙️ Getting Started (Local)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/lost-and-found.git
cd lost-and-found
````

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

* Go to [supabase.io](https://supabase.io) and create a new project.
* Create a table `items` with columns:

  * `id`, `title`, `description`, `image`, `status`, `location`, `date`, `created_by`
* Enable **Email Auth** in Supabase Auth settings.
* Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` in a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the app

```bash
npm run dev
```

---

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Connect your repo on [vercel.com](https://vercel.com)
3. Set the following environment variables in Vercel dashboard:

   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Deploy ✅

---

## 🔒 Security

* Supabase handles secure auth + session tokens
* Users can’t claim their own items
* Claims must include proof text
* Uploads are stored securely with public access off

---

## 📬 Contact

Created by [Omer Mustafa](https://portfolio-zeta-olive-be5w7e5bhg.vercel.app/)
For issues, open an [issue](https://github.com/m-umer-mustafa) or contact via email.

---

## 📜 License

MIT © 2025

```
