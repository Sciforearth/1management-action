import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplaints, fetchAssignedComplaints, setFilters, setAppliedFilters, setCurrentPage, clearFilters } from './store/complaintsSlice';
import ComplaintModal from './ComplaintModal';
import { rembaseApp } from './backend';
import optionsData from '../options';

function ComplaintsPage({ assignedToMe = false }) {
  const dispatch = useDispatch();
  const { complaints, loading, error, filters, appliedFilters, pagination } = useSelector((state) => state.complaints);
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [problemTypes, setProblemTypes] = useState([]);

  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    query: '',
    status: '',
    plan: '',
    isAssigned: '',
    city: '',
    municipalCorporation: '',
    dateFrom: '',
    dateTo: '',
    strCode: ''
  });

  // Process problem types from options.json
  const processProblemTypes = () => {
    const problemTypesArray = [];
    
    // Convert the nested structure to a flat array
    Object.entries(optionsData).forEach(([category, problems]) => {
      Object.entries(problems).forEach(([problemName, problemCode]) => {
        problemTypesArray.push({
          code: problemCode,
          name: problemName,
          category: category
        });
      });
    });
    
    console.log('Processed problem types:', problemTypesArray);
    setProblemTypes(problemTypesArray);
  };

  useEffect(() => {
    // Process problem types on component mount
    processProblemTypes();
    
    if (assignedToMe) {
      // Load complaints assigned to current user via dedicated endpoint
      dispatch(fetchAssignedComplaints());
    } else {
      dispatch(fetchComplaints());
    }
  }, [dispatch, assignedToMe]);

  // Debug: Log when problemTypes changes
  useEffect(() => {
    console.log('Problem types state updated:', problemTypes);
  }, [problemTypes]);

  useEffect(() => {
    if (Object.keys(appliedFilters).length > 0 && !assignedToMe) {
      dispatch(fetchComplaints(appliedFilters));
    }
  }, [appliedFilters, dispatch, assignedToMe]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    const filtersToApply = {};
    
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined) {
        filtersToApply[key] = value;
      }
    });
    
    dispatch(setAppliedFilters(filtersToApply));
    dispatch(setCurrentPage(1)); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setLocalFilters({
      query: '',
      status: '',
      plan: '',
      isAssigned: '',
      city: '',
      municipalCorporation: '',
      dateFrom: '',
      dateTo: '',
      strCode: ''
    });
    dispatch(clearFilters());
    dispatch(setCurrentPage(1));
  };

  const handleRemoveFilter = (key) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: ''
    }));
    
    const newFilters = { ...localFilters, [key]: '' };
    const filtersToApply = {};
    
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== '' && v !== undefined) {
        filtersToApply[k] = v;
      }
    });
    
    dispatch(setAppliedFilters(filtersToApply));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    // Fetch complaints with the new page
    if (assignedToMe) {
      dispatch(fetchAssignedComplaints());
    } else {
      dispatch(fetchComplaints(appliedFilters));
    }
  };

  const handleRowClick = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
  };

  // Pagination logic - use server-side pagination
  const totalPages = pagination.totalPages || Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  const currentComplaints = complaints; // API already returns paginated data

  // Get unique values for filter options
  const uniqueCities = useMemo(() => [...new Set(complaints.map(c => c.city))], [complaints]);
  const uniqueMunicipalCorporations = useMemo(() => [...new Set(complaints.map(c => c.municipalCorporation))], [complaints]);

  if (loading && complaints.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Loading complaints...</div>
        </div>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {assignedToMe ? 'Complaints Assigned to Me' : 'Complaints Management'}
        </h1>
        
        {/* Search and Basic Filters - Only show if not in "Assigned to Me" mode */}
        {!assignedToMe && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={localFilters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in process">In Process</option>
                  <option value="resolved">Resolved</option>
                </select>
                
                <select
                  value={localFilters.plan}
                  onChange={(e) => handleFilterChange('plan', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Plans</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="pro+">Pro+</option>
                </select>
                
                <select
                  value={localFilters.isAssigned}
                  onChange={(e) => handleFilterChange('isAssigned', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Assigned</option>
                  <option value="false">Unassigned</option>
                </select>
                
                <select
                  value={localFilters.strCode}
                  onChange={(e) => handleFilterChange('strCode', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Problem Types ({problemTypes.length})</option>
                  {problemTypes.map((problemType, index) => (
                    <option key={problemType.code} value={problemType.code}>
                      {problemType.name} ({problemType.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-white hover:text-white text-sm font-medium"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={localFilters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipal Corporation</label>
                  <select
                    value={localFilters.municipalCorporation}
                    onChange={(e) => handleFilterChange('municipalCorporation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Corporations</option>
                    {uniqueMunicipalCorporations.map(corp => (
                      <option key={corp} value={corp}>{corp}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Problem Type</label>
                  <select
                    value={localFilters.strCode}
                    onChange={(e) => handleFilterChange('strCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Problem Types ({problemTypes.length})</option>
                    {problemTypes.map((problemType, index) => (
                      <option key={problemType.code} value={problemType.code}>
                        {problemType.name} ({problemType.category})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={localFilters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={localFilters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Filter Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Applying...
                  </>
                ) : (
                  'Apply Filters'
                )}
              </button>
              
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Active Filters */}
            {Object.keys(appliedFilters).length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(appliedFilters).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                    >
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {value}</span>
                      <button
                        onClick={() => handleRemoveFilter(key)}
                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Remove filter"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
                         )}
           </>
         )}
       </div>

      {/* Complaints Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentComplaints.map((complaint) => (
                <tr
                  key={complaint._id}
                  onClick={() => handleRowClick(complaint)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {complaint.desc?.slice(0, 50) || complaint.description?.slice(0, 50)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>{complaint.city}</div>
                      <div className="text-xs text-gray-500">{complaint.municipalCorporation}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      complaint.status === 'in process' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {complaint.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {complaint.assignedTo ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {complaints.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700 text-center sm:text-left">
            Showing {currentComplaints.length} of {pagination.totalItems} results (Page {pagination.currentPage} of {totalPages})
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {totalPages > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {/* Smart pagination with ellipsis */}
                {(() => {
                  const currentPage = pagination.currentPage;
                  const totalPagesNum = totalPages;
                  const pages = [];
                  
                  if (totalPagesNum <= 7) {
                    // Show all pages if 7 or fewer
                    for (let i = 1; i <= totalPagesNum; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Show smart pagination for more than 7 pages
                    if (currentPage <= 4) {
                      // Show first 5 pages + ellipsis + last page
                      for (let i = 1; i <= 5; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPagesNum);
                    } else if (currentPage >= totalPagesNum - 3) {
                      // Show first page + ellipsis + last 5 pages
                      pages.push(1);
                      pages.push('...');
                      for (let i = totalPagesNum - 4; i <= totalPagesNum; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
                      pages.push(1);
                      pages.push('...');
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPagesNum);
                    }
                  }
                  
                  return pages.map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-500">
                        ...
                      </span>
                    ) : (
                                             <button
                         key={page}
                         onClick={() => handlePageChange(page)}
                         className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                           page === currentPage
                             ? 'bg-blue-600 text-white shadow-sm'
                             : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                         }`}
                       >
                         {page}
                       </button>
                    )
                  ));
                })()}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === totalPages}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </>
            )}
            {totalPages <= 1 && complaints.length > 0 && (
              <div className="text-sm text-gray-500">
                Page 1 of 1
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default ComplaintsPage; 