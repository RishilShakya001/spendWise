# 🎓 SpendWise: Campus Budget & Expense Tracker

A premium, feature-rich **MERN stack** web application designed to help college students manage their campus finances, track category-specific spending limits, log roommate split ledgers, commit to savings targets, and generate analytical financial reports.

---

## ✨ Features

### 📊 1. Student Dashboard & Insights
* **Interactive Recharts Widgets:** Real-time visual comparison of monthly incomes vs. outflows.
* **AI-Simulated Financial Advisor:** Personalized tips for savings optimization based on current campus spending patterns.
* **Quick Stats:** At-a-glance visibility of net savings, active debt/loan status, and budget safety percentages.

### 💸 2. Categorized Transaction Ledgers
* **Income Log:** Categorized sources (e.g., Pocket Money, Freelance, Scholarships) with easy searching.
* **Expense Log:** Searchable transaction history with payment mode tracking (UPI, Cash, Card) and receipt links.

### 🛡️ 3. Category-Specific Budgets (Guardrails)
* **Custom Category Limits:** Set individual limits on core campus expenses (e.g., Food, Entertainment, Stationery, Hostel).
* **Smart Alerts:** Auto-triggers a **Yellow indicator** when category spending crosses **80%** of limit, and a **Red tag** when **over-budget**.

### 🤝 4. Roommate Split Ledger (Lent & Borrowed)
* **Friend Debt Manager:** Log money lent or borrowed from classmates.
* **Dynamic Net Status:** Renders a summary of net receivables/payables.
* **One-Click Resolves:** Instantly toggle friend transaction status between *Pending* and *Resolved*.

### 🎯 5. Savings Goals Tracker
* **Deadline Tracking:** Set target amounts and deadlines for specific purchases (e.g., new laptop, semester books).
* **Animated Progress Bars:** Visually track how close you are to reaching a savings milestone.
* **Contribute Form:** Quick-contribute funds directly from your dashboard balance.

### 📈 6. Monthly Reports & PDF Exports
* **Category Breakdown:** Rendered via interactive Pie Charts.
* **Spending Trends:** Line chart tracking daily expenses over the month.
* **Print PDF Summary:** Export clean, invoice-like printable financial summaries.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, Vite, TailwindCSS, Recharts, Lucide Icons, date-fns, Axios.
* **Backend:** Node.js, Express, MongoDB (Mongoose schemas), JSON Web Tokens (JWT).

---

## 🚀 Installation & Local Setup

### Prerequisites
* **Node.js** (LTS version recommended)
* **MongoDB** (running locally or a remote MongoDB Atlas URI)

---

### 1. Backend Configuration (Express API Server)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` variables:
   ```env
   PORT=4001
   MONGO_URI=mongodb://localhost:27017/expenseTracker
   JWT_SECRET=your_super_secret_key_change_me
   FRONTEND_ORIGIN=http://localhost:5173
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will run at `http://localhost:4001` (Health check at `/health`).*

---

### 2. Frontend Configuration (React App)

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The site will launch at `http://localhost:5173`. If port `5173` is occupied, Vite will automatically fall back to `http://localhost:5174` (CORS policies dynamically support both).*

---

## 🔐 Authentication & Session Notes
* **JWT Guardrails:** Requests to protected backend endpoints require a valid JSON Web Token in the headers (`Authorization: Bearer <token>`).
* **Route Protection:** If your session token expires or becomes invalid, SpendWise automatically deletes local storage auth items and redirects you to the login screen.
