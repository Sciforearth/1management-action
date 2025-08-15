import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComplaintUpdate } from './store/complaintsSlice';

function ComplaintModal({ complaint, onClose }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.complaints);
  
  const [activeTab, setActiveTab] = useState('details');
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateForPayload = (date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in process':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    return status || 'Pending';
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'pro+':
        return 'bg-purple-100 text-purple-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    
    try {
      const updateData = {
        date: formatDateForPayload(new Date()),
        message: newUpdate.trim()
      };
      
      await dispatch(addComplaintUpdate({ 
        complaintId: complaint._id, 
        update: updateData 
      })).unwrap();
      
      // Clear the form and close the add update section
      setNewUpdate('');
      setShowAddUpdate(false);
      
    } catch (error) {
      console.error('Failed to add update:', error);
      alert('Failed to add update. Please try again.');
    }
  };

  const handleCancelUpdate = () => {
    setNewUpdate('');
    setShowAddUpdate(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complaint Details</h2>
            <p className="text-gray-600">ID: {complaint._id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'updates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Updates ({complaint.updates?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'media'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Media
            </button>
          </nav>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {complaint.desc}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Street Code</label>
                    <p className="mt-1 text-sm text-gray-900">{complaint.strCode}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {getStatusText(complaint.status)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(complaint.plan)}`}>
                      {complaint.plan}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <p className="mt-1 text-sm text-gray-900">{complaint.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Location Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{complaint.address}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <p className="mt-1 text-sm text-gray-900">{complaint.city}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Municipal Corporation</label>
                    <p className="mt-1 text-sm text-gray-900">{complaint.municipalCorporation}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Created</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(complaint.date)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Update History</h3>
                <button
                  onClick={() => setShowAddUpdate(!showAddUpdate)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {showAddUpdate ? 'Cancel' : 'Add Update'}
                </button>
              </div>
              
              {showAddUpdate && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-md font-medium text-blue-900 mb-3">Add New Update</h4>
                  <textarea
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Enter update message..."
                    className="w-full p-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    disabled={loading}
                  />
                  <div className="flex space-x-3 mt-3">
                    <button
                      onClick={handleAddUpdate}
                      disabled={!newUpdate.trim() || loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : 'Add Update'}
                    </button>
                    <button
                      onClick={handleCancelUpdate}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {complaint.updates && complaint.updates.length > 0 ? (
                <div className="space-y-4">
                  {complaint.updates.map((update, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{update.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(update.date)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No updates available</p>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>
              {complaint.imageUrl ? (
                <div>
                  <img
                    src={complaint.imageUrl}
                    alt="Complaint"
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No media available</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComplaintModal; 