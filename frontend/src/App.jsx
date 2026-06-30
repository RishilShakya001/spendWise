import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useNavigate, Navigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import {
  Download,
  Target,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  Sun,
  Moon,
  CreditCard,
  DollarSign,
  Wallet,
  Users,
  RefreshCw,
  CheckCircle,
  Clock,
  FileText,
  Camera,
  Save,
  X,
  Calendar,
  AlertTriangle,
  Info,
  TrendingUp,
} from "lucide-react";

const API_BASE = window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:4001/api"
  : "http://localhost:4001/api";

// Set up global Axios interceptor to automatically inject JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Redirect to login on 401 response
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/signup") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

const STUDENT_CATEGORIES = [
  "Food",
  "Transport",
  "Stationery",
  "Fees",
  "Entertainment",
  "Subscriptions",
  "Hostel",
  "Medical",
  "Other",
];

const PAYMENT_MODES = ["UPI", "Cash", "Card"];

// Custom toast system for modern user feedback (avoiding window.alert)
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-bounce ${
      type === "success" 
        ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
        : type === "error"
        ? "bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300"
    }`}>
      {type === "success" && <CheckCircle size={18} />}
      {type === "error" && <AlertTriangle size={18} />}
      {type === "info" && <Info size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <X size={14} />
      </button>
    </div>
  );
};

const SummaryCard = ({ label, value, accent, icon }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-md">
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold">
        {label}
      </span>
      <span className={`text-2xl font-bold ${accent}`}>{value}</span>
    </div>
    <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-600 dark:text-slate-300">
      {icon}
    </div>
  </div>
);

// ProtectedRoute helper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return <Navigate to="/login" replace />;
  return children;
};

// Login Component
const Login = ({ setToast }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setToast({ message: "Please fill in all fields", type: "error" });
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setToast({ message: `Welcome back, ${res.data.name}!`, type: "success" });
      setTimeout(() => { window.location.href = "/"; }, 500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Invalid email or password", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await axios.post(`${API_BASE}/auth/google`, { token: credential });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setToast({ message: `Google Sign-in Successful!`, type: "success" });
      setTimeout(() => { window.location.href = "/"; }, 500);
    } catch (err) {
      setToast({ message: "Google Authentication failed", type: "error" });
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 z-50">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white w-14 h-14 text-3xl font-bold mb-4 shadow-md">
            ₹
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">SpendWise</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-2 font-medium">Smart expense tracker for students</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="you@college.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl px-4 py-3 font-semibold hover:shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1"></div>
          <span className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-widest">or</span>
          <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1"></div>
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setToast({ message: "Google login failed", type: "error" })}
            useOneTap
            shape="pill"
            theme="filled_blue"
          />
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400">
          New to SpendWise?{" "}
          <Link to="/signup" className="text-teal-500 font-bold hover:text-teal-600 dark:text-teal-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

// Signup Component
const Signup = ({ setToast }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setToast({ message: "Please fill in all fields", type: "error" });
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setToast({ message: `Account created successfully, welcome ${res.data.name}!`, type: "success" });
      setTimeout(() => { window.location.href = "/"; }, 500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 z-50">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white w-14 h-14 text-3xl font-bold mb-4 shadow-md">
            ₹
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Join SpendWise</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-2 font-medium">Take control of your campus finances</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="Rohan Sharma"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="you@college.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl px-4 py-3 font-semibold hover:shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-500 font-bold hover:text-teal-600 dark:text-teal-400">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

// Profile Page Component
const ProfilePage = ({ setToast }) => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    collegeName: "",
    collegeYear: "",
    monthlyBudget: 10000,
    categoryBudgets: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/profile`);
        const catB = {};
        STUDENT_CATEGORIES.forEach(cat => {
          catB[cat] = res.data.categoryBudgets?.[cat] || "";
        });
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          collegeName: res.data.collegeName || "",
          collegeYear: res.data.collegeYear || "",
          monthlyBudget: res.data.monthlyBudget || 10000,
          categoryBudgets: catB,
        });
      } catch (err) {
        setToast({ message: "Failed to load profile data", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setToast]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const filteredCatBudgets = {};
      Object.entries(profile.categoryBudgets).forEach(([cat, val]) => {
        if (val !== "" && val !== null) {
          filteredCatBudgets[cat] = Number(val);
        }
      });

      const res = await axios.put(`${API_BASE}/auth/profile`, {
        name: profile.name,
        email: profile.email,
        collegeName: profile.collegeName,
        collegeYear: profile.collegeYear,
        monthlyBudget: Number(profile.monthlyBudget),
        categoryBudgets: filteredCatBudgets,
      });

      localStorage.setItem("user", JSON.stringify(res.data));
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to update profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading student profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Campus Profile & Limits</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Customize your study details and spending guardrails.</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Users size={18} className="text-teal-500" /> Academic Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">College/University Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                value={profile.collegeName}
                onChange={e => setProfile({...profile, collegeName: e.target.value})}
                placeholder="e.g. St. Stephen's College"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Study Year</label>
              <select
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                value={profile.collegeYear}
                onChange={e => setProfile({...profile, collegeYear: e.target.value})}
              >
                <option value="">Select study year</option>
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate">Postgraduate / PhD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Target size={18} className="text-teal-500" /> Monthly Budget Limits
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Global Monthly Budget (₹)</label>
            <input
              type="number"
              className="w-full md:w-1/2 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              value={profile.monthlyBudget}
              onChange={e => setProfile({...profile, monthlyBudget: e.target.value})}
              min="0"
            />
            <p className="text-xs text-gray-400 mt-1">Alerts will trigger once total spending crosses 80% of this budget.</p>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">Category-Specific Budget Limits (Optional)</label>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {STUDENT_CATEGORIES.map(cat => (
                <div key={cat} className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">{cat} (₹)</span>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-2 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    value={profile.categoryBudgets[cat] || ""}
                    onChange={e => {
                      const updated = { ...profile.categoryBudgets };
                      updated[cat] = e.target.value;
                      setProfile({ ...profile, categoryBudgets: updated });
                    }}
                    placeholder="No limit"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Transactions Unified View (for detailed analysis)
const TransactionsView = ({ type, setToast }) => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchFiltered = async () => {
    try {
      const endpoint = type === "income" ? "income/get" : "expense/get";
      const params = {};
      if (search) params.search = search;
      if (category !== "all") params.category = category;
      if (paymentMode !== "all") params.paymentMode = paymentMode;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      let res;
      if (type === "income") {
        // Income doesn't have advanced queries on the backend by default, so we filter it on client
        res = await axios.get(`${API_BASE}/income/get`);
        let filtered = res.data;
        if (search) {
          filtered = filtered.filter(i => 
            i.description.toLowerCase().includes(search.toLowerCase()) || 
            i.category.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (startDate) filtered = filtered.filter(i => new Date(i.date) >= new Date(startDate));
        if (endDate) filtered = filtered.filter(i => new Date(i.date) <= new Date(endDate));
        setTransactions(filtered.sort((a,b) => new Date(b.date) - new Date(a.date)));
      } else {
        res = await axios.get(`${API_BASE}/expense/get`, { params });
        setTransactions(res.data);
      }
    } catch (err) {
      setToast({ message: "Failed to load records", type: "error" });
    }
  };

  useEffect(() => {
    fetchFiltered();
  }, [type, search, category, paymentMode, startDate, endDate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const endpoint = type === "income" ? "income/delete" : "expense/delete";
      await axios.delete(`${API_BASE}/${endpoint}/${id}`);
      setToast({ message: "Record deleted", type: "success" });
      fetchFiltered();
    } catch (err) {
      setToast({ message: "Delete failed", type: "error" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {type === "income" ? "Earned Logs" : "Spent Logs"}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Review, filter, and manage your financial records.</p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 text-sm bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 font-medium self-start sm:self-center shadow-sm"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Search & Filters</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search note..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {type === "expense" && (
            <>
              <div>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Categories</option>
                  {STUDENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Pay Modes</option>
                  {PAYMENT_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                </select>
              </div>
            </>
          )}

          <div>
            <input
              type="date"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
          </div>

          <div>
            <input
              type="date"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">{transactions.length} Transactions Found</span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {transactions.map(t => (
            <div key={t._id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{t.description}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-slate-400">
                  <span className="font-medium px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded">{t.category}</span>
                  <span>{new Date(t.date).toLocaleDateString()}</span>
                  {t.paymentMode && (
                    <span className="inline-flex items-center gap-1">
                      <CreditCard size={12} /> {t.paymentMode}
                    </span>
                  )}
                  {t.isRecurring && (
                    <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5">
                      <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '6s' }} /> Recurring
                    </span>
                  )}
                  {t.splits?.length > 0 && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <Users size={12} /> Split ({t.splits.filter(s => s.paid).length}/{t.splits.length} Paid)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold text-lg ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400">No transactions match the selected filters.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const CATEGORY_COLORS = {
  Food: "#0d9488", // teal
  Transport: "#ea580c", // orange
  Entertainment: "#9333ea", // purple
  Subscriptions: "#e11d48", // rose
  Stationery: "#2563eb", // blue
  Fees: "#d97706", // amber
  Hostel: "#4f46e5", // indigo
  Medical: "#dc2626", // red
  Other: "#64748b", // slate
};

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Food");
  const [limit, setLimit] = useState("");
  
  const fetchBudgetData = async () => {
    try {
      const [budgetRes, expenseRes] = await Promise.all([
        axios.get(`${API_BASE}/budget`),
        axios.get(`${API_BASE}/expense/get`)
      ]);
      setBudgets(budgetRes.data);
      setExpenses(expenseRes.data);
    } catch (err) {
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!limit) return toast.error("Please enter a limit");
    try {
      await axios.post(`${API_BASE}/budget/set`, { category, limit: Number(limit) });
      toast.success(`Budget set for ${category}!`);
      setLimit("");
      fetchBudgetData();
    } catch (err) {
      toast.error("Failed to set budget");
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await axios.delete(`${API_BASE}/budget/${id}`);
      toast.success("Budget limit cleared");
      fetchBudgetData();
    } catch (err) {
      toast.error("Failed to delete budget");
    }
  };

  // Group expenses by category for current month
  const expenseSummary = useMemo(() => {
    const out = {};
    const curMonth = new Date().getMonth();
    const curYear = new Date().getFullYear();
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth() === curMonth && d.getFullYear() === curYear) {
        out[e.category] = (out[e.category] || 0) + e.amount;
      }
    });
    return out;
  }, [expenses]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading budgets...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Budget Guardrails</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Set monthly limits per category and receive alerts when crossing 80%.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Set Budget Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 h-fit">
          <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Set Limit</h2>
          <form onSubmit={handleSetBudget} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {STUDENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Monthly Limit (₹)</label>
              <input
                type="number"
                value={limit}
                onChange={e => setLimit(e.target.value)}
                placeholder="2000"
                min="0"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition text-xs shadow-sm">
              Apply Limit
            </button>
          </form>
        </div>

        {/* Categories Progress */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm md:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Monthly Limits & Usage</h2>
          <div className="space-y-6">
            {budgets.map(b => {
              const spent = expenseSummary[b.category] || 0;
              const percent = Math.min(100, Math.round((spent / b.limit) * 100));
              const isOver80 = percent >= 80;
              const isOverBudget = spent > b.limit;

              return (
                <div key={b._id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-800 dark:text-slate-200 uppercase">{b.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">₹{spent.toLocaleString()} / ₹{b.limit.toLocaleString()}</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        isOverBudget ? "bg-rose-500/10 text-rose-500" : isOver80 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {percent}%
                      </span>
                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        className="text-gray-400 hover:text-rose-500 ml-1"
                        title="Remove Limit"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden w-full relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget ? "bg-rose-500" : isOver80 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {isOverBudget ? (
                    <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">⚠️ Warning: Crossed limit by ₹{(spent - b.limit).toLocaleString()}!</span>
                  ) : isOver80 ? (
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">⚠️ Alert: Crossed 80% threshold!</span>
                  ) : null}
                </div>
              );
            })}
            {budgets.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-xs">No active category limits set. Define limits on the left to set custom guardrails.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", targetAmount: "", deadline: "" });
  const [contributeAmt, setContributeAmt] = useState({});

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/goals`);
      setGoals(res.data);
    } catch (err) {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount) return toast.error("Title and amount are required");
    try {
      await axios.post(`${API_BASE}/goals/add`, {
        title: newGoal.title,
        targetAmount: Number(newGoal.targetAmount),
        deadline: newGoal.deadline || undefined,
      });
      toast.success("Goal created successfully!");
      setNewGoal({ title: "", targetAmount: "", deadline: "" });
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      toast.error("Failed to create goal");
    }
  };

  const handleContribute = async (id, targetAmount, currentAmount) => {
    const amt = Number(contributeAmt[id]);
    if (!amt || amt <= 0) return toast.error("Enter a valid contribution amount");
    if (currentAmount + amt > targetAmount) {
      return toast.error(`Cannot contribute more than target (needs: ₹${targetAmount - currentAmount})`);
    }

    try {
      await axios.put(`${API_BASE}/goals/contribute/${id}`, { amount: amt });
      toast.success(`Contributed ₹${amt}!`);
      setContributeAmt(prev => ({ ...prev, [id]: "" }));
      fetchGoals();
    } catch (err) {
      toast.error("Contribution failed");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Delete this goals entry?")) return;
    try {
      await axios.delete(`${API_BASE}/goals/${id}`);
      toast.success("Goal deleted");
      fetchGoals();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading savings goals...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Set aside money for travel, electronics, or books.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition text-xs flex items-center gap-1.5 shadow"
        >
          {showForm ? "Close Form" : "+ Create Goal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateGoal} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm grid gap-4 sm:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Goal Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Goa Trip"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              value={newGoal.title}
              onChange={e => setNewGoal({...newGoal, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Target Amount (₹)</label>
            <input
              type="number"
              required
              placeholder="10000"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              value={newGoal.targetAmount}
              onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Deadline Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              value={newGoal.deadline}
              onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
            />
          </div>
          <button type="submit" className="sm:col-span-3 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition text-xs shadow-sm">
            Save Goal
          </button>
        </form>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {goals.map(g => {
          const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const isFinished = g.currentAmount >= g.targetAmount;
          
          return (
            <div key={g._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{g.title}</h3>
                    {g.deadline && (
                      <p className="text-[10px] text-gray-400 mt-0.5">Deadline: {format(new Date(g.deadline), "dd MMM yyyy")}</p>
                    )}
                  </div>
                  <button onClick={() => handleDeleteGoal(g._id)} className="text-gray-400 hover:text-rose-500">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-teal-500">{percent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden w-full">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 pt-1">₹{g.currentAmount.toLocaleString()} of ₹{g.targetAmount.toLocaleString()} saved</p>
                </div>
              </div>

              {!isFinished && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Contribute (₹)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={contributeAmt[g._id] || ""}
                    onChange={e => setContributeAmt(prev => ({ ...prev, [g._id]: e.target.value }))}
                  />
                  <button
                    onClick={() => handleContribute(g._id, g.targetAmount, g.currentAmount)}
                    className="px-4 py-1.5 bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 hover:bg-teal-100 font-bold rounded-xl text-xs"
                  >
                    Add Fund
                  </button>
                </div>
              )}

              {isFinished && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-3 text-center text-xs font-bold">
                  🎉 Goal Reached!
                </div>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400 text-xs">No active savings goals yet. Set up one above!</div>
        )}
      </div>
    </div>
  );
};

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "lent", friendName: "", friendEmail: "", amount: "", description: "" });

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${API_BASE}/loans`);
      setLoans(res.data);
    } catch (err) {
      toast.error("Failed to load loan data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleAddLoan = async (e) => {
    e.preventDefault();
    if (!form.friendName || !form.amount) return toast.error("Please fill required fields");
    try {
      await axios.post(`${API_BASE}/loans/add`, {
        type: form.type,
        friendName: form.friendName,
        friendEmail: form.friendEmail,
        amount: Number(form.amount),
        description: form.description,
      });
      toast.success(`Added loan entry!`);
      setForm({ type: "lent", friendName: "", friendEmail: "", amount: "", description: "" });
      setShowForm(false);
      fetchLoans();
    } catch (err) {
      toast.error("Failed to log loan");
    }
  };

  const handleToggleResolve = async (id) => {
    try {
      await axios.put(`${API_BASE}/loans/resolve/${id}`);
      toast.success("Updated loan status");
      fetchLoans();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDeleteLoan = async (id) => {
    if (!window.confirm("Delete this loan log?")) return;
    try {
      await axios.delete(`${API_BASE}/loans/${id}`);
      toast.success("Entry removed");
      fetchLoans();
    } catch (err) {
      toast.error("Remove failed");
    }
  };

  const totals = useMemo(() => {
    let lent = 0;
    let borrowed = 0;
    loans.filter(l => !l.isResolved).forEach(l => {
      if (l.type === "lent") lent += l.amount;
      else borrowed += l.amount;
    });
    return { lent, borrowed, net: lent - borrowed };
  }, [loans]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading loan tracker...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Friend Loan Tracker</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Keep tabs on who owes you money and who you need to pay back.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition text-xs flex items-center gap-1.5 shadow"
        >
          {showForm ? "Close Form" : "+ Log Loan"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
          <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Lent to collect</span>
          <span className="text-2xl font-bold text-emerald-500 mt-1 block">₹{totals.lent.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
          <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Borrowed to pay back</span>
          <span className="text-2xl font-bold text-rose-500 mt-1 block">₹{totals.borrowed.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
          <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Net Debt Balance</span>
          <span className={`text-2xl font-bold mt-1 block ${totals.net >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            ₹{totals.net.toLocaleString()}
          </span>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAddLoan} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Transaction Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({...form, type: "lent"})}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                  form.type === "lent"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                }`}
              >
                I Lent Money
              </button>
              <button
                type="button"
                onClick={() => setForm({...form, type: "borrowed"})}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                  form.type === "borrowed"
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-gray-50 dark:bg-slate-800 text-gray-650 dark:text-slate-350 border-gray-200 dark:border-slate-700"
                }`}
              >
                I Borrowed Money
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Friend's Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rohan Verma"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              value={form.friendName}
              onChange={e => setForm({...form, friendName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Friend's Email (Optional)</label>
            <input
              type="email"
              placeholder="friend@college.edu"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              value={form.friendEmail}
              onChange={e => setForm({...form, friendEmail: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Amount (₹)</label>
            <input
              type="number"
              required
              placeholder="500"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Description / Notes</label>
            <input
              type="text"
              placeholder="e.g. Hostel room split, library book purchase"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>
          <button type="submit" className="sm:col-span-2 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition text-xs shadow-sm">
            Log Loan Log
          </button>
        </form>
      )}

      {/* Loan Lists */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Loan Ledgers</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {loans.map(l => (
            <div key={l._id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-850/30 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    l.type === "lent" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "bg-rose-500/10 text-rose-500"
                  }`}>
                    {l.type === "lent" ? "You Lent" : "You Borrowed"}
                  </span>
                  <span className="font-extrabold text-sm text-gray-800 dark:text-slate-200">{l.friendName}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{l.description || "No notes"} · {format(new Date(l.date), "dd MMM yyyy")}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className={`font-bold text-base ${
                  l.type === "lent" ? "text-emerald-500" : "text-rose-500"
                }`}>
                  ₹{l.amount.toLocaleString()}
                </span>
                
                <button
                  onClick={() => handleToggleResolve(l._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    l.isResolved 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100"
                  }`}
                >
                  {l.isResolved ? "Paid" : "Mark Paid"}
                </button>

                <button onClick={() => handleDeleteLoan(l._id)} className="text-gray-400 hover:text-rose-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {loans.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs">No friend loan logs logged. Start tracking loans by logging one above!</div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7); // e.g. "2026-06"
  });

  const fetchReports = async () => {
    try {
      const [incRes, expRes] = await Promise.all([
        axios.get(`${API_BASE}/income/get`),
        axios.get(`${API_BASE}/expense/get`)
      ]);
      const unified = [
        ...(incRes.data || []).map(i => ({ ...i, type: "income" })),
        ...(expRes.data || []).map(e => ({ ...e, type: "expense" }))
      ];
      setTransactions(unified);
    } catch (err) {
      toast.error("Failed to load records for report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const reportData = useMemo(() => {
    const filterYear = Number(selectedMonth.split("-")[0]);
    const filterMonth = Number(selectedMonth.split("-")[1]) - 1;

    const list = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
    });

    const income = list.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = list.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const net = income - expenses;

    // Group categories
    const categoriesMap = {};
    list.filter(t => t.type === "expense").forEach(t => {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
    });
    const categoriesList = Object.entries(categoriesMap).map(([name, value]) => ({ name, value }));

    // Group by days
    const daysMap = {};
    list.filter(t => t.type === "expense").forEach(t => {
      const dStr = format(new Date(t.date), "dd MMM");
      daysMap[dStr] = (daysMap[dStr] || 0) + t.amount;
    });
    const daysList = Object.entries(daysMap).map(([day, amount]) => ({ day, amount })).sort((a,b) => a.day.localeCompare(b.day));

    return {
      list,
      income,
      expenses,
      net,
      categoriesList,
      daysList
    };
  }, [transactions, selectedMonth]);

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Generating report...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Monthly Reports</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Review monthly financial summaries and export to PDF.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition text-xs flex items-center gap-1.5 shadow"
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block text-center border-b pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">SpendWise Monthly Report</h1>
        <p className="text-sm text-gray-500 mt-1">Report Period: {selectedMonth} · Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
          <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Income Received</span>
          <span className="text-2xl font-bold text-emerald-500 mt-1 block">₹{reportData.income.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
          <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Total Outflow</span>
          <span className="text-2xl font-bold text-rose-500 mt-1 block">₹{reportData.expenses.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
          <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Net Balance</span>
          <span className={`text-2xl font-bold mt-1 block ${reportData.net >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            ₹{reportData.net.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 print:grid-cols-1">
        {/* Category breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Category Breakdown</h2>
          <div className="h-60 w-full flex items-center justify-center">
            {reportData.categoriesList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.categoriesList}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {reportData.categoriesList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={val => `₹${val}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-gray-400">No expenses recorded for this month</p>
            )}
          </div>
        </div>

        {/* Daily Spending Line Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Daily Spending Trends</h2>
          <div className="h-60 w-full">
            {reportData.daysList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.daysList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={val => `₹${val}`} />
                  <Line type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-400">No daily data found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Records</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {reportData.list.map(t => (
            <div key={t._id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-85/30 transition-colors">
              <div>
                <span className="font-extrabold text-sm text-gray-800 dark:text-slate-200">{t.description}</span>
                <p className="text-xs text-gray-400 mt-1">{t.category} · {format(new Date(t.date), "dd MMM yyyy")}</p>
              </div>
              <span className={`font-bold text-sm ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
              </span>
            </div>
          ))}
          {reportData.list.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs">No records available for this month.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const Overview = ({ setToast }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [aiInsights, setAIInsights] = useState([]);
  const [aiLoading, setAILoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("expense"); // expense or income
  
  // Advanced Modal Forms
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    paymentMode: "UPI",
    receiptUrl: "",
    isRecurring: false,
    splits: [],
  });

  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");

  // Search & filter dashboard list state
  const [dbSearch, setDbSearch] = useState("");
  const [dbCategory, setDbCategory] = useState("all");
  const [dbPayMode, setDbPayMode] = useState("all");

  // Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState(null);

  // New Goal Form
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", targetAmount: "", deadline: "" });
  const [chartType, setChartType] = useState("bar"); // bar or line

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") return;

    try {
      const [incomeRes, expenseRes, profileRes] = await Promise.all([
        axios.get(`${API_BASE}/income/get`),
        axios.get(`${API_BASE}/expense/get`),
        axios.get(`${API_BASE}/auth/profile`),
      ]);

      const userProfile = profileRes.data;
      setProfile(userProfile);

      const unified = [
        ...incomeRes.data.map(i => ({ ...i, type: "income" })),
        ...expenseRes.data.map(e => ({ ...e, type: "expense" })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(unified);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  const fetchAIInsights = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") return;

    setAILoading(true);
    try {
      const res = await axios.get(`${API_BASE}/summary/insights`);
      setAIInsights(res.data.insights || []);
    } catch (err) {
      console.error("AI Insights fetch failed", err);
    } finally {
      setAILoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch AI insights automatically once profile/transactions load
  useEffect(() => {
    if (transactions.length > 0) {
      fetchAIInsights();
    }
  }, [transactions.length]);

  // Handle auto-logging of recurring expenses alert
  const recurringLogsToPrompt = useMemo(() => {
    const recurringTemplates = transactions.filter(t => t.type === "expense" && t.isRecurring);
    const uniqueTemplates = [];
    const seen = new Set();
    recurringTemplates.forEach(t => {
      if (!seen.has(t.description.toLowerCase())) {
        seen.add(t.description.toLowerCase());
        uniqueTemplates.push(t);
      }
    });

    const now = new Date();
    return uniqueTemplates.filter(template => {
      const alreadyLoggedThisMonth = transactions.some(t => 
        t.type === "expense" && 
        t.description.toLowerCase() === template.description.toLowerCase() &&
        new Date(t.date).getFullYear() === now.getFullYear() &&
        new Date(t.date).getMonth() === now.getMonth()
      );
      return !alreadyLoggedThisMonth;
    });
  }, [transactions]);

  const handleLogRecurring = async (template) => {
    try {
      const now = new Date().toISOString().slice(0, 10);
      await axios.post(`${API_BASE}/expense/add`, {
        description: `${template.description}`,
        amount: template.amount,
        category: template.category,
        date: now,
        paymentMode: template.paymentMode || "UPI",
        isRecurring: true,
        splits: [],
      });
      setToast({ message: `Recurring expense logged: ${template.description}`, type: "success" });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: "Failed to auto-log recurring expense", type: "error" });
    }
  };

  // Compute Stats
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyIncome = transactions
      .filter(t => t.type === "income" && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = transactions
      .filter(t => t.type === "expense" && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = monthlyIncome - monthlyExpense;
    return {
      monthlyIncome,
      monthlyExpense,
      netSavings,
    };
  }, [transactions]);

  // Group Category Expenses for Progress Bars
  const byCategory = useMemo(() => {
    const out = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    transactions
      .filter(t => t.type === "expense" && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .forEach(t => {
        const key = t.category || "Other";
        out[key] = (out[key] || 0) + t.amount;
      });
    return out;
  }, [transactions]);

  const categoryProgressData = useMemo(() => {
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [byCategory]);

  const categoryColorMap = {
    Food: "bg-teal-500",
    Transport: "bg-orange-500",
    Entertainment: "bg-purple-500",
    Subscriptions: "bg-rose-500",
    Stationery: "bg-blue-500",
    Fees: "bg-amber-500",
    Hostel: "bg-indigo-500",
    Medical: "bg-red-500",
    Other: "bg-slate-500",
  };

  const categoryDotColorMap = {
    Food: "bg-teal-500",
    Transport: "bg-orange-500",
    Entertainment: "bg-purple-500",
    Subscriptions: "bg-rose-500",
    Stationery: "bg-blue-500",
    Fees: "bg-amber-500",
    Hostel: "bg-indigo-500",
    Medical: "bg-red-500",
    Other: "bg-slate-500",
  };

  // Daily Spending Chart Data for last 7 days
  const dailySpendingData = useMemo(() => {
    const datesMap = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.getDate().toString();
      const fullLabel = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      datesMap[label] = { label, fullLabel, amount: 0, isToday: i === 0 };
    }

    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const dateObj = new Date(t.date);
        const label = dateObj.getDate().toString();
        if (datesMap[label]) {
          datesMap[label].amount += t.amount;
        }
      });

    return Object.values(datesMap);
  }, [transactions]);

  // Friend split records
  const splitDebts = useMemo(() => {
    const debts = [];
    transactions
      .filter(t => t.type === "expense" && t.splits?.length > 0)
      .forEach(t => {
        t.splits.forEach(s => {
          debts.push({
            expenseId: t._id,
            splitId: s._id,
            description: t.description,
            date: t.date,
            friendName: s.friendName,
            friendEmail: s.friendEmail,
            amount: s.amount,
            paid: s.paid,
          });
        });
      });
    return debts.sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  // Budget details
  const globalBudget = profile?.monthlyBudget || 10000;
  const budgetProgressPercent = Math.min(100, (stats.monthlyExpense / globalBudget) * 100);

  // File Upload Helper
  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToast({ message: "Receipt photo size must be less than 2MB", type: "error" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, receiptUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Split Friend
  const handleAddFriendSplit = () => {
    if (!friendName || !friendEmail) return setToast({ message: "Provide friend details", type: "error" });
    setForm(prev => ({
      ...prev,
      splits: [...prev.splits, { friendName, friendEmail, amount: 0, paid: false }]
    }));
    setFriendName("");
    setFriendEmail("");
  };

  // Remove Split Friend
  const handleRemoveFriendSplit = (idx) => {
    const updated = [...form.splits];
    updated.splice(idx, 1);
    setForm(prev => ({ ...prev, splits: updated }));
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return setToast({ message: "Fill description and amount", type: "error" });

    try {
      const endpoint = modalType === "income" ? "income/add" : "expense/add";
      const body = {
        description: form.description.trim(),
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
      };

      if (modalType === "expense") {
        body.paymentMode = form.paymentMode;
        body.receiptUrl = form.receiptUrl;
        body.isRecurring = form.isRecurring;
        
        if (form.splits.length > 0) {
          const splitShare = Number((Number(form.amount) / (form.splits.length + 1)).toFixed(2));
          body.splits = form.splits.map(s => ({ ...s, amount: splitShare }));
        }
      }

      await axios.post(`${API_BASE}/${endpoint}`, body);
      setToast({ message: `${modalType === "income" ? "Income" : "Expense"} logged successfully!`, type: "success" });
      
      setForm({
        description: "",
        amount: "",
        category: modalType === "income" ? "Income" : "Food",
        date: new Date().toISOString().slice(0, 10),
        paymentMode: "UPI",
        receiptUrl: "",
        isRecurring: false,
        splits: [],
      });
      setShowModal(false);
      fetchDashboardData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to log transaction", type: "error" });
    }
  };

  // Toggle Split Payment status
  const handleToggleSplit = async (expenseId, splitId) => {
    try {
      await axios.put(`${API_BASE}/expense/splits/${expenseId}/toggle/${splitId}`);
      setToast({ message: "Split payment status updated!", type: "success" });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: "Failed to update split payment status", type: "error" });
    }
  };

  // Contribution to savings goals
  const handleContributeGoal = async (goalId, targetAmount, currentAmount) => {
    try {
      const amtToAdd = 500;
      const nextAmt = Math.min(targetAmount, currentAmount + amtToAdd);
      const updatedGoals = profile.savingsGoals.map(g => 
        g._id === goalId ? { ...g, currentAmount: nextAmt } : g
      );

      await axios.put(`${API_BASE}/auth/profile`, { savingsGoals: updatedGoals });
      setToast({ message: `Added ₹${amtToAdd} to savings goal!`, type: "success" });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: "Failed to contribute to savings goals", type: "error" });
    }
  };

  // Delete Savings Goal
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Delete this savings goal?")) return;
    try {
      const updatedGoals = profile.savingsGoals.filter(g => g._id !== goalId);
      await axios.put(`${API_BASE}/auth/profile`, { savingsGoals: updatedGoals });
      setToast({ message: "Savings goal deleted", type: "success" });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: "Failed to delete savings goal", type: "error" });
    }
  };

  // Create Savings Goal
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount) return setToast({ message: "Provide goal title and amount", type: "error" });
    try {
      const updatedGoals = [
        ...(profile.savingsGoals || []),
        {
          title: newGoal.title,
          targetAmount: Number(newGoal.targetAmount),
          currentAmount: 0,
          deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined,
        }
      ];
      await axios.put(`${API_BASE}/auth/profile`, { savingsGoals: updatedGoals });
      setToast({ message: "New Savings Goal added!", type: "success" });
      setNewGoal({ title: "", targetAmount: "", deadline: "" });
      setShowGoalForm(false);
      fetchDashboardData();
    } catch (err) {
      setToast({ message: "Failed to create savings goal", type: "error" });
    }
  };

  // Delete a transaction from list
  const handleDeleteTransaction = async (t) => {
    if (!window.confirm(`Delete ${t.description}?`)) return;
    try {
      const endpoint = t.type === "income" ? "income/delete" : "expense/delete";
      await axios.delete(`${API_BASE}/${endpoint}/${t._id}`);
      setToast({ message: "Record deleted", type: "success" });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: "Delete failed", type: "error" });
    }
  };

  // One-tap quick log helper for students
  const handleQuickLog = async (desc, amt, cat) => {
    try {
      await axios.post(`${API_BASE}/expense/add`, {
        description: desc,
        amount: Number(amt),
        category: cat,
        date: new Date().toISOString().slice(0, 10),
        paymentMode: "UPI",
      });
      setToast({ message: `Logged ${desc} (₹${amt}) successfully!`, type: "success" });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: `Failed to log ${desc}`, type: "error" });
    }
  };

  // Dashboard list filter
  const filteredDashboardList = useMemo(() => {
    return transactions.filter(t => {
      if (dbSearch && !t.description.toLowerCase().includes(dbSearch.toLowerCase())) return false;
      if (t.type === "expense") {
        if (dbCategory !== "all" && t.category !== dbCategory) return false;
        if (dbPayMode !== "all" && t.paymentMode !== dbPayMode) return false;
      }
      return true;
    }).slice(0, 5); // display 5 transactions as requested in layout suggestion
  }, [transactions, dbSearch, dbCategory, dbPayMode]);

  // Streak calculations & dot heatmap calendar
  const streakInfo = useMemo(() => {
    const datesMap = new Set();
    transactions.forEach(t => {
      datesMap.add(new Date(t.date).toISOString().slice(0, 10));
    });

    let currentStreak = 0;
    const checkDate = new Date();
    
    // Check consecutive days backwards
    while (true) {
      const checkStr = checkDate.toISOString().slice(0, 10);
      if (datesMap.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no logs, check if yesterday had a log to continue the streak
        if (currentStreak === 0) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);
          if (datesMap.has(yesterdayStr)) {
            currentStreak++;
            yesterday.setDate(yesterday.getDate() - 1);
            while (true) {
              const yStr = yesterday.toISOString().slice(0, 10);
              if (datesMap.has(yStr)) {
                currentStreak++;
                yesterday.setDate(yesterday.getDate() - 1);
              } else {
                break;
              }
            }
          }
        }
        break;
      }
    }

    // Generate monthly calendar heatmap dots
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dots = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateToCheck = new Date(now.getFullYear(), now.getMonth(), day);
      const str = dateToCheck.toISOString().slice(0, 10);
      dots.push({
        day,
        logged: datesMap.has(str),
      });
    }

    return {
      streak: currentStreak,
      dots,
    };
  }, [transactions]);

  // Export reports
  const handleExportCSV = () => {
    const header = "Date,Type,Description,Category,PaymentMode,Amount\n";
    const csv = transactions.map(t => 
      `${new Date(t.date).toLocaleDateString()},${t.type},"${t.description.replace(/"/g, '""')}","${t.category}","${t.paymentMode || ''}",${t.amount}`
    ).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `financial_report_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  }, []);

  const isBudgetOnTrack = stats.monthlyExpense < globalBudget;
  const netSavingsPercent = useMemo(() => {
    if (stats.monthlyIncome === 0) return 0;
    return Math.round((stats.netSavings / stats.monthlyIncome) * 100);
  }, [stats.monthlyIncome, stats.netSavings]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      {/* Auto-log recurring alerts */}
      {recurringLogsToPrompt.length > 0 && (
        <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-200 dark:border-teal-900 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-teal-500 text-white rounded-xl">
              <RefreshCw size={20} className="animate-spin" style={{ animationDuration: '8s' }} />
            </span>
            <div>
              <h4 className="font-bold text-teal-900 dark:text-teal-200 text-sm md:text-base">Recurring Expenses Due</h4>
              <p className="text-teal-700 dark:text-teal-400 text-xs md:text-sm">We detected monthly recurring bills that haven't been logged for this month.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {recurringLogsToPrompt.map(template => (
              <button
                key={template._id}
                onClick={() => handleLogRecurring(template)}
                className="px-4 py-2 bg-teal-500 text-white hover:bg-teal-600 rounded-xl text-xs font-bold transition-all shadow hover:shadow-md"
              >
                Log "{template.description}" (₹{template.amount})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hero Welcome Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            Hello, {profile?.name || "Student"}! 👋
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 font-semibold">
            {currentMonthName} • <span className={isBudgetOnTrack ? "text-emerald-500" : "text-rose-500"}>{isBudgetOnTrack ? "Budget on track" : "Over budget!"}</span>
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => { setModalType("income"); setForm(f => ({ ...f, category: "Pocket Money" })); setShowModal(true); }}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold rounded-xl transition shadow text-xs flex items-center justify-center gap-1.5 border border-slate-800 dark:border-slate-700"
          >
            <Plus size={14} /> Add income
          </button>
          <button
            onClick={() => { setModalType("expense"); setForm(f => ({ ...f, category: "Food" })); setShowModal(true); }}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold rounded-xl transition shadow text-xs flex items-center justify-center gap-1.5 border border-slate-800 dark:border-slate-700"
          >
            <Plus size={14} /> Add expense
          </button>
        </div>
      </div>

      {/* 4 Balanced Grid Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Budget Used */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Budget Used</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">₹{stats.monthlyExpense.toLocaleString()}</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-850 overflow-hidden w-full">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  budgetProgressPercent >= 80 ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${budgetProgressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-semibold block">of ₹{globalBudget.toLocaleString()} limit</span>
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Total Income</span>
            <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 mt-1 block">₹{stats.monthlyIncome.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold block">this month</span>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Total Expenses</span>
            <span className="text-2xl font-bold text-rose-500 mt-1 block">₹{stats.monthlyExpense.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold block">this month</span>
        </div>

        {/* Card 4: Remaining Budget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold block">Remaining Budget</span>
            <span className={`text-2xl font-bold mt-1 block ${globalBudget - stats.monthlyExpense >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ₹{(globalBudget - stats.monthlyExpense).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold block">left this month</span>
        </div>
      </div>

      {/* Row 1: Weekly spend trends & Quick log */}
      <div className="grid gap-6 md:grid-cols-5 items-start">
        {/* Weekly spend trends with Red Highlighted Today Bar / Toggle Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 md:col-span-3">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Weekly spend trends</h2>
              <p className="text-xs text-gray-400">Daily total for last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 dark:bg-slate-800/80 rounded-lg p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setChartType("bar")}
                  className={`px-2 py-0.5 rounded transition ${chartType === "bar" ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" : "text-gray-400"}`}
                >
                  Bar
                </button>
                <button
                  type="button"
                  onClick={() => setChartType("line")}
                  className={`px-2 py-0.5 rounded transition ${chartType === "line" ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" : "text-gray-400"}`}
                >
                  Line
                </button>
              </div>
              <span className="text-[10px] font-semibold px-2 py-1 bg-gray-50 dark:bg-slate-800 text-gray-655 dark:text-slate-355 rounded-lg">
                {dailySpendingData[0]?.fullLabel} – {dailySpendingData[6]?.fullLabel}
              </span>
            </div>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={dailySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v.toLocaleString()}`} />
                  <Tooltip formatter={(value, name, props) => [`₹${value.toLocaleString()}`, props.payload.fullLabel]} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={28}>
                    {dailySpendingData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isToday ? "#f43f5e" : "#10b981"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart data={dailySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v.toLocaleString()}`} />
                  <Tooltip formatter={(value, name, props) => [`₹${value.toLocaleString()}`, props.payload.fullLabel]} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    dot={props => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle 
                          key={payload.label}
                          cx={cx} 
                          cy={cy} 
                          r={payload.isToday ? 6 : 4} 
                          fill={payload.isToday ? "#f43f5e" : "#10b981"} 
                          stroke="none" 
                        />
                      );
                    }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Log Student Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 md:col-span-2">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Quick log</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLog("Chai", 15, "Food")}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">☕ Chai</span>
              <span className="text-gray-400">₹15</span>
            </button>
            <button
              onClick={() => handleQuickLog("Lunch", 80, "Food")}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">🍴 Lunch</span>
              <span className="text-gray-400">₹80</span>
            </button>
            <button
              onClick={() => handleQuickLog("Breakfast", 40, "Food")}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">☀️ Breakfast</span>
              <span className="text-gray-400">₹40</span>
            </button>
            <button
              onClick={() => handleQuickLog("Auto Fare", 30, "Transport")}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">🚗 Auto</span>
              <span className="text-gray-400">₹30</span>
            </button>
            <button
              onClick={() => handleQuickLog("Dinner", 100, "Food")}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">🌙 Dinner</span>
              <span className="text-gray-400">₹100</span>
            </button>
            <button
              onClick={() => { setModalType("expense"); setForm(f => ({ ...f, description: "", amount: "", category: "Food" })); setShowModal(true); }}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed border-teal-500/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 text-xs font-bold text-teal-600 dark:text-teal-400 transition"
            >
              <span>+ Custom</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Expenses by Category & Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Expenses by Category progress bars and Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 md:col-span-1">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Expenses by category</h2>
          <p className="text-xs text-gray-400 mb-5">Breakdown of categories</p>
          
          <div className="grid gap-4 sm:grid-cols-2 items-center">
            {/* Pie Chart on the left */}
            <div className="h-44 w-full flex items-center justify-center">
              {categoryProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryProgressData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                    >
                      {categoryProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={val => `₹${val}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-gray-400 dark:text-slate-500">No expenses recorded</span>
              )}
            </div>

            {/* Progress bars on the right */}
            <div className="space-y-3.5">
              {categoryProgressData.slice(0, 5).map(c => {
                const total = stats.monthlyExpense || 1;
                const percent = Math.min(100, Math.round((c.value / total) * 100));
                return (
                  <div key={c.name} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-650 dark:text-slate-350 flex items-center gap-1.5 truncate min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[c.name] || "#64748b" }} />
                        {c.name}
                      </span>
                      <span className="text-gray-850 dark:text-slate-100 flex-shrink-0">₹{c.value.toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.name] || "#64748b", width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
              {categoryProgressData.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">No category totals computed. Add an expense.</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions List with Color Coding */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Recent transactions</h2>
          <div className="divide-y divide-gray-50 dark:divide-slate-800/60">
            {filteredDashboardList.map(t => (
              <div key={t._id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    t.type === 'income' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450' 
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-450'
                  }`}>
                    {t.type === 'income' ? <Wallet size={16} /> : <CreditCard size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-slate-200 truncate text-xs">{t.description}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(t.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <span className={`font-bold text-xs flex-shrink-0 ${
                  t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                </span>
              </div>
            ))}

            {filteredDashboardList.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-400">No records found. Log your first pocket money or coffee!</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Savings Goals & Logging Streak */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Savings Goals progress bars with deadlines */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Savings goals</h2>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
            >
              {showGoalForm ? "Cancel" : "+ Add Goal"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Set aside pocket money for special goals.</p>

          {showGoalForm && (
            <form onSubmit={handleCreateGoal} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-3 mb-4">
              <div className="grid gap-2 grid-cols-2">
                <input
                  type="text"
                  placeholder="Goal Title (e.g. Goa Trip)"
                  className="px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  value={newGoal.title}
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Target Amount (₹)"
                  className="px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  value={newGoal.targetAmount}
                  onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                  required
                  min="1"
                />
              </div>
              <div className="flex justify-between items-center">
                <input
                  type="date"
                  className="px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  value={newGoal.deadline}
                  onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                />
                <button type="submit" className="px-3 py-1.5 bg-teal-500 text-white rounded text-xs font-semibold hover:bg-teal-600">
                  Save Goal
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {profile?.savingsGoals?.map(g => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
              
              return (
                <div key={g._id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-800 dark:text-slate-200">{g.title}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>₹{g.currentAmount.toLocaleString()} of ₹{g.targetAmount.toLocaleString()} {daysLeft !== null ? `· ${daysLeft > 0 ? `${daysLeft} days left` : "deadline crossed"}` : ""}</span>
                    {g.currentAmount < g.targetAmount && (
                      <button
                        onClick={() => handleContributeGoal(g._id, g.targetAmount, g.currentAmount)}
                        className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold rounded"
                      >
                        + Contribute ₹500
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {!profile?.savingsGoals?.length && (
              <div className="text-center py-8 text-xs text-gray-400">No active savings goals. Add one above.</div>
            )}
          </div>
        </div>

        {/* Logging Streak Heatmap dot calendar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Logging streak</h2>
          <p className="text-xs text-gray-400 mb-4">Keep logging your expenses daily</p>
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4 mb-5">
            <span className="text-3xl">🔥</span>
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">{streakInfo.streak} Day streak</h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-500 font-medium">Keep it up — best is 21 days!</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">This month log heatmap</span>
            <div className="flex flex-wrap gap-2">
              {streakInfo.dots.map(d => (
                <div
                  key={d.day}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                    d.logged
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600"
                  }`}
                  title={`Day ${d.day}: ${d.logged ? "Logged" : "No entry"}`}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Spending Coach Insights Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-black shadow-sm">
              AI
            </span>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Smart Spending Coach</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Actionable insights driven by your campus spending trends.</p>
            </div>
          </div>
          <button
            onClick={fetchAIInsights}
            disabled={aiLoading}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
          >
            <RefreshCw size={12} className={aiLoading ? "animate-spin" : ""} /> Refresh Insights
          </button>
        </div>

        {aiLoading ? (
          <div className="text-center py-6 text-xs text-gray-500 dark:text-slate-400 animate-pulse">Analyzing transactions and generating suggestions...</div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 text-xs text-gray-700 dark:text-slate-300">
            {aiInsights.map((line, idx) => (
              <li key={idx} className="flex gap-2.5 p-3 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/20 dark:border-indigo-900/10 items-start">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                <span className="leading-relaxed font-medium">{line}</span>
              </li>
            ))}
            {aiInsights.length === 0 && (
              <div className="col-span-2 text-center py-4 text-gray-400">Log more expenses to see personalized coaching.</div>
            )}
          </ul>
        )}
      </div>

      {/* Dynamic Receipt Preview Modal */}
      {activeReceipt && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg relative border border-gray-100 dark:border-slate-800">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Receipt Preview</h3>
            <div className="max-h-[70vh] overflow-auto rounded-2xl flex items-center justify-center border border-gray-100 dark:border-slate-800">
              <img src={activeReceipt} alt="Receipt Bill" className="max-w-full h-auto object-contain" />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Advanced Unified Add/Log Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${modalType === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                Log New {modalType === "income" ? "Income" : "Expense"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Description / Note</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Canteen lunch, Mess fee"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Category</label>
                  {modalType === "income" ? (
                    <select
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option value="Pocket Money">Pocket Money</option>
                      <option value="Part-time Income">Part-time Income</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Income">Other Income</option>
                    </select>
                  ) : (
                    <select
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      {STUDENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    min="1"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                  />
                </div>
              </div>

              {modalType === "expense" && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Payment Mode</label>
                      <div className="flex gap-2">
                        {PAYMENT_MODES.map(mode => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setForm({...form, paymentMode: mode})}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                              form.paymentMode === mode
                                ? "bg-rose-500 text-white border-rose-500"
                                : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Receipt photo</label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-750 cursor-pointer text-xs font-bold transition">
                          <Camera size={14} /> {form.receiptUrl ? "Image Loaded" : "Upload bill"}
                          <input type="file" accept="image/*" className="hidden" onChange={handleReceiptChange} />
                        </label>
                        {form.receiptUrl && (
                          <button
                            type="button"
                            onClick={() => setForm({...form, receiptUrl: ""})}
                            className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900 rounded-xl"
                            title="Clear image"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Roommate splits */}
                  <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Split Bill among Roommates/Friends</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Friend Name"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                        value={friendName}
                        onChange={e => setFriendName(e.target.value)}
                      />
                      <input
                        type="email"
                        placeholder="Friend Email"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                        value={friendEmail}
                        onChange={e => setFriendEmail(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleAddFriendSplit}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                      >
                        + Split
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {form.splits.map((s, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-full text-xs border border-indigo-100 dark:border-indigo-900">
                          {s.friendName}
                          <button type="button" onClick={() => handleRemoveFriendSplit(idx)} className="hover:text-rose-500 font-bold">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    {form.splits.length > 0 && form.amount && (
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        Each friend pays: ₹{(Number(form.amount) / (form.splits.length + 1)).toFixed(2)} (Total split with {form.splits.length} friends + you)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isRecurringCheck"
                      checked={form.isRecurring}
                      onChange={e => setForm({...form, isRecurring: e.target.checked})}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="isRecurringCheck" className="text-xs font-bold text-gray-600 dark:text-slate-300 cursor-pointer">
                      Mark as Monthly Recurring Bill (Auto-logs next month)
                    </label>
                  </div>
                </>
              )}

              <div className="border-t border-gray-100 dark:border-slate-800 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-white rounded-xl text-sm font-semibold ${
                    modalType === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  Log Transaction
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Main App Router Setup
const App = () => {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Force light mode on mount
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("darkMode");
  }, []);

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToast({ message: "Signed out successfully", type: "info" });
    setTimeout(() => { window.location.href = "/login"; }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* react-hot-toast Toaster */}
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />

      {/* Toast Alert Notice */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main navigation Header */}
      <header className="border-b border-gray-100 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white w-9 h-9 text-xl font-black shadow transition-transform group-hover:scale-105">
              ₹
            </span>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
              SpendWise
            </span>
          </Link>

          {user && (
            <nav className="flex items-center gap-1 p-0.5 bg-gray-100/50 dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800 rounded-xl text-[10px] sm:text-xs font-bold overflow-x-auto max-w-[50vw] sm:max-w-none custom-scrollbar">
              <Link to="/" className="px-2.5 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
                Dashboard
              </Link>
              <Link to="/expense" className="px-2.5 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
                Expenses
              </Link>
              <Link to="/income" className="px-2.5 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
                Income
              </Link>
              <Link to="/budget" className="px-2.5 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
                Budget
              </Link>
              <Link to="/goals" className="px-2.5 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
                Goals
              </Link>
              <Link to="/loans" className="px-2.5 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
                Loans
              </Link>
              <Link to="/reports" className="px-2.5 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
                Reports
              </Link>
              <Link to="/profile" className="px-2.5 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
                Profile
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => setToast({ message: "No new notifications", type: "info" })}
                className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition border border-gray-200/50 dark:border-slate-800"
                title="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </button>
            )}



            {user ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl text-xs font-bold transition border border-rose-100 dark:border-rose-950"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-teal-500 text-white rounded-xl text-xs font-bold shadow hover:bg-teal-600 transition"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login setToast={setToast} />} />
          <Route path="/signup" element={<Signup setToast={setToast} />} />
          <Route path="/" element={<ProtectedRoute><Overview setToast={setToast} /></ProtectedRoute>} />
          <Route path="/income" element={<ProtectedRoute><TransactionsView type="income" setToast={setToast} /></ProtectedRoute>} />
          <Route path="/expense" element={<ProtectedRoute><TransactionsView type="expense" setToast={setToast} /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage setToast={setToast} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
