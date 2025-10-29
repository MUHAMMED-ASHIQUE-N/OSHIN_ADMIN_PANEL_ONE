import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo/logo.png'; // Make sure this path is correct
import { Eye, EyeOff } from 'lucide-react'; // ✅ Import icons

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✅ State for visibility
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

  // ✅ Toggle function
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
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

        {/* ✅ START: Password Input Wrapper */}
        <div className="relative w-full">
          <input
            type={showPassword ? 'text' : 'password'} // Dynamically set type
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#650933] focus:border-transparent pr-10" // Added pr-10 for icon space
          />
          <button
            type="button" // Prevent form submission
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#650933] transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {/* ✅ END: Password Input Wrapper */}
        
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