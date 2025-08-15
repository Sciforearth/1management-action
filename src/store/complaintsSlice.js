import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rembaseApp } from '../backend';

// Async thunk for fetching complaints
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (filters = {}, { rejectWithValue }) => {
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

      // Call the real API
      const response = await rembaseApp.currentUser?.callFunction("complaints", filterPayload);
      
      if (!response || !response.data) {
        throw new Error('No data received from API');
      }

      // Return the complaints data with filters
      return { 
        complaints: response.data, 
        filters: filterPayload 
      };
      
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return rejectWithValue(error.message || 'Failed to fetch complaints');
    }
  }
);

// Async thunk for adding an update
export const addComplaintUpdate = createAsyncThunk(
  'complaints/addUpdate',
  async ({ complaintId, update }, { rejectWithValue, getState }) => {
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
        state.pagination.totalItems = action.payload.complaints.length;
        state.filters = action.payload.filters;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
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
  clearError 
} = complaintsSlice.actions;

export default complaintsSlice.reducer; 