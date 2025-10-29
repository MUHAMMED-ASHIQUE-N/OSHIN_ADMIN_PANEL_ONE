import React, { useState, useEffect, useMemo } from 'react';
// Corrected import path assuming stores is two levels up
import { useManagementStore, Question } from '../../stores/managementStore';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
// Corrected import path assuming components is two levels up
import Modal from '../../components/common/Modal';

// --- Reusable Question List Component ---
interface QuestionListProps {
  list: Question[];
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  emptyMessage: string;
}

const QuestionList: React.FC<QuestionListProps> = ({ list, onEdit, onDelete, emptyMessage }) => {
  if (list.length === 0) {
     return <p className="text-gray-500 text-center p-4">{emptyMessage}</p>;
  }
  
  // Sort list by order before rendering
  const sortedList = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <ul className="divide-y divide-gray-200">
      {sortedList.map(q => (
        <li key={q._id} className="flex items-center justify-between p-3 hover:bg-gray-50">
          <div>
            <span className="font-medium text-gray-700">(Order: {q.order || 0}) {q.text}</span>
            <span className="ml-3 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full capitalize">{q.questionType.replace('_', '/')}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onEdit(q)} className="text-blue-500 hover:text-blue-700" title="Edit">
              <Edit size={18} />
            </button>
            <button onClick={() => onDelete(q)} className="text-red-500 hover:text-red-700" title="Delete">
              <Trash2 size={18} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};


// --- Main Page Component ---
const QuestionsPage: React.FC = () => {
  const {
    questions,
    isLoading,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useManagementStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState<'room' | 'f&b'>('room');

  const { roomQuestions, fbQuestions } = useMemo(() => {
    return {
      roomQuestions: questions.filter(q => q.category === 'room'),
      fbQuestions: questions.filter(q => q.category === 'f&b'),
    };
  }, [questions]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const openDeleteModal = (question: Question) => {
    if (window.confirm(`Are you sure you want to delete "${question.text}"? This action cannot be undone.`)) {
        deleteQuestion(question._id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = formData.get('text') as string;
    const category = formData.get('category') as 'room' | 'f&b';
    const questionType = formData.get('questionType') as 'rating' | 'yes_no';
    const order = Number(formData.get('order') || 0); // Get order

    if (!text || !category || !questionType) {
       console.error('Validation failed: All fields are required.');
       // Add user-friendly feedback (e.g., toast)
       return;
    }

    // Include order in the payload
    const payload = { text, category, questionType, order };

    if (editingQuestion) {
      updateQuestion(editingQuestion._id, payload);
    } else {
      createQuestion(payload);
    }
    closeModal();
  };


  return (
    <div className="text-primary border-[3px] border-primary rounded-[20px] p-6 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Questions</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 shadow"
        >
          <PlusCircle size={20} />
          Create Question
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
      <div className="bg-white rounded-lg shadow-md  overflow-y-scroll">
        {isLoading && questions.length === 0 ? (
          <p className="text-center text-gray-500 p-10">Loading questions...</p>
        ) : activeTab === 'room' ? (
          <QuestionList
            list={roomQuestions}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            emptyMessage="No room questions found."
          />
        ) : (
          <QuestionList
            list={fbQuestions}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            emptyMessage="No F&B questions found."
          />
        )}
      </div>

      {/* --- MODAL FOR CREATE/EDIT --- */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleFormSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingQuestion ? 'Edit Question' : 'Create New Question'}
          </h2>

          {/* Text Input */}
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">Question Text</label>
            <textarea
              name="text"
              id="text"
              defaultValue={editingQuestion?.text || ''}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Category Select */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category" id="category"
                defaultValue={editingQuestion ? editingQuestion.category : activeTab}
                className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="room">Room</option>
                <option value="f&b">F&B</option>
              </select>
            </div>

            {/* Question Type Select */}
            <div className="mb-4">
              <label htmlFor="questionType" className="block text-sm font-medium text-gray-700">Question Type</label>
              <select
                name="questionType" id="questionType"
                defaultValue={editingQuestion?.questionType || 'rating'}
                className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="rating">Rating (1-10)</option>
                <option value="yes_no">Yes / No</option>
              </select>
            </div>
            
            {/* Order Input */}
            <div className="mb-4">
                <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  name="order"
                  id="order"
                  defaultValue={editingQuestion?.order || 0}
                  className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90">Save Question</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuestionsPage;