// frontend/pages/QuestionsPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useManagementStore, Question } from "../../stores/managementStore";
import { Edit, Trash2, PlusCircle, Eye, EyeOff } from "lucide-react";
import Modal from "../../components/common/Modal";
import { clsx } from "clsx";

// --- Reusable Question List Component ---
interface QuestionListProps {
  list: Question[];
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  emptyMessage: string;
  onToggleActive: (question: Question) => void; // Passed from main component
}

// ✅ FIXED: Added 'onToggleActive' to props destructuring
const QuestionList: React.FC<QuestionListProps> = ({
  list,
  onEdit,
  onDelete,
  emptyMessage,
  onToggleActive, // Now correctly received
}) => {
  if (list.length === 0) {
    return <p className="text-gray-500 text-center p-4">{emptyMessage}</p>;
  }

  const sortedList = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <ul className="divide-y divide-gray-200">
      {sortedList.map((q) => (
        <li
          key={q._id}
          className={clsx(
            "flex items-center justify-between p-3 hover:bg-gray-50",
            !q.isActive && "bg-gray-100 opacity-70" // Style for inactive
          )}
        >
          <div>
            <span className="font-medium text-gray-700">
              (Order: {q.order || 0}) {q.text}
            </span>
            <span className="ml-3 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full capitalize">
              {q.questionType.replace("_", "/")}
            </span>
            {/* ADD Inactive Badge */}
            {!q.isActive && (
              <span className="ml-3 text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full">
                INACTIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* ADD Toggle Button */}
            <button
              onClick={() => onToggleActive(q)} // This will now work
              className={clsx(
                "p-1",
                q.isActive
                  ? "text-gray-400 hover:text-green-600"
                  : "text-red-400 hover:text-red-600"
              )}
              title={q.isActive ? "Deactivate" : "Activate"}
            >
              {q.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <button
              onClick={() => onEdit(q)}
              className="text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(q)}
              className="text-red-500 hover:text-red-700"
              title="Delete"
            >
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
    toggleQuestionActive, // Imported from store
    deleteQuestion,
  } = useManagementStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState<"room" | "f&b" | "cfc">("room");

  const { roomQuestions, fbQuestions, cfcQuestions } = useMemo(() => {
    return {
      roomQuestions: questions.filter((q) => q.category === "room"),
      fbQuestions: questions.filter((q) => q.category === "f&b"),
      cfcQuestions: questions.filter((q) => q.category === "cfc"),
    };
  }, [questions]);

  // Handler to call the store action
  const handleToggleActive = (question: Question) => {
    toggleQuestionActive(question);
  };

  useEffect(() => {
    fetchQuestions(true);
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
    if (
      window.confirm(
        `Are you sure you want to delete "${question.text}"? This action cannot be undone.`
      )
    ) {
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
    const text = formData.get("text") as string;
    const category = formData.get("category") as "room" | "f&b" | "cfc";
    const questionType = formData.get("questionType") as "rating" | "yes_no";
    const order = Number(formData.get("order") || 0);
    const isActive = formData.get("isActive") === "on"; // Get value from checkbox

    if (!text || !category || !questionType) {
      console.error("Validation failed: All fields are required.");
      return;
    }

    const payload = { text, category, questionType, order, isActive }; // Pass isActive in payload
    if (editingQuestion) {
      updateQuestion(editingQuestion._id, payload);
    } else {
      createQuestion(payload);
    }
    closeModal();
  };

  // Helper for tab class names
  const getTabClassName = (tabName: 'room' | 'f&b' | 'cfc') => {
    return `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
      activeTab === tabName
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;
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
            onClick={() => setActiveTab("room")}
            className={getTabClassName('room')}
          >
            Room
          </button>
          <button
            onClick={() => setActiveTab("f&b")}
            className={getTabClassName('f&b')}
          >
            F&B
          </button>
          <button
            onClick={() => setActiveTab("cfc")}
            className={getTabClassName('cfc')}
          >
            CK
          </button>
        </nav>
      </div>

      {/* --- Tab Content --- */}
      <div className="bg-white rounded-lg shadow-md overflow-y-auto">
        {isLoading && questions.length === 0 ? (
          <p className="text-center text-gray-500 p-10">Loading questions...</p>
        ) : activeTab === "room" ? (
          <QuestionList
            list={roomQuestions}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onToggleActive={handleToggleActive} // Pass handler
            emptyMessage="No room questions found."
          />
        ) : activeTab === "f&b" ? (
          <QuestionList
            list={fbQuestions}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onToggleActive={handleToggleActive} // Pass handler
            emptyMessage="No F&B questions found."
          />
        ) : (
          <QuestionList
            list={cfcQuestions}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onToggleActive={handleToggleActive} // Pass handler
            emptyMessage="No CFC questions found."
          />
        )}
      </div>

      {/* --- MODAL FOR CREATE/EDIT --- */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleFormSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingQuestion ? "Edit Question" : "Create New Question"}
          </h2>

          {/* Text Input */}
          <div className="mb-4">
            <label
              htmlFor="text"
              className="block text-sm font-medium text-gray-700"
            >
              Question Text
            </label>
            <input
              name="text"
              id="text"
              defaultValue={editingQuestion?.text || ""}
              className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Category Select */}
            <div className="mb-4">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                name="category"
                id="category"
                defaultValue={
                  editingQuestion ? editingQuestion.category : activeTab
                }
                className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="room">Room</option>
                <option value="f&b">F&B</option>
                <option value="cfc">CFC</option>
              </select>
            </div>

            {/* Question Type Select */}
            <div className="mb-4">
              <label
                htmlFor="questionType"
                className="block text-sm font-medium text-gray-700"
              >
                Question Type
              </label>
              <select
                name="questionType"
                id="questionType"
                defaultValue={editingQuestion?.questionType || "rating"}
                className="mt-1 block py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="rating">Rating (1-10)</option>
                <option value="yes_no">Yes / No</option>
              </select>
            </div>

            {/* Order Input */}
            <div className="mb-4">
              <label
                htmlFor="order"
                className="block text-sm font-medium text-gray-700"
              >
                Order
              </label>
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

          {/* IsActive Toggle */}
          <div className="mt-4 mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={editingQuestion ? editingQuestion.isActive : true}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Active (Visible to users)
            </label>
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