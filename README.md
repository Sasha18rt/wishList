# Wishlify 🎁

**Wishlify** is a full-stack web application for creating, sharing, and reserving wishlists. Users can share their wishlists publicly, and others can anonymously reserve gifts — without revealing who booked what.

## 🌐 Live Preview

[https://wishlify.me](https://wishlify.me)

## 🛠 Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: API Routes (Next.js)
- **Database**: MongoDB (Mongoose)
- **Authentication**: NextAuth (Google OAuth)
- **Cloud**: Cloudinary (image uploads)
- **Other**: TypeScript, ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB URI
- Cloudinary account
- Google OAuth credentials

### Installation

```bash
git clone https://github.com/Sasha18rt/wishList
cd wishList
npm install
```

### Environment Variables

Create a `.env.local` file and add:

```env
MONGODB_URI=your_mongo_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
NEXTAUTH_SECRET=your_nextauth_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Features

- Create and manage personal wishlists
- Share wishlists with others via public links
- Allow anonymous users to reserve gifts
- Google authentication
- Fully responsive UI

## 📁 Project Structure (Simplified)

```
app/              # Next.js routing & pages
components/       # Reusable UI components
models/           # Mongoose schemas
libs/             # DB and Cloudinary utilities
types/            # TypeScript types
```

## 🎓 Academic Context

This project was created as part of coursework at **Vilnius University, Faculty of Mathematics and Informatics**, supervised by **Dr. Andrius Misiukas Misiūnas**.  
Title: *“Wishlist & Gift-Sharing Web App”*, 2025

## ✨ Author

- GitHub: [@Sasha18rt](https://github.com/Sasha18rt)
- Live Project: [wishlify.me](https://wishlify.me)

