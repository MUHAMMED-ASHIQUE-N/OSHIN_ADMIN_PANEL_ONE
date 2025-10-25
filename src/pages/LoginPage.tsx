// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo/logo.png'; // Make sure this path is correct

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user, navigate]);

  const redirectUser = (role: 'admin' | 'staff' | 'viewer') => {
    if (role === 'admin' || role === 'viewer') {
      navigate('/'); // Admin dashboard
    } else if (role === 'staff') {
      navigate('/review/select'); // Staff category selection page
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loggedInUser = await login(username, password);
    if (loggedInUser) {
      redirectUser(loggedInUser.role);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#FAFBFF]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 bg-white p-8 rounded-lg shadow-lg">
        <img src={logo} alt="Oshin Logo" className="w-24 mx-auto" />
        <h2 className="text-2xl font-bold text-[#650933] text-center mb-2">Review System Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#650933] focus:border-transparent"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#650933] focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-[#650933] text-white rounded-md font-medium hover:bg-opacity-90 disabled:bg-opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;