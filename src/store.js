import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import taskReducer from "./features/taskSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
  },
});

export default store;
