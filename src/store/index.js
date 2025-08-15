import { configureStore } from '@reduxjs/toolkit';
import complaintsReducer from './complaintsSlice';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    complaints: complaintsReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store; 