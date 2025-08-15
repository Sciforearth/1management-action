import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rembaseApp } from '../backend';

// Async thunk for fetching complaints
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Simulate API call - replace with actual rembaseApp call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Mock data - replace with actual API response
          const mockComplaints = [
            {
              "_id": "68891590cadccbcaf4dadce1",
              "desc": "hbsdjcvokzxmn ebfwhijdpocsklxmdnucxk heijcskmx",
              "strCode": "2002",
              "aid": "id",
              "assignedTo": "Name",
              "status": "in process",
              "plan": "pro",
              "imageUrl": "https://oneapp1.s3.ap-south-1.amazonaws.com/Posts/non_logged/1753814393880_0.jpg",
              "media_type": "image",
              "coords": [77.10189435697313, 28.605817316957182],
              "rs": false,
              "type": "free",
              "address": "5, L, Sagarpur East, Sagar Pur, New Delhi, Delhi, 110046, India",
              "city": "New Delhi",
              "state": "Delhi",
              "municipalCorporation": "South West Delhi",
              "date": "2025-07-29T18:40:16.881Z",
              "updates": [
                {
                  "message": "Initial complaint registered",
                  "date": "2025-07-29T18:40:16.881Z"
                }
              ],
              "__v": 0
            },
            {
              "_id": "6880a924f1e71a3843e581b8",
              "desc": "Garbage accumulation in residential area",
              "strCode": "2003",
              "aid": "id2",
              "assignedTo": "John Doe",
              "status": "assigned",
              "plan": "free",
              "imageUrl": "",
              "media_type": "image",
              "coords": [77.10189435697313, 28.605817316957182],
              "rs": false,
              "type": "free",
              "address": "10, Main Street, New Delhi, Delhi, 110001, India",
              "city": "New Delhi",
              "state": "Delhi",
              "municipalCorporation": "Central Delhi",
              "date": "2025-07-28T10:30:00.000Z",
              "updates": [],
              "__v": 0
            }
          ];
          
          // Apply filters if provided
          let filteredComplaints = mockComplaints;
          if (filters.query) {
            filteredComplaints = filteredComplaints.filter(c => 
              c.desc.toLowerCase().includes(filters.query.toLowerCase()) ||
              c.city.toLowerCase().includes(filters.query.toLowerCase())
            );
          }
          if (filters.status) {
            filteredComplaints = filteredComplaints.filter(c => c.status === filters.status);
          }
          if (filters.plan) {
            filteredComplaints = filteredComplaints.filter(c => c.plan === filters.plan);
          }
          if (filters.isAssigned !== undefined) {
            filteredComplaints = filteredComplaints.filter(c => 
              filters.isAssigned ? c.assignedTo : !c.assignedTo
            );
          }
          if (filters.city) {
            filteredComplaints = filteredComplaints.filter(c => c.city === filters.city);
          }
          if (filters.municipalCorporation) {
            filteredComplaints = filteredComplaints.filter(c => c.municipalCorporation === filters.municipalCorporation);
          }
          
          resolve({ complaints: filteredComplaints, filters });
        }, 1000);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
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