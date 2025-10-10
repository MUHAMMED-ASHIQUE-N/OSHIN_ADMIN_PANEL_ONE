import React, { useState, useEffect } from 'react';
import { useManagementStore, Staff } from '../../stores/managementStore';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import Modal from '../../components/common/Modal'; // Assuming your modal is here

const StaffPage: React.FC = () => {
  const { 
    staff, 
    isLoading, 
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
  } = useManagementStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const openCreateModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const openEditModal = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleDelete = (staffMember: Staff) => {
    const action = staffMember.isActive ? 'deactivate' : 'reactivate';
    if (window.confirm(`Are you sure you want to ${action} ${staffMember.fullName}?`)) {
      // Our "delete" endpoint actually toggles the active status, so we can use it for both.
      // For a true "reactivate" you might need a different endpoint or logic in the update function.
      // For now, we will use the soft delete.
      deleteStaff(staffMember._id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = formData.get('fullName') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!fullName || !username) {
      alert('Full Name and Username are required.');
      return;
    }

    if (editingStaff) {
      updateStaff(editingStaff._id, { fullName, username });
    } else {
      if (!password) {
        alert('Password is required for new staff members.');
        return;
      }
      createStaff({ fullName, username, password });
    }
    closeModal();
  };

  if (isLoading && staff.length === 0) {
    return <p className="text-center text-gray-500">Loading staff...</p>;
  }

  return (
    <div style={{ color: '#650933' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Staff</h1>
        <button 
          onClick={openCreateModal} 
          className="flex items-center gap-2 bg-[#650933] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
        >
          <PlusCircle size={20} />
          Add Staff Member
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <ul className="divide-y divide-gray-200">
          {staff.map(s => (
            <li key={s._id} className="flex items-center justify-between p-3">
              <div>
                <span className="font-medium text-gray-800">{s.fullName}</span>
                <span className="text-sm text-gray-500 ml-2">(@{s.username})</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => openEditModal(s)} className="text-blue-500 hover:text-blue-700" title="Edit">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(s)} className="text-red-500 hover:text-red-700" title={s.isActive ? 'Deactivate' : 'Reactivate'}>
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* --- MODAL FOR CREATE/EDIT --- */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text" name="fullName" id="fullName"
              defaultValue={editingStaff?.fullName || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#650933] focus:ring-[#650933] py-2 px-4"
              required autoFocus
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text" name="username" id="username"
              defaultValue={editingStaff?.username || ''}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 px-4 shadow-sm focus:border-[#650933] focus:ring-[#650933]"
              required
            />
          </div>
          {/* Only show the password field when creating a new user */}
          {!editingStaff && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password" name="password" id="password"
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-4 shadow-sm focus:border-[#650933] focus:ring-[#650933]"
                required
              />
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-[#650933] text-white hover:bg-opacity-90">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffPage;