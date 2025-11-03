import React, { useState, useEffect } from 'react';
import { useAuthStore, IUser } from '../stores/authStore'; // Import IUser
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo/logo.png';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user, navigate]);

  // ✅ CHANGED: Updated redirect logic
  const redirectUser = (role: IUser['role']) => {
    if (role === 'admin' || role === 'viewer') {
      navigate('/'); // Admin/Viewer dashboard
    } else if (role === 'staff_room') {
      navigate('/review/room'); // Room staff -> Room review page
    } else if (role === 'staff_f&b') {
      navigate('/review/f&b'); // F&B staff -> F&B review page
    } else if (role === 'staff') {
      navigate('/review/select'); // Generic staff -> Category selection
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loggedInUser = await login(username, password);
    if (loggedInUser) {
      redirectUser(loggedInUser.role);
    }
  };

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

        <div className="relative w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#650933] focus:border-transparent pr-10"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#650933] transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
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