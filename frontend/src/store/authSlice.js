
import { createSlice } from "@reduxjs/toolkit";

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const getSavedToken = () => {
  try {
    return localStorage.getItem("token") || null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getSavedUser(),
  token: getSavedToken(),
  isAuthenticated: !!getSavedToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.isAuthenticated = !!token;

      try {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
      } catch (error) {
        console.error("Unable to save login data:", error);
      }
    },

    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };

      try {
        localStorage.setItem("user", JSON.stringify(state.user));
      } catch (error) {
        console.error("Unable to save updated user:", error);
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } catch (error) {
        console.error("Unable to clear login data:", error);
      }
    },
  },
});

export const { loginSuccess, updateUser, logout } = authSlice.actions;

export default authSlice.reducer;
