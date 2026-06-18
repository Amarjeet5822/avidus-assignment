import { configureStore } from "@reduxjs/toolkit";

import authUserReducer from "./features/authUser/authUserSlice";
import taskUserReducer from "./features/taskUser/taskUserSlice";
import historyUserReducer from "./features/historyUser/historyUserSlice";
import driveUserReducer from "./features/driveUser/driveUserSlice";

export const store = configureStore({
  reducer: {
    authUser: authUserReducer,
    taskUser: taskUserReducer,
    historyUser: historyUserReducer,
    driveUser: driveUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/updateUser/fulfilled'],
        ignoredPaths: ['authUser.user.profile_image', 'authUser.user.educational_certificate'],
      },
    }),
});
