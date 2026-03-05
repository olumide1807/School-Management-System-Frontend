import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";
import feeBreakdownReducer from "./slice/feeBreakdown";
import academicSlideReducer from "./slice/academicSlides";
import schoolDetailsReducer from "./slice/schoolDetail";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import sessionReducer from "./slice/sessionSlice";
import classLevelReducer from './slice/classLevel';
import announcementReducer from './slice/announcementSlice';
import authReducer from './slice/authSlice';



const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  feeBreakDown: feeBreakdownReducer,
  academicSlides: academicSlideReducer,
  schoolDetails: schoolDetailsReducer,
  session: sessionReducer,
  classLevel: classLevelReducer,
  announcements: announcementReducer,
});


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});


export let persistor = persistStore(store);


