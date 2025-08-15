import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComplaintUpdate, assignComplaintToMe } from './store/complaintsSlice';
import { rembaseApp } from './backend';

function ComplaintModal({ complaint, onClose }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.complaints);
  
  const [activeTab, setActiveTab] = useState('details');
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

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

  const handleAssignToMe = async () => {
    try {
      await dispatch(assignComplaintToMe({ 
        complaintId: complaint._id 
      })).unwrap();
      
      alert('Complaint assigned to you successfully!');
      
    } catch (error) {
      console.error('Failed to assign complaint:', error);
      alert('Failed to assign complaint. Please try again.');
    }
  };

  const handleMarkForDeletion = async () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deletion.');
      return;
    }
    
    try {
      const updateData = {
        date: formatDateForPayload(new Date()),
        message: `Marked for Deletion : ${deleteReason.trim()}`,
        request: 'delete'
      };
      
      await dispatch(addComplaintUpdate({ 
        complaintId: complaint._id, 
        update: updateData 
      })).unwrap();
      
      // Clear the form and close modals
      setDeleteReason('');
      setShowDeleteModal(false);
      onClose(); // Close the main modal
      
      alert('Complaint marked for deletion successfully!');
      
    } catch (error) {
      console.error('Failed to mark for deletion:', error);
      alert('Failed to mark for deletion. Please try again.');
    }
  };

  const handleCancelDeletion = () => {
    setDeleteReason('');
    setShowDeleteModal(false);
  };

  // Check if current user can add updates (mcEmployee or assigned to this complaint)
  const canAddUpdates = () => {
    const currentUser = rembaseApp?.currentUser;
    if (!currentUser) return false;
    
    // Check if user is mcEmployee
    const isMcEmployee = currentUser.customData?.userType === 'mcEmployee';
    
    // Check if user is assigned to this complaint
    const isAssigned = complaint.assignedTo === currentUser.id;
    
    return isMcEmployee || isAssigned;
  };

  // Check if current user can view updates (everyone can view updates)
  const canViewUpdates = () => {
    return true; // Everyone can view updates regardless of assignment
  };

  // Check if current user is assigned to this complaint
  const isAssignedToMe = () => {
    const currentUser = rembaseApp?.currentUser;
    if (!currentUser) return false;
    return complaint.assignedTo === currentUser.id;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Complaint Details</h2>
          <p className="text-gray-600">ID: {complaint._id}</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isAssignedToMe() && (
            <button 
              onClick={handleAssignToMe}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Assigning...' : 'Assign to Me'}
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

              <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
          
            {canViewUpdates() && (
              <button
                onClick={() => setActiveTab('updates')}
                className={`py-4 px-1 border-b-2 font-medium text-white text-sm ${
                  activeTab === 'updates'
                    ? 'border-blue-500 text-white '
                    : 'border-transparent text-white '
                }`}
              >
                Updates ({complaint.updates?.length || 0})
              </button>
            )}
          </nav>
        </div>

      <div className="overflow-y-auto flex-1">
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
            
            {/* Media Section */}
            {complaint.imageUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {complaint.media_type === 'video' ? (
                    <video
                      src={complaint.imageUrl}
                      controls
                      style={{ width: '200px', height: '200px' }}
                      className="rounded-lg shadow-md object-cover mx-auto"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint"
                      style={{ width: '200px', height: '200px' }}
                      className="rounded-lg shadow-md object-cover mx-auto"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Mark for Deletion Section - Only show if assigned to current user */}
            {isAssignedToMe() && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-md font-medium bg-red-900 mb-2">Mark for Deletion</h4>
                      <p className="text-red-700 text-sm">
                        Mark this complaint for deletion. This action will add a deletion request to the complaint history.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      disabled={loading}
                      style={{backgroundColor: 'red'}}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-300 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Processing...' : 'Mark for Deletion'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
                  )}

          {activeTab === 'assigned' && (
            <div className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned Complaints</h3>
                <p className="text-gray-600 mb-4">This feature will show complaints assigned to you.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Current Complaint:</strong> {complaint.assignedTo ? 'Assigned to ' + complaint.assignedTo : 'Not assigned'}
                  </p>
                  {isAssignedToMe() && (
                    <p className="text-green-800 text-sm mt-2">
                      ✓ This complaint is assigned to you
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update History</h3>
              {canAddUpdates() && (
                <button
                  onClick={() => setShowAddUpdate(!showAddUpdate)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  {showAddUpdate ? 'Cancel' : 'Add Update'}
                </button>
              )}
            </div>
            
            {showAddUpdate && canAddUpdates() && (
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
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
            
            {!canAddUpdates() && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> You can view all updates, but only assigned users or MC employees can add new updates.
                </p>
              </div>
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

    {/* Deletion Confirmation Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Mark for Deletion</h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to mark this complaint for deletion? Please provide a reason for the deletion request.
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Deletion *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter the reason for marking this complaint for deletion..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                required
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCancelDeletion}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkForDeletion}
                disabled={!deleteReason.trim() || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Mark for Deletion'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}

export default ComplaintModal; 