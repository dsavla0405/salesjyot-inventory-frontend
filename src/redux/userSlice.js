import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    email: null, // Use null if no value is set initially
    name: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.name = action.payload.name;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
