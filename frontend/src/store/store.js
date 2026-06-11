import { configureStore } from "@reduxjs/toolkit";

import authUserReducer from "./features/authUser/authUserSlice";
import taskUserReducer from "./features/taskUser/taskUserSlice";
import historyUserReducer from "./features/historyUser/historyUserSlice";

export const store = configureStore({
  reducer: {
    authUser: authUserReducer,
    taskUser: taskUserReducer,
    historyUser: historyUserReducer,
  }
});
