import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call - replace with actual rembaseApp call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Mock data - replace with actual API response
          const mockUsers = [
            {
              "_id": "684beb4ae326c29a8cbb3314",
              "aud": "067a8f92195bc8db44685ae4",
              "email": "deepanshu.balyan0073@gmail.com",
              "__v": 0,
              "data": {
                "id": "0684beb4aa282b2bb95f1fbe",
                "email": "deepanshu.balyan0073@gmail.com"
              },
              "family_name": "Balyan",
              "firstLogin": "2025-06-13T09:11:38.381Z",
              "given_name": "Deepanshu",
              "id": "0684beb4aa282b2bb95f1fbe",
              "isVerified": true,
              "lastLogin": "2025-06-25T05:42:17.444Z",
              "name": "Deepanshu Balyan",
              "picture": "https://lh3.googleusercontent.com/a/ACg8ocLYSP68re4I4ertHjeumPda6TxTEMOw_YJavs0FpGNQG7BkzCqQwQ=s96-c",
              "providers": ["google"],
              "status": true,
              "verified_email": true,
              "customData": {
                "_id": "684beb4ae326c29a8cbb3314",
                "id": "0684beb4aa282b2bb95f1fbe",
                "email": "deepanshu.balyan0073@gmail.com",
                "userType": "Advocate",
                "userEmployer": "individual",
                "lastLogin": "2025-06-21T04:35:57.223Z",
                "providers": ["google"],
                "status": true,
                "data": {
                  "email": "deepanshu.balyan0073@gmail.com",
                  "id": "0684beb4aa282b2bb95f1fbe"
                },
                "__v": 0,
                "score": 100.1,
                "name": "deepanshu balyan",
                "nameChanged": true,
                "phone": "+919318455101",
                "country": "India",
                "photoUrl": "https://oneapp1.s3.ap-south-1.amazonaws.com/Posts/non_logged/1750788554281_0.jpg",
                "photoUrlChange": true
              },
              "s": "2025-06-25T09:44:21.825Z",
              "iat": 1750844661,
              "exp": 1753436661
            },
            {
              "_id": "684beb4ae326c29a8cbb3315",
              "aud": "067a8f92195bc8db44685ae5",
              "email": "john.doe@example.com",
              "__v": 0,
              "data": {
                "id": "0684beb4aa282b2bb95f1fbf",
                "email": "john.doe@example.com"
              },
              "family_name": "Doe",
              "firstLogin": "2025-06-14T10:00:00.000Z",
              "given_name": "John",
              "id": "0684beb4aa282b2bb95f1fbf",
              "isVerified": true,
              "lastLogin": "2025-06-26T06:00:00.000Z",
              "name": "John Doe",
              "picture": "",
              "providers": ["email"],
              "status": true,
              "verified_email": true,
              "customData": {
                "_id": "684beb4ae326c29a8cbb3315",
                "id": "0684beb4aa282b2bb95f1fbf",
                "email": "john.doe@example.com",
                "userType": "mcEmployee",
                "userEmployer": "Municipal Corporation",
                "lastLogin": "2025-06-22T05:00:00.000Z",
                "providers": ["email"],
                "status": true,
                "data": {
                  "email": "john.doe@example.com",
                  "id": "0684beb4aa282b2bb95f1fbf"
                },
                "__v": 0,
                "score": 85.5,
                "name": "john doe",
                "nameChanged": false,
                "phone": "+919876543210",
                "country": "India",
                "photoUrl": "",
                "photoUrlChange": false
              },
              "s": "2025-06-25T10:00:00.000Z",
              "iat": 1750844800,
              "exp": 1753436800
            }
          ];
          
          resolve({ users: mockUsers });
        }, 1000);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = usersSlice.actions;

export default usersSlice.reducer; 