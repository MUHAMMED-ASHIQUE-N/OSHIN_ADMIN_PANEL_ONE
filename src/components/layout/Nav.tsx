// src/components/layout/Nav.tsx
import logo from "../../assets/logo/Oshin_Calicut_Logo.jpg";
import { FaUserCircle } from "react-icons/fa";
import { useAuthStore } from "../../stores/authStore";
import { useFilterStore } from "../../stores/filterStore"; // 1. Import filter store

function Nav() {
  const { user } = useAuthStore();
  const { category, setCategory } = useFilterStore(); // 2. Get category state

  return (
    <div className="flex justify-between items-center px-4 md:px-8 py-2 border-b border-gray-200 bg-background">
      <img src={logo} width={50} alt="" />

      {/* 3. Add the Category Toggle - only show for admins/viewers */}
      {(user?.role === 'admin' || user?.role === 'viewer') && (
        <div className="flex items-center gap-2 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setCategory('room')}
            className={`px-4 py-1 rounded-md text-sm font-medium ${
              category === 'room' ? 'bg-primary text-white shadow' : 'text-gray-700'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setCategory('f&b')}
            className={`px-4 py-1 rounded-md text-sm font-medium ${
              category === 'f&b' ? 'bg-primary text-white shadow' : 'text-gray-700'
            }`}
          >
            F&B
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <FaUserCircle className="text-3xl text-pink-700" />
        <p className="text-[#949CA1] capitalize">{user?.fullName || 'User'}</p>
      </div>
    </div>
  );
}

export default Nav;