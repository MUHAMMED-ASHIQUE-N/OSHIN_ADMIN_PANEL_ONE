import logo from "../../assets/logo/Oshin_Calicut_Logo.jpg";
import { FaUserCircle } from "react-icons/fa";
// import { Menu } from "lucide-react"; // No longer needed
import { useAuthStore } from "../../stores/authStore";

// 1. Define the type for the props (toggleSidebar and isMobile removed)
type Category = 'room' | 'f&b';

interface NavProps {
  category: Category;
  setCategory: (category: Category) => void;
}

// 2. Accept the updated props
function Nav({ category, setCategory }: NavProps) {
  const { user } = useAuthStore();

  return (
    <div className="flex justify-between items-center px-4 md:px-8 py-2 border-b border-gray-200 bg-background">
      
      <div className="flex items-center gap-4">
        {/* 3. Hamburger button block is fully removed */}
        <img src={logo} width={50} alt="Oshin Logo" />
      </div>

      {/* 4. Use the 'category' and 'setCategory' props for the toggle buttons */}
      {(user?.role === 'admin' || user?.role === 'viewer') && (
        <div className="flex items-center gap-2 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setCategory('room')}
            className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
              category === 'room' ? 'bg-primary text-white shadow' : 'text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setCategory('f&b')}
            className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
              category === 'f&b' ? 'bg-primary text-white shadow' : 'text-gray-700 hover:bg-gray-300'
            }`}
          >
            F&B
          </button>
        </div>
      )}

      {/* User Info - no changes here */}
      <div className="flex items-center gap-4">
        <FaUserCircle className="text-3xl text-pink-700" />
        <p className="text-[#949CA1] capitalize">{user?.fullName || 'User'}</p>
      </div>
    </div>
  );
}

export default Nav;