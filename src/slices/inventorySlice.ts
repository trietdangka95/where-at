import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ID, InventoryState } from "../types/inventory";
import { SCHEMA_VERSION } from "../utils/constants";
import { createId, nowIso, toTitleCaseWords, trimName } from "../utils/common";

const seedLocationId = "loc-home";
const seedContainerId = "cont-kitchen";
const seedItemId = "item-coffee";

const initialState: InventoryState = {
  schemaVersion: SCHEMA_VERSION,
  locations: {
    [seedLocationId]: {
      id: seedLocationId,
      name: "Home",
      icon: "house",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  },
  containers: {
    [seedContainerId]: {
      id: seedContainerId,
      locationId: seedLocationId,
      name: "Kitchen Cabinet",
      parentId: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  },
  items: {
    [seedItemId]: {
      id: seedItemId,
      containerId: seedContainerId,
      name: "Coffee Beans",
      category: "Food",
      qty: 1,
      unit: "bag",
      notes: "Medium roast",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  },
  recentItemIds: [seedItemId],
  selectedItemId: seedItemId,
};

const emptyInventoryState = (): InventoryState => ({
  schemaVersion: SCHEMA_VERSION,
  locations: {},
  containers: {},
  items: {},
  recentItemIds: [],
  selectedItemId: undefined,
});

const collectContainerTree = (state: InventoryState, rootId: ID) => {
  const queue = [rootId];
  const collected = new Set<ID>();
  while (queue.length > 0) {
    const nextId = queue.shift();
    if (!nextId || collected.has(nextId)) continue;
    collected.add(nextId);
    Object.values(state.containers).forEach((container) => {
      if (container.parentId === nextId) queue.push(container.id);
    });
  }
  return collected;
};

const wouldCreateContainerCycle = (
  state: InventoryState,
  containerId: ID,
  nextParentId?: ID | null
) => {
  if (!nextParentId) return false;
  if (nextParentId === containerId) return true;
  let cursor: ID | null | undefined = nextParentId;
  while (cursor) {
    if (cursor === containerId) return true;
    cursor = state.containers[cursor]?.parentId;
  }
  return false;
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    resetInventory: () => emptyInventoryState(),
    addLocation: (state, action: PayloadAction<{ name: string; icon?: string }>) => {
      const name = toTitleCaseWords(trimName(action.payload.name));
      if (!name) return;
      const id = createId();
      state.locations[id] = {
        id,
        name,
        icon: action.payload.icon,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
    },
    addContainer: (
      state,
      action: PayloadAction<{ locationId: ID; name: string; parentId?: ID | null }>
    ) => {
      if (!state.locations[action.payload.locationId]) return;
      const id = createId();
      const name = toTitleCaseWords(trimName(action.payload.name));
      if (!name) return;
      if (action.payload.parentId && !state.containers[action.payload.parentId]) return;
      state.containers[id] = {
        id,
        locationId: action.payload.locationId,
        parentId: action.payload.parentId ?? null,
        name,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
    },
    updateLocation: (state, action: PayloadAction<{ locationId: ID; name: string; icon?: string }>) => {
      const location = state.locations[action.payload.locationId];
      if (!location) return;
      const name = toTitleCaseWords(trimName(action.payload.name));
      if (!name) return;
      location.name = name;
      location.icon = action.payload.icon;
      location.updatedAt = nowIso();
    },
    updateContainer: (
      state,
      action: PayloadAction<{ containerId: ID; name: string; parentId?: ID | null }>
    ) => {
      const container = state.containers[action.payload.containerId];
      if (!container) return;
      const name = toTitleCaseWords(trimName(action.payload.name));
      if (!name) return;
      if (
        action.payload.parentId &&
        (!state.containers[action.payload.parentId] ||
          wouldCreateContainerCycle(state, action.payload.containerId, action.payload.parentId))
      ) {
        return;
      }
      container.name = name;
      container.parentId = action.payload.parentId ?? null;
      container.updatedAt = nowIso();
    },
    addItem: (
      state,
      action: PayloadAction<{
        itemId?: ID;
        containerId: ID;
        name: string;
        category: string;
        qty: number;
        unit: string;
        expiryDate?: string;
        imageUri?: string;
      }>
    ) => {
      if (!state.containers[action.payload.containerId]) return;
      const safeQty = Math.max(action.payload.qty, 0);
      const id = action.payload.itemId ?? createId();
      state.items[id] = {
        id,
        containerId: action.payload.containerId,
        name: trimName(action.payload.name),
        category: action.payload.category,
        qty: safeQty,
        unit: action.payload.unit,
        expiryDate: action.payload.expiryDate,
        imageUri: action.payload.imageUri,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      state.recentItemIds = [id, ...state.recentItemIds.filter((itemId) => itemId !== id)].slice(0, 12);
    },
    updateItem: (
      state,
      action: PayloadAction<{
        itemId: ID;
        name: string;
        category: string;
        qty: number;
        unit: string;
        notes?: string;
        expiryDate?: string;
        imageUri?: string;
      }>
    ) => {
      const item = state.items[action.payload.itemId];
      if (!item) return;
      const name = trimName(action.payload.name);
      if (!name) return;
      item.name = name;
      item.category = action.payload.category;
      item.qty = Math.max(action.payload.qty, 0);
      item.unit = action.payload.unit;
      item.notes = action.payload.notes;
      item.expiryDate = action.payload.expiryDate;
      if (action.payload.imageUri !== undefined) {
        item.imageUri = action.payload.imageUri;
      }
      item.updatedAt = nowIso();
      state.recentItemIds = [item.id, ...state.recentItemIds.filter((itemId) => itemId !== item.id)].slice(0, 12);
    },
    deleteItem: (state, action: PayloadAction<{ itemId: ID }>) => {
      delete state.items[action.payload.itemId];
      state.recentItemIds = state.recentItemIds.filter((itemId) => itemId !== action.payload.itemId);
      if (state.selectedItemId === action.payload.itemId) {
        state.selectedItemId = state.recentItemIds[0];
      }
    },
    deleteContainer: (state, action: PayloadAction<{ containerId: ID }>) => {
      const ids = collectContainerTree(state, action.payload.containerId);
      ids.forEach((id) => {
        delete state.containers[id];
      });
      Object.values(state.items).forEach((item) => {
        if (ids.has(item.containerId)) {
          delete state.items[item.id];
          state.recentItemIds = state.recentItemIds.filter((id) => id !== item.id);
        }
      });
    },
    deleteLocation: (state, action: PayloadAction<{ locationId: ID }>) => {
      delete state.locations[action.payload.locationId];
      const locationContainers = Object.values(state.containers)
        .filter((container) => container.locationId === action.payload.locationId)
        .map((container) => container.id);
      locationContainers.forEach((containerId) => {
        const ids = collectContainerTree(state, containerId);
        ids.forEach((id) => delete state.containers[id]);
        Object.values(state.items).forEach((item) => {
          if (ids.has(item.containerId)) {
            delete state.items[item.id];
            state.recentItemIds = state.recentItemIds.filter((id) => id !== item.id);
          }
        });
      });
    },
    selectItem: (state, action: PayloadAction<{ itemId: ID }>) => {
      if (state.items[action.payload.itemId]) {
        state.selectedItemId = action.payload.itemId;
      }
    },
  },
});

export const {
  resetInventory,
  addLocation,
  updateLocation,
  deleteLocation,
  addContainer,
  updateContainer,
  deleteContainer,
  addItem,
  updateItem,
  deleteItem,
  selectItem,
} = inventorySlice.actions;

export const inventoryReducer = inventorySlice.reducer;

type RootLike = { inventory: InventoryState };
const selectInventory = (state: RootLike) => state.inventory;

export const selectRecentItems = createSelector([selectInventory], (inventory) =>
  inventory.recentItemIds.map((id) => inventory.items[id]).filter(Boolean)
);

export const selectAllLocations = createSelector([selectInventory], (inventory) =>
  Object.values(inventory.locations)
);

export const selectAllContainers = createSelector([selectInventory], (inventory) =>
  Object.values(inventory.containers)
);

export const selectAllItems = createSelector([selectInventory], (inventory) => Object.values(inventory.items));

export const selectSelectedItem = createSelector([selectInventory], (inventory) =>
  inventory.selectedItemId ? inventory.items[inventory.selectedItemId] : undefined
);

export const selectContainersByLocation = (locationId: ID) =>
  createSelector([selectInventory], (inventory) =>
    Object.values(inventory.containers).filter((container) => container.locationId === locationId)
  );

export const selectItemsByContainer = (containerId: ID) =>
  createSelector([selectInventory], (inventory) =>
    Object.values(inventory.items).filter((item) => item.containerId === containerId)
  );

export const selectBreadcrumbByItemId = (itemId: ID) =>
  createSelector([selectInventory], (inventory) => {
    const item = inventory.items[itemId];
    if (!item) return [];
    const path: string[] = [];
    let currentContainer = inventory.containers[item.containerId];
    while (currentContainer) {
      path.unshift(currentContainer.name);
      if (!currentContainer.parentId) break;
      currentContainer = inventory.containers[currentContainer.parentId];
    }
    const location = currentContainer ? inventory.locations[currentContainer.locationId] : undefined;
    if (location) path.unshift(location.name);
    return path;
  });
