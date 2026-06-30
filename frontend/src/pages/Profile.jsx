
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ new: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4001/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data._id) {
          setUser(data);
          setFormData({ name: data.name, email: data.email });
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch('http://localhost:4001/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully');
        setUser({ ...user, name: data.name, email: data.email });
      } else {
        setError(data.message || 'Update failed');
      }
    } catch(err) {
      setError('An error occurred');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (passwordData.new !== passwordData.confirm) return setError('Passwords do not match');
    
    try {
      const res = await fetch('http://localhost:4001/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: passwordData.new })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password updated successfully');
        setPasswordData({ new: '', confirm: '' });
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-500">Manage your account details and password.</p>
      </div>

      {message && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">{message}</div>}
      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Full Name</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Email Address</label>
            <input 
              type="email" 
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-teal-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-teal-600 transition">Save Details</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">New Password</label>
            <input 
              type="password" 
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={passwordData.new}
              onChange={e => setPasswordData({...passwordData, new: e.target.value})}
              required minLength={6}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Confirm New Password</label>
            <input 
              type="password" 
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={passwordData.confirm}
              onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
              required minLength={6}
            />
          </div>
          <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-800 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-900 transition">Update Password</button>
        </form>
      </div>
      
      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button 
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} 
          className="inline-flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 px-5 py-2.5 text-sm font-medium hover:bg-rose-100 transition"
        >
          Sign Out Now
        </button>
      </div>
    </div>
  );
};
export default ProfilePage;
