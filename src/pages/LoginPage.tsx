import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, token } = useAuthStore();
  const navigate = useNavigate();

  // If the user is already logged in, redirect them to the dashboard
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
<div className="flex justify-center items-center min-h-screen bg-[#FAFBFF]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-[#650933] text-center mb-2">Admin Login</h2>
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