import React, { useState, useEffect } from 'react';
import { useManagementStore, Question } from '../../stores/managementStore';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import Modal from '../../components/common/Modal'; // Assuming your modal is here

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
    if (window.confirm(`Are you sure you want to delete this question?\n\n"${question.text}"`)) {
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

    if (!text) {
      alert('Question text cannot be empty.');
      return;
    }

    const payload = { text };

    if (editingQuestion) {
      updateQuestion(editingQuestion._id, payload);
    } else {
      createQuestion(payload);
    }
    closeModal();
  };

  if (isLoading && questions.length === 0) {
    return <p className="text-center text-gray-500">Loading questions...</p>;
  }

  return (
    <div style={{ color: '#650933' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Questions</h1>
        <button 
          onClick={openCreateModal} 
          className="flex items-center gap-2 bg-[#650933] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
        >
          <PlusCircle size={20} />
          Create Question
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <ul className="divide-y divide-gray-200">
          {questions.map(q => (
            <li key={q._id} className="flex items-center justify-between p-3">
              <span className="font-medium text-gray-700">{q.text}</span>
              <div className="flex items-center gap-4">
                <button onClick={() => openEditModal(q)} className="text-blue-500 hover:text-blue-700" title="Edit">
                  <Edit size={18} />
                </button>
                <button onClick={() => openDeleteModal(q)} className="text-red-500 hover:text-red-700" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* --- MODAL FOR CREATE/EDIT --- */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleFormSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingQuestion ? 'Edit Question' : 'Create New Question'}
          </h2>
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">Question Text</label>
            <textarea
              name="text"
              id="text"
              defaultValue={editingQuestion?.text || ''}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#650933] focus:ring-[#650933] sm:text-sm"
              required
              autoFocus
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-[#650933] text-white hover:bg-opacity-90">Save Question</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuestionsPage;