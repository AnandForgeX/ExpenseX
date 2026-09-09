# ExpenseX – Smart Cloud Expense Tracker 💰

A modern, responsive, and secure personal finance tracker built with **HTML5**, **Tailwind CSS**, **Vanilla JavaScript**, and backed by **Supabase PostgreSQL & Supabase Authentication**.

Upgraded from a local storage project to a real-world SaaS finance dashboard with Row Level Security (RLS).

---

## 🚀 Features

- **Supabase Authentication**:
  - Secure User Registration & Login (No passwords stored on client).
  - Persistent login sessions with automatic token refresh.
  - Automatic redirect for unauthenticated users.
- **Supabase PostgreSQL Database**:
  - Dedicated `transactions` table with UUID primary keys.
  - **Row Level Security (RLS)** strictly enforcing that users can only access, modify, and delete their own records.
- **Dynamic Category Handling**:
  - **Income**: Pocket Money, Salary, Scholarship, Gift, Freelance, Other Income.
  - **Expense**: Food, Travel, Shopping, Education, Bills, Other Expense.
  - *Pocket Money is strictly excluded from Expense dropdown.*
- **Modern SaaS Dashboard**:
  - Net Balance, Total Income, Total Expenses, and Transaction Count metric cards.
  - Current Month Outflow and Most Used Expense Category insight widgets.
  - Animated Toast notification system.
  - Loading skeleton states & custom empty state illustration with quick-add CTA.
- **Transactions Management**:
  - Responsive desktop table + mobile card layout.
  - Full Edit Transaction modal and Delete confirmation modal.
  - Real-time search by description/category and multi-filtering (All/Income/Expense, Category, Month).
  - Chronological sorting (newest first).

---

## 📂 Project Structure

```text
ExpenseX/
│
├── index.html            # Main UI & responsive dashboard markup
├── script.js             # Core Vanilla JS logic & Supabase client integration
├── style.css             # Inter font, animations, modal & toast styles
├── supabase_schema.sql   # PostgreSQL table & RLS policies script
└── README.md             # Project documentation & setup instructions
```

---

## 🛠️ Supabase Setup Guide (Step-by-Step)

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and click **Sign In** or **Start your project**.
2. Click **New Project**.
3. Choose an organization, enter a project name (e.g., `ExpenseX`), and set a secure database password.
4. Select your closest region (e.g., `South Asia (Mumbai)` or nearest) and click **Create new project**.

### Step 2: Run the SQL Schema & RLS Policies
1. In your Supabase project dashboard, navigate to the **SQL Editor** from the left sidebar.
2. Click **New Query**.
3. Copy all contents of [supabase_schema.sql](supabase_schema.sql) and paste them into the SQL editor.
4. Click **Run** (or press `Ctrl + Enter`).
5. You should see `Success. No rows returned`. The `transactions` table and 4 secure RLS policies are now live!

### Step 3: Configure Authentication Settings
1. In the left sidebar, click **Authentication** -> **Providers** -> **Email**.
2. Make sure **Enable Email provider** is turned **ON**.
3. *(Optional for testing)*: Under **Authentication** -> **URL Configuration**, you can disable "Confirm email" if you want users to be logged in immediately without verifying email.

### Step 4: Connect Supabase to the Website
1. Go to **Project Settings** (gear icon at bottom left) -> **API**.
2. Copy the **Project URL** (e.g., `https://xyzcompany.supabase.co`).
3. Copy the **anon / public** API Key.
4. Open [script.js](script.js) in your code editor and paste them into the top section:

```javascript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```
5. Save `script.js`.

---

## 🧪 Testing Checklist

### 1. User Registration & Login
1. Open `index.html` in your browser (e.g., via VS Code Live Server or double click).
2. The **Auth Screen** will appear.
3. Click **Create Account**, enter your Name, Email, and Password (min 6 characters), and click **Sign Up Free**.
4. You will see a success toast and will be taken straight to your dashboard.
5. Click **Logout** at the top right -> Verify you are returned to the Auth Screen.
6. Enter your credentials into **Sign In** -> Verify you are successfully logged back in.

### 2. Adding Transactions
1. Under **Add New Transaction**, choose **Income** -> check Category dropdown -> Notice **Pocket Money** is available.
2. Choose **Expense** -> check Category dropdown -> Notice **Pocket Money** is NEVER shown.
3. Fill out Amount (`500`), Description (`Dinner with friends`), Date, and click **Save Transaction**.
4. Verify:
   - Success toast appears.
   - Total Expenses and Balance immediately update.
   - Transaction appears at the top of the table.

### 3. Search, Filter & Edit
1. Type a word in the search box -> table filters instantly.
2. Select **Income** or **Expense** in the Type filter -> table filters dynamically.
3. Click the **Edit (pencil icon)** on a transaction -> change amount or description -> click **Save Changes**. Verify update in table.

### 4. Delete & Security
1. Click the **Delete (trash icon)** on a transaction -> Delete confirmation modal appears -> click **Delete**.
2. Open your Supabase Dashboard -> **Table Editor** -> `transactions`. You will see all transactions linked with your authenticated `user_id`.

---

## 🌐 Free GitHub Pages Deployment Instructions

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Upgrade ExpenseX with Supabase and modern UI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/expensex.git
   git push -u origin main
   ```
2. In your GitHub repository, click **Settings** -> **Pages** (in the left sidebar).
3. Under **Branch**, select `main` and root `/ (root)`.
4. Click **Save**.
5. Within 1-2 minutes, GitHub will provide your live website link (e.g., `https://your-username.github.io/expensex/`)!

---

## 📜 Academic Attribution
- **Course**: Web Application Development (WAD)
- **Project**: TAE Practical Assessment – Personal Expense Management System
- **Authorship**: ExpenseX Project
