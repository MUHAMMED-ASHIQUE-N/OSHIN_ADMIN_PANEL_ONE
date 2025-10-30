//pages/management/CompositesPageMngt.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useManagementStore, Composite, Question } from '../../stores/managementStore';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';

// --- Category-Filtered Question List Component ---
interface QuestionSelectorProps {
  allQuestions: Question[];
  selectedCategory: 'room' | 'f&b';
  defaultChecked?: string[];
}



  
const QuestionSelector: React.FC<QuestionSelectorProps> = ({ allQuestions, selectedCategory, defaultChecked = [] }) => {
  const filteredQuestions = useMemo(() => {
    // Sort by order before displaying
    return allQuestions
      .filter(q => q.category === selectedCategory)
      .sort((a, b) => a.order - b.order);
  }, [allQuestions, selectedCategory]);

  if (filteredQuestions.length === 0) {
    return <p className="text-sm text-gray-500 text-center p-4">No {selectedCategory.toUpperCase()} questions found. Please create some first.</p>;
  }

  return (
    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
      {filteredQuestions.map(q => (
        <div key={q._id} className="flex items-center">
          <input
            type="checkbox"
            id={`question-${q._id}`}
            name={`question-${q._id}`} // Use name to group for form submission
            value={q._id}
            defaultChecked={defaultChecked.includes(q._id)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 "
          />
          <label htmlFor={`question-${q._id}`} className="ml-2 block text-sm text-gray-900">{q.text} (Order: {q.order})</label>
        </div>
      ))}
    </div>
  );
};

// --- Reusable Composite List Component ---
interface CompositeListProps {
  composites: Composite[];
  onEdit: (composite: Composite) => void;
  onDelete: (composite: Composite) => void;
  itemStyle: string;
  emptyMessage: string;
}

const CompositeList: React.FC<CompositeListProps> = ({ composites, onEdit, onDelete, itemStyle, emptyMessage }) => {
  if (composites.length === 0) {
    return <p className="text-gray-500 md:col-span-2">{emptyMessage}</p>;
  }
  
  // Sort composites by order before rendering
  const sortedComposites = [...composites].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {sortedComposites.map(comp => (
        <div key={comp._id} className={itemStyle}>
          <span className="pr-12">(Order: {comp.order || 0}) {comp.name}</span>
          <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2">
            <button onClick={() => onEdit(comp)} className="p-1 text-primary/70 hover:text-primary" title="Edit">
              <Edit size={18} />
            </button>
            <button onClick={() => onDelete(comp)} className="p-1 text-red-500/70 hover:text-red-700" title="Delete">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};


// --- Main Page Component ---
const CompositesPageMngt: React.FC = () => {
  const {
    composites,
    questions,
    isLoading,
    fetchComposites,
    fetchQuestions,
    createComposite,
    updateComposite,
    deleteComposite,
  } = useManagementStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComposite, setEditingComposite] = useState<Composite | null>(null);
  const [modalCategory, setModalCategory] = useState<'room' | 'f&b'>('room');
  const [activeTab, setActiveTab] = useState<'room' | 'f&b'>('room');

  const { roomComposites, fbComposites } = useMemo(() => {
    return {
      roomComposites: composites.filter(c => c.category === 'room'),
      fbComposites: composites.filter(c => c.category === 'f&b'),
    };
  }, [composites]);

  useEffect(() => {
    fetchComposites();
    fetchQuestions();
  }, [fetchComposites, fetchQuestions]);

  const openCreateModal = () => {
    setEditingComposite(null);
    setModalCategory(activeTab);
    setIsModalOpen(true);
  };

  const openEditModal = (composite: Composite) => {
    setEditingComposite(composite);
    setModalCategory(composite.category);
    setIsModalOpen(true);
  };

  const openDeleteModal = (composite: Composite) => {
    if (window.confirm(`Are you sure you want to delete "${composite.name}"?`)) {
      deleteComposite(composite._id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingComposite(null);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const category = formData.get('category') as 'room' | 'f&b';
    const order = Number(formData.get('order') || 0); // Get order

    const selectedQuestionIds: string[] = [];
    // Loop over checkboxes by name to get selected values
    event.currentTarget.querySelectorAll('input[name^="question-"]:checked').forEach(input => {
        selectedQuestionIds.push((input as HTMLInputElement).value);
    });

    if (!name || !category || selectedQuestionIds.length === 0) {
        console.error('Validation failed: Name, category, and questions required.');
        // Add user-friendly feedback (e.g., toast)
        return;
    }
    
    // Include order in the payload
    const payload = { name, questions: selectedQuestionIds, category, order };

    if (editingComposite) {
      updateComposite(editingComposite._id, payload);
    } else {
      createComposite(payload);
    }
    closeModal();
  };

  const compositeItemStyle = "relative bg-secondary/75 p-5 rounded-lg text-center font-semibold uppercase tracking-wider cursor-pointer hover:bg-secondary/50 transition-colors";

  return (
    <div className="border-[3px] border-primary rounded-[20px] p-6 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Composites</h1>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 shadow">
          <PlusCircle size={20} />
          Create Composite
        </button>
      </div>

      {/* --- Tab Navigation --- */}
      <div className="mb-6 border-b border-gray-300">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('room')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === 'room'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Room
          </button>
          <button
            onClick={() => setActiveTab('f&b')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === 'f&b'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            F&B
          </button>
        </nav>
      </div>

      {/* --- Tab Content --- */}
      <div>
        {isLoading && composites.length === 0 ? (
           <p className="text-center text-gray-500 py-10">Loading composites...</p>
        ) : activeTab === 'room' ? (
          <CompositeList
            composites={roomComposites}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            itemStyle={compositeItemStyle}
            emptyMessage="No room composites found."
          />
        ) : (
          <CompositeList
            composites={fbComposites}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            itemStyle={compositeItemStyle}
            emptyMessage="No F&B composites found."
          />
        )}
      </div>


      {/* --- MODAL FOR CREATE/EDIT --- */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleFormSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingComposite ? 'Edit Composite' : 'Create New Composite'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Name Input */}
            <div className="mb-4 col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Composite Name</label>
              <input
                type="text" name="name" id="name"
                defaultValue={editingComposite?.name || ''}
                className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required autoFocus
              />
            </div>

            {/* Order Input */}
            <div className="mb-4 col-span-1">
                <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  name="order"
                  id="order"
                  defaultValue={editingComposite?.order || 0}
                  className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
            </div>

            {/* Category Select */}
            <div className="mb-4 col-span-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category" id="category"
                value={modalCategory}
                onChange={(e) => setModalCategory(e.target.value as 'room' | 'f&b')}
                disabled={!!editingComposite} // Disable changing category on edit
                className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50 disabled:bg-gray-200"
              >
                <option value="room">Room</option>
                <option value="f&b">F&B</option>
              </select>
              {editingComposite && <p className="text-xs text-gray-500 mt-1">Category cannot be changed after creation.</p>}
            </div>
          </div>

          {/* Question Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Questions (from {modalCategory.toUpperCase()} category)</label>
            <QuestionSelector
              allQuestions={questions}
              selectedCategory={modalCategory}
              defaultChecked={editingComposite?.questions}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompositesPageMngt;