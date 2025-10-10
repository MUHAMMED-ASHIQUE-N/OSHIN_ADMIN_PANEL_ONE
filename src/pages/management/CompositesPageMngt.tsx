import React, { useState, useEffect } from 'react';
import { useManagementStore, Composite } from '../../stores/managementStore';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';

const CompositesPageMngt: React.FC = () => {
  const { 
    composites, 
    questions, // ✅ Get the list of all questions
    isLoading, 
    fetchComposites, 
    fetchQuestions, // ✅ Get the fetch action for questions
    createComposite,
    updateComposite,
    deleteComposite,
  } = useManagementStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComposite, setEditingComposite] = useState<Composite | null>(null);

  useEffect(() => {
    // Fetch both composites and questions when the component mounts
    fetchComposites();
    fetchQuestions();
  }, [fetchComposites, fetchQuestions]);
  
  const openCreateModal = () => {
    setEditingComposite(null); // Ensure we're in 'create' mode
    setIsModalOpen(true);
  };

  const openEditModal = (composite: Composite) => {
    setEditingComposite(composite); // Set the composite to be edited
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
    
    // Get all selected question IDs from the checkboxes
    const selectedQuestionIds: string[] = [];
    formData.forEach((_, key) => {
      if (key.startsWith('question-')) {
        selectedQuestionIds.push(key.split('-')[1]);
      }
    });

    if (!name || selectedQuestionIds.length === 0) {
      alert('Please provide a name and select at least one question.');
      return;
    }
    
    const payload = { name, questions: selectedQuestionIds };

    if (editingComposite) {
      // We are in 'edit' mode
      updateComposite(editingComposite._id, payload);
    } else {
      // We are in 'create' mode
      createComposite(payload);
    }
    closeModal();
  };

  // --- STYLES ---
  const compositeItemStyle = "relative bg-secondary/75 p-5 rounded-lg text-center font-semibold uppercase tracking-wider cursor-pointer hover:bg-secondary/50 transition-colors";

  if (isLoading && composites.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="border-[3px] border-primary rounded-[20px] p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Composites</h1>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90">
          <PlusCircle size={20} />
          Create Composite
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {composites.map(comp => (
          <div key={comp._id} className={compositeItemStyle}>
            <span className="pr-12">{comp.name}</span>
            <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2">
              <button onClick={() => openEditModal(comp)} className="p-1 text-primary/70 hover:text-primary" title="Edit">
                <Edit size={18} />
              </button>
              <button onClick={() => openDeleteModal(comp)} className="p-1 text-red-500/70 hover:text-primary" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL FOR CREATE/EDIT --- */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleFormSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingComposite ? 'Edit Composite' : 'Create New Composite'}
          </h2>
          {/* Name Input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Composite Name</label>
            <input
              type="text" name="name" id="name"
              defaultValue={editingComposite?.name || ''}
              className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required autoFocus
            />
          </div>

          {/* Question Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Questions</label>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
              {questions.map(q => (
                <div key={q._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`question-${q._id}`}
                    name={`question-${q._id}`} // The name helps identify it in formData
                    value={q._id}
                    // Pre-check the box if we are editing and the question is already included
                    defaultChecked={editingComposite?.questions.includes(q._id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 "
                  />
                  <label htmlFor={`question-${q._id}`} className="ml-2 block text-sm text-gray-900">{q.text}</label>
                </div>
              ))}
            </div>
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