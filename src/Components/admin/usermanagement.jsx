import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaSearch } from 'react-icons/fa';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CryptoJS from 'crypto-js';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'user',
    password: '',
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://rlaijbartary1.onrender.com/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('❌ Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (user) => {
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
    setEditUserId(user.userId);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Perform the delete request
        const response = await axios.delete(
          `https://rlaijbartary1.onrender.com/api/user/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Check if response status is success
        if (response.status === 200 || response.status === 204) {
          toast.success('🗑️ User deleted successfully!');
          setUsers(users.filter((u) => u.userId !== id));
        } else {
          toast.error('❌ Failed to delete user.');
        }
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('❌ Failed to delete user.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        passwordHash: formData.password, // Just send raw password here
      };

      if (isEditing) {
        payload.userId = editUserId;
        delete payload.passwordHash; // avoid changing password on edit
        await axios.put('https://rlaijbartary1.onrender.com/api/user', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('✅ User updated successfully!');
      } else {
        await axios.post('https://rlaijbartary1.onrender.com/api/user', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('✅ User added successfully!');
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setEditUserId(null);
      setFormData({ fullName: '', email: '', role: 'user', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('❌ Failed to submit user.');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full p-6 font-body">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
        >
          <FaArrowLeft /> Back
        </button>
        <button
          onClick={() => {
            setFormData({ fullName: '', email: '', role: 'user' });
            setIsModalOpen(true);
            setIsEditing(false);
            setEditUserId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <FaPlus /> Add User
        </button>
      </div>

      <div className="flex justify-end mb-4">
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm w-64">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-transparent outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {loading ? (
          <p className="p-4 text-gray-600">Loading users...</p>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.userId}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{user.fullName}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center space-x-4">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="text-indigo-600 hover:text-indigo-800 transition"
                      title="Edit"
                    >
                      <MdEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.userId)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <MdDeleteOutline size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative font-body">
            <button
              className="absolute top-2 right-3 text-black hover:text-red-600 text-lg font-bold"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditing(false);
                setEditUserId(null);
              }}
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4 font-heading">
              {isEditing ? '✏️ Edit User' : '➕ Add New User'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required={!isEditing} // required only on add
                className="w-full px-3 py-2 border rounded"
              />

              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                {isEditing ? 'Update User' : 'Add User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
