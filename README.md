# CraveCups Coffee & Bakery Web Application

CraveCups is a modern, high-performance, full-stack online ordering web application for an artisan coffee house and bakery. Built with React, TypeScript, Tailwind CSS, Express, and Google Gemini AI, CraveCups provides an interactive ordering experience with real-time order tracking, custom drink builders, secure user authentication, and desktop & mobile responsive layouts.

---

## 🌟 Key Features

### ☕ 1. Interactive Menu & Customization Builder
- **Multi-Category Browsing**: Filter through Espresso & Coffee, Cold Brew & Iced Teas, Bakery & Pastries, Signature Craves, and Seasonal Specials.
- **Granular Customization**: Custom modal enabling choice of sizes (Small, Medium, Large), temperatures (Hot, Iced), milk options (Oat Milk, Whole Milk, Almond Milk, Coconut Milk), sweetness levels (0%, 25%, 50%, 75%, 100%), and gourmet extras (Extra Espresso Shot, Vanilla Syrup, Caramel Drizzle, Whipped Cream, Oat Foam).
- **Fast Search & Dietary Tags**: Filter items instantly by keyword or tags such as `#Vegan`, `#GlutenFree`, `#TopRated`, and `#Organic`.

### 🔐 2. Security & User Authentication System
- **Registration & Login**: Secure password hashing (`PBKDF2` with `SHA-512` and unique salt per user) handled server-side.
- **Session Tokens**: Generates 256-bit cryptographically secure session tokens for stateful user persistence (`/api/auth/me`).
- **Registered Users & Security Audit Directory**: Built-in admin directory (`Users & Logs` modal) displaying registered members, login counts, contact details, favorite drinks, and a real-time security login audit stream.

### 🛵 3. Order Success & Progress Tracking Engine
- **Delivery & Self-Pickup Toggles**: Select between doorstep bike delivery (~25 mins) or counter pickup at 742 Market St.
- **4-Step Live Stepper**:
  1. 🧾 **Order Confirmed** — Receipt verified & queued.
  2. ☕ **Brewing Your Order** — Handcrafted fresh by specialist baristas.
  3. 🛵 **Out for Delivery / Ready for Pickup** — On courier bike or waiting at counter.
  4. 🎉 **Order Completed** — Delivered or collected.
- **Interactive Courier Map**: Visual tracker mapping courier movement from the coffee shop to destination.
- **Barista Simulator / Testing Panel**: Advance order status live with real-time polling updates.

### 🤖 4. Gemini AI Barista Assistant
- Powered by Google Gemini AI API (`@google/genai`) on Express server proxy routes.
- Recommends personalized beverages based on mood, time of day, flavor preferences, and dietary restrictions.

### 🖥️ 5. Desktop & Mobile Optimized Layouts
- **Responsive 2 to 4-Column Grid**: Smoothly scales menu cards across mobile, tablet, and ultra-wide screens.
- **Permanent Desktop Cart Sidebar**: Shopping cart anchors to the right sidebar on desktop screens (`lg:block`), while behaving as a smooth slide-over drawer on mobile devices.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend**: Express.js (Node.js runtime with `tsx` in dev and `esbuild` CommonJS bundling for production)
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Security**: Cryptographic password hashing (`pbkdf2Sync`), Bearer tokens

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

---

## 🔑 Quick Demo Credentials

For testing authentication and admin views:
- **Demo Customer**:
  - **Email**: `sarah.crave@example.com`
  - **Password**: `coffee123`
- **Demo Admin**:
  - **Email**: `admin@cravecups.com`
  - **Password**: `admin123`
