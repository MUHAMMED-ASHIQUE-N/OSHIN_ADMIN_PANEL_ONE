//components/common/CategorySelectionModal.tsx
import React from 'react';
import Modal from './Modal';
import { Hotel, Utensils } from 'lucide-react';

type Category = 'room' | 'f&b';

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
        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={() => onSubmit('room')}
            className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-primary text-white rounded-lg shadow-lg hover:bg-opacity-90 transition-all"
          >
            <Hotel size={48} />
            <span className="text-2xl font-semibold">Rooms</span>
          </button>
          <button
            onClick={() => onSubmit('f&b')}
            className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-primary text-white rounded-lg shadow-lg hover:bg-opacity-90 transition-all"
          >
            <Utensils size={48} />
            <span className="text-2xl font-semibold">Food & Beverage</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CategorySelectionModal;