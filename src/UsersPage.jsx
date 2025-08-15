import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from './store/usersSlice';

function UsersPage() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddToTeam, setShowAddToTeam] = useState(false);
  const [addToTeamForm, setAddToTeamForm] = useState({
    name: '',
    email: '',
    organization: '',
    role: ''
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRowClick = (user) => {
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const handleAddToTeam = () => {
    setShowAddToTeam(true);
  };

  const closeAddToTeam = () => {
    setShowAddToTeam(false);
    setAddToTeamForm({
      name: '',
      email: '',
      organization: '',
      role: ''
    });
  };

  const handleFormChange = (field, value) => {
    setAddToTeamForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!addToTeamForm.name || !addToTeamForm.email || !addToTeamForm.organization || !addToTeamForm.role) {
      alert('Please fill in all fields');
      return;
    }

    // Log the payload (replace with actual API call)
    console.log('Adding user to team:', addToTeamForm);
    
    // Close modal and reset form
    closeAddToTeam();
    alert('User added to team successfully!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={handleAddToTeam}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add to your team
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user._id}
                  onClick={() => handleRowClick(user)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.picture || user.customData?.photoUrl || 'https://via.placeholder.com/40'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || user.customData?.name}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.customData?.userType === 'Advocate' ? 'bg-blue-100 text-blue-800' :
                      user.customData?.userType === 'mcEmployee' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.customData?.userType || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.customData?.userEmployer || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.customData?.score || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.customData?.lastLogin ? formatDate(user.customData.lastLogin) : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <p className="text-gray-600">ID: {selectedUser.id}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.name || selectedUser.customData?.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.customData?.phone || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.customData?.country || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.customData?.userType || 'Unknown'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employer</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.customData?.userEmployer || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Score</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.customData?.score || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verification</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Login Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Login</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedUser.firstLogin ? formatDate(selectedUser.firstLogin) : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedUser.customData?.lastLogin ? formatDate(selectedUser.customData.lastLogin) : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Providers</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.providers?.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Team Modal */}
      {showAddToTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add User to Team</h2>
              <button onClick={closeAddToTeam} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={addToTeamForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={addToTeamForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization/Group *
                </label>
                <input
                  type="text"
                  id="organization"
                  value={addToTeamForm.organization}
                  onChange={(e) => handleFormChange('organization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  value={addToTeamForm.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Advocate">Advocate</option>
                  <option value="mcEmployee">MC Employee</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={closeAddToTeam}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;