//pages/review/SelectCategoryPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Ensure this path is correct for your project structure
import logo from '../../assets/logo/logo.png';
import { Hotel, Utensils, LogOut } from 'lucide-react'; // Import LogOut icon
import { useAuthStore } from '../../stores/authStore'; // Import the auth store

const SelectCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout); // Get the logout function

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors"
        title="Logout"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>

      {/* Main Content */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-8 text-center">
        <img src={logo} alt="Oshin Logo" className="w-24 mx-auto" />
        <h2 className="text-3xl font-bold text-[#650933]">Select Review Type</h2>
        <p className="text-lg text-gray-600">
          Please select the area you would like to provide feedback for.
        </p>
        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={() => navigate('/review/room')}
            className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-primary text-white rounded-lg shadow-lg hover:bg-opacity-90 transition-all"
          >
            <Hotel size={48} />
            <span className="text-2xl font-semibold">Room / Stay</span>
          </button>
          <button
            onClick={() => navigate('/review/f&b')}
            className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-primary text-white rounded-lg shadow-lg hover:bg-opacity-90 transition-all"
          >
            <Utensils size={48} />
            <span className="text-2xl font-semibold">Food & Beverage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectCategoryPage;