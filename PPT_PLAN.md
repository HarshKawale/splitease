# SplitEase — PPT Presentation Plan

## 📌 Project Overview

| Field | Details |
|---|---|
| **Project Name** | SplitEase |
| **Tagline** | Effortless Expense Sharing |
| **Type** | Full-Stack Web Application |
| **Frontend** | HTML, CSS (Glassmorphism), Bootstrap 5, jQuery, JavaScript |
| **Backend** | Node.js, Express.js 5 |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT + bcrypt password hashing |

---

## 🎨 Recommended PPT Design

- **Color Palette**: Teal (#5EA8A7), Dark Teal (#277884), Coral (#FE4447), White (#FFFFFF)
- **Font**: Arial or Calibri (clean, professional)
- **Style**: Modern, minimal with accent color highlights
- **Slide Size**: 16:9 widescreen

---

## 📊 Slide-by-Slide Plan (10 Slides)

---

### Slide 1: Title Slide

**Title:** SplitEase — Effortless Expense Sharing  
**Subtitle:** A Full-Stack Web Application for Group Expense Management  
**Bottom:** Your Name | College Name | Course | Date  
**Design:** Large gradient text title, app icon (piggy bank 🐷), clean minimal background

---

### Slide 2: Problem Statement

**Title:** The Problem

**Bullet Points:**
- Splitting bills manually is error-prone and awkward
- Tracking who paid what across multiple trips/events is tedious
- People forget debts, leading to friction in friendships
- No easy way to settle up digitally among friends

**Design:** Icon-based layout with a sad/confused emoji or illustration

---

### Slide 3: Proposed Solution

**Title:** Our Solution — SplitEase

**Bullet Points:**
- Create groups for trips, home, couples, or any shared expense
- Add expenses and automatically split among members
- Built-in wallet system for easy settlements
- Real-time balance tracking — see who owes whom instantly

**Design:** Feature highlight with 3-4 icons in a row (Group → Expense → Split → Settle)

---

### Slide 4: Technology Stack

**Title:** Technology Stack

**Layout:** Visual cards/icons for each technology:

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | HTML, CSS, Bootstrap 5, JS, jQuery | Responsive UI with glassmorphism design |
| **Backend** | Node.js + Express.js 5 | RESTful API server |
| **Database** | MongoDB + Mongoose | NoSQL document storage |
| **Auth** | JWT + bcrypt | Secure token-based authentication |
| **Server** | Flask (Python) | Static file serving (alternate entry point) |

**Design:** Tech logos arranged in a layered architecture diagram

---

### Slide 5: System Architecture

**Title:** System Architecture

**Diagram (draw this):**

```
┌─────────────┐     HTTP/JSON     ┌─────────────────┐     Mongoose     ┌──────────┐
│   Browser   │ ◄──────────────► │  Express.js API  │ ◄─────────────► │ MongoDB  │
│  (HTML/CSS/ │                  │   (Port 4000)    │                 │          │
│   JS/jQuery)│                  │                  │                 │          │
└─────────────┘                  └─────────────────┘                 └──────────┘
                                        │
                                   JWT Auth
                                   Middleware
```

**API Routes to mention:**
- `/api/auth` — Signup, Login, Current User
- `/api/groups` — CRUD groups, balance calculation
- `/api/expenses` — Add/list expenses with splits
- `/api/wallet` — Add money, wallet payments
- `/api/summary` — Dashboard aggregations

---

### Slide 6: Key Features

**Title:** Key Features

**Layout:** 6 feature cards (2 rows × 3 columns):

| # | Feature | Description |
|---|---|---|
| 1 | 🔐 **User Authentication** | Signup/Login with JWT tokens and bcrypt password hashing |
| 2 | 👥 **Group Management** | Create groups (Trip, Home, Couple, Other), add members by email |
| 3 | 💰 **Expense Tracking** | Add expenses with description, amount, category, and payer |
| 4 | ➗ **Auto Split** | Automatically split bills equally among all group members |
| 5 | 💳 **Wallet System** | Add money to wallet, settle debts directly from wallet balance |
| 6 | 📊 **Balance Summary** | Real-time balance tracking — who owes whom and how much |

---

### Slide 7: Database Design

**Title:** Database Schema

**3 Models (show as ER-style boxes):**

#### User Model
```
User {
  name:          String (required)
  email:         String (unique, required)
  password:      String (hashed, min 6 chars)
  walletBalance: Number (default: 0)
  isActive:      Boolean (default: true)
  address:       { street, city, zipCode }
  createdAt:     Date
}
```

#### Group Model
```
Group {
  name:      String (required)
  type:      Enum ['trip', 'home', 'couple', 'other']
  members:   [ObjectId → User]  (references)
  createdBy: ObjectId → User
  createdAt: Date
}
```

#### Expense Model
```
Expense {
  groupId:     ObjectId → Group
  description: String
  amount:      Number
  paidBy:      ObjectId → User
  splits:      [{ userId: ObjectId, share: Number }]
  kind:        Enum ['expense', 'payment']
  createdAt:   Date
}
```

**Relationships:**
- User ←→ Group (many-to-many via `members` array)
- Group ←→ Expense (one-to-many via `groupId`)
- User ←→ Expense (one-to-many via `paidBy`)

---

### Slide 8: UI Screenshots / Demo

**Title:** User Interface

**Show screenshots of these pages:**

1. **Landing Page** (`home.html`) — Welcome screen with feature cards and Login/Signup buttons
2. **Login Page** (`login.html`) — Glassmorphism login form with email/password
3. **Dashboard** (`index.html`) — Welcome section, quick stats (owed/owing/groups), wallet, group cards
4. **Group Detail** (`group-detail.html`) — Add expense form, expense list, members sidebar, balance summary, wallet payment

**Design:** 2×2 grid of screenshots with labels, or a carousel layout

---

### Slide 9: Future Enhancements

**Title:** Future Scope

**Bullet Points:**
- 🌙 **Dark Mode** — Toggle between light and dark themes
- 💸 **Payment Gateway** — Integrate UPI/Razorpay for real payments
- 📱 **Mobile App** — React Native or Flutter version
- 📧 **Email Notifications** — Automated reminders for pending settlements
- 📈 **Expense Analytics** — Charts and graphs for spending insights
- 🔍 **Expense Categories & Filters** — Filter by food, transport, etc.
- 👥 **Friends System** — Add friends globally, not just per group

---

### Slide 10: Thank You / Q&A

**Title:** Thank You!

**Content:**
- "Questions & Feedback Welcome"
- Your Name
- Email / Contact Info
- GitHub Repository Link

**Design:** Clean minimal slide with gradient accent bar

---

## 📁 Pages in the Project

| Page | File | Purpose |
|---|---|---|
| Landing / Welcome | `v1/home.html` | Marketing page with features |
| Login | `v1/login.html` | User login form |
| Signup | `v1/signup.html` | User registration form |
| Dashboard | `v1/index.html` | Main dashboard with groups & wallet |
| Group Detail | `v1/group-detail.html` | Expense management per group |
| Settings | `v1/settings.html` | User profile settings |
| Activity | `v1/activity.html` | Recent activity feed |
| Friends | `v1/friends.html` | Friends list |

---

## 📁 Backend Structure

```
backend/
├── server.js              # Express app entry point (port 4000)
├── .env                   # MongoDB URI + JWT secret
├── package.json           # Dependencies
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User schema
│   ├── group.js           # Group schema
│   └── expense.js         # Expense schema
└── routes/
    ├── auth.routes.js     # Signup, Login, /me
    ├── group.routes.js    # CRUD groups + balance calc
    ├── expense.routes.js  # Add/list expenses
    ├── wallet.routes.js   # Add money, wallet pay
    ├── summary.routes.js  # Dashboard aggregations
    ├── user.routes.js     # User profile operations
    └── api.js             # API index
```

---

## 🔑 Key Technical Highlights (mention in PPT if needed)

1. **Glassmorphism UI** — Modern frosted-glass card design with floating orb animations
2. **JWT Auth Flow** — Stateless authentication with 7-day token expiry
3. **Balance Calculation Algorithm** — Server-side balance computation using paid vs owed logic per group
4. **Wallet Settlement** — Users can pay debts directly from their in-app wallet
5. **RESTful API Design** — Clean REST endpoints with proper HTTP status codes (201, 400, 401, 403, 404, 500)
6. **Password Security** — bcrypt with 10 salt rounds for secure hashing
