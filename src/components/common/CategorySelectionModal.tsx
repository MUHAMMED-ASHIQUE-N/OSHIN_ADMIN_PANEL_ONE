import React from 'react';
import Modal from './Modal';
import { Hotel, Utensils, Coffee } from 'lucide-react'; // ✅ 1. Import Coffee icon

// ✅ 2. Add 'cfc' to the type
type Category = 'room' | 'f&b' | 'cfc';

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: Category) => void;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Category to Compare</h2>
        <p className="text-gray-600 mb-8">
          Please select which category you would like to compare data for.
        </p>
        {/* ✅ 3. Update grid to support 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onSubmit('room')}
            className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-primary text-white rounded-lg shadow-lg hover:bg-opacity-90 transition-all" // Adjusted padding
          >
            <Hotel size={48} />
            <span className="text-xl font-semibold">Rooms</span>
          </button>
          <button
            onClick={() => onSubmit('f&b')}
            className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-primary text-white rounded-lg shadow-lg hover:bg-opacity-90 transition-all" // Adjusted padding
          >
            <Utensils size={48} />
            <span className="text-xl font-semibold">Food & Beverage</span>
          </button>
          {/* ✅ 4. Add new button for 'cfc' */}
          <button
            onClick={() => onSubmit('cfc')}
            className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-primary text-white rounded-lg shadow-lg hover:bg-opacity-90 transition-all" // Adjusted padding
          >
            <Coffee size={48} />
            <span className="text-xl font-semibold">Coffee Klatch</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CategorySelectionModal;
