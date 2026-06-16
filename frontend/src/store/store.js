import { configureStore } from "@reduxjs/toolkit";

import authUserReducer from "./features/authUser/authUserSlice";
import taskUserReducer from "./features/taskUser/taskUserSlice";
import historyUserReducer from "./features/historyUser/historyUserSlice";

export const store = configureStore({
  reducer: {
    authUser: authUserReducer,
    taskUser: taskUserReducer,
    historyUser: historyUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/updateUser/fulfilled'],
        ignoredPaths: ['authUser.user.profile_image', 'authUser.user.educational_certificate'],
      },
    }),
});
