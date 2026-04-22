import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { createMigrate, persistReducer, persistStore } from "redux-persist";

import { rootReducer } from "./rootReducer";
import { SCHEMA_VERSION } from "../utils/constants";

const migrations = {
  1: (state: any) => {
    if (!state?.inventory) return state;
    return {
      ...state,
      inventory: {
        ...state.inventory,
        schemaVersion: SCHEMA_VERSION,
      },
    };
  },
};

const persistConfig: any = {
  key: "whereat-root",
  storage: AsyncStorage,
  version: SCHEMA_VERSION,
  migrate: createMigrate(migrations, { debug: false }),
  whitelist: ["inventory"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type AppStoreState = ReturnType<typeof store.getState>;
