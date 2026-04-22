import { combineReducers } from "@reduxjs/toolkit";

import { inventoryReducer } from "../slices/inventorySlice";

export const rootReducer = combineReducers({
  inventory: inventoryReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
