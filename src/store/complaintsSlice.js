import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rembaseApp } from '../backend';

// Async thunk for fetching complaints
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      // Prepare filter payload for the API
      const filterPayload = {};
      
      // Add filters to payload if they exist
      if (filters.query) {
        filterPayload.query = filters.query;
      }
      if (filters.status) {
        filterPayload.status = filters.status;
      }
      if (filters.plan) {
        filterPayload.plan = filters.plan;
      }
      if (filters.isAssigned !== undefined) {
        filterPayload.isAssigned = filters.isAssigned;
      }
      if (filters.city) {
        filterPayload.city = filters.city;
      }
      if (filters.municipalCorporation) {
        filterPayload.municipalCorporation = filters.municipalCorporation;
      }
      if (filters.dateFrom) {
        filterPayload.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        filterPayload.dateTo = filters.dateTo;
      }
      if (filters.strCode) {
        filterPayload.strCode = filters.strCode;
      }
      
      // Add pagination parameters
      const state = getState();
      const { currentPage: pageNum, itemsPerPage: limitNum } = state.complaints.pagination;
      filterPayload.page = pageNum;
      filterPayload.limit = limitNum;

      // Call the real API
      const response = await rembaseApp.currentUser?.callFunction("complaints", filterPayload);
      
      if (!response || !response.data) {
        throw new Error('No data received from API');
      }

      // Handle paginated response based on API structure
      const complaints = response.data;
      const totalItems = response.total;
      const totalPages = response.totalPages;
      const apiCurrentPage = response.currentPage;

      // Return the complaints data with filters and pagination info
      return { 
        complaints: complaints, 
        filters: filterPayload,
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: apiCurrentPage
      };
      
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return rejectWithValue(error.message || 'Failed to fetch complaints');
    }
  }
);

// Async thunk for fetching complaints assigned to current user
export const fetchAssignedComplaints = createAsyncThunk(
  'complaints/fetchAssignedComplaints',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Pagination parameters
      const state = getState();
      const { currentPage: pageNum, itemsPerPage: limitNum } = state.complaints.pagination;

      const payload = { page: pageNum, limit: limitNum };

      const response = await rembaseApp.currentUser?.callFunction('issue/assigned', payload);

      if (!response || !response.data) {
        throw new Error('No data received from API');
      }

      const complaints = response.data;
      const totalItems = response.total;
      const totalPages = response.totalPages;
      const apiCurrentPage = response.currentPage;

      return {
        complaints,
        filters: {},
        totalItems,
        totalPages,
        currentPage: apiCurrentPage,
      };
    } catch (error) {
      console.error('Error fetching assigned complaints:', error);
      return rejectWithValue(error.message || 'Failed to fetch assigned complaints');
    }
  }
);

// Async thunk for adding an update
export const addComplaintUpdate = createAsyncThunk(
  'complaints/addUpdate',
  async ({ complaintId, update }, { rejectWithValue }) => {
    try {
      const payload = {
        date: update.date,
        id: complaintId,
        message: update.message
      };
      
      console.log('Sending update payload:', payload);
      
      // Call the rembaseApp function
      await rembaseApp?.currentUser?.callFunction("issue_update/create", payload);

      // Return the update data to add to local state
      return {
        complaintId,
        update: {
          message: update.message,
          date: update.date
        }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for assigning complaint to current user
export const assignComplaintToMe = createAsyncThunk(
  'complaints/assignToMe',
  async ({ complaintId }, { rejectWithValue }) => {
    try {
      const currentUser = rembaseApp?.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const payload = {
        id: complaintId,
        assignedTo: currentUser.id,
        assignedToName: currentUser.name || currentUser.email
      };
      
      console.log('Assigning complaint to current user:', payload);
      
      // Call the rembaseApp function to assign complaint
      await rembaseApp?.currentUser?.callFunction("issue/selfAssign", payload);
      
      // Return the assignment data
      return {
        complaintId,
        assignedTo: currentUser.id,
        assignedToName: currentUser.name || currentUser.email
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  complaints: [],
  loading: false,
  error: null,
  filters: {},
  appliedFilters: {},
  // Track which list is currently in view so we can refresh appropriately
  listSource: 'all', // 'all' | 'assigned'
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  }
};

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setAppliedFilters: (state, action) => {
      state.appliedFilters = action.payload;
    },
    setListSource: (state, action) => {
      state.listSource = action.payload; // 'all' | 'assigned'
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.appliedFilters = {};
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch complaints
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload.complaints;
        state.pagination.totalItems = action.payload.totalItems;
        state.pagination.totalPages = action.payload.totalPages;
        state.pagination.currentPage = action.payload.currentPage;
        state.filters = action.payload.filters;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch assigned complaints
      .addCase(fetchAssignedComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload.complaints;
        state.pagination.totalItems = action.payload.totalItems;
        state.pagination.totalPages = action.payload.totalPages;
        state.pagination.currentPage = action.payload.currentPage;
        // filters not applicable here; leave as is
      })
      .addCase(fetchAssignedComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add update
      .addCase(addComplaintUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComplaintUpdate.fulfilled, (state, action) => {
        state.loading = false;
        const { complaintId, update } = action.payload;
        const complaint = state.complaints.find(c => c._id === complaintId);
        if (complaint) {
          if (!complaint.updates) {
            complaint.updates = [];
          }
          complaint.updates.push(update);
        }
      })
      .addCase(addComplaintUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Assign complaint to me
      .addCase(assignComplaintToMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignComplaintToMe.fulfilled, (state, action) => {
        state.loading = false;
        const { complaintId, assignedTo, assignedToName } = action.payload;
        const complaint = state.complaints.find(c => c._id === complaintId);
        if (complaint) {
          complaint.assignedTo = assignedTo;
          complaint.assignedToName = assignedToName;
        }
      })
      .addCase(assignComplaintToMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setFilters, 
  setAppliedFilters, 
  setCurrentPage, 
  clearFilters, 
  clearError,
  setListSource 
} = complaintsSlice.actions;

export default complaintsSlice.reducer; 