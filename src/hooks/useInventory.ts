import { useDispatch, useSelector } from "react-redux";

import {
  resetInventory,
  addContainer,
  addItem,
  addLocation,
  deleteContainer,
  deleteItem,
  deleteLocation,
  selectAllContainers,
  selectAllItems,
  selectAllLocations,
  selectSelectedItem,
  selectItem,
  selectBreadcrumbByItemId,
  selectContainersByLocation,
  selectItemsByContainer,
  selectRecentItems,
  updateContainer,
  updateItem,
  updateLocation,
} from "../slices/inventorySlice";
import type { AppDispatch } from "../store/store";
import type { ID } from "../types/inventory";

export const useInventory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const locations = useSelector(selectAllLocations);
  const containers = useSelector(selectAllContainers);
  const items = useSelector(selectAllItems);
  const recentItems = useSelector(selectRecentItems);
  const selectedItem = useSelector(selectSelectedItem);

  const deleteImagesSafely = async (imageUris: Array<string | undefined>) => {
    const uris = [...new Set(imageUris.filter(Boolean))] as string[];
    if (uris.length === 0) return;

    try {
      const { deleteImageForItem } = await import("../services/imageService");
      await Promise.all(
        uris.map(async (uri) => {
          try {
            await deleteImageForItem(uri);
          } catch {
            // Ignore individual file delete errors so CRUD flow is not blocked.
          }
        })
      );
    } catch {
      // Ignore module/runtime errors and continue with state delete.
    }
  };

  const collectContainerSubtreeIds = (containerId: string) => {
    const collected = new Set<string>();
    const queue = [containerId];

    while (queue.length > 0) {
      const nextId = queue.shift();
      if (!nextId || collected.has(nextId)) continue;
      collected.add(nextId);

      containers.forEach((container) => {
        if (container.parentId === nextId) queue.push(container.id);
      });
    }

    return collected;
  };

  return {
    locations,
    containers,
    items,
    recentItems,
    selectedItem,
    selectContainersByLocation,
    selectItemsByContainer,
    selectBreadcrumbByItemId,
    createQuickLocation: (name: string) => dispatch(addLocation({ name })),
    createQuickContainer: (locationId: string, name: string) =>
      dispatch(addContainer({ locationId, name })),
    createQuickItem: (containerId: string, name: string) =>
      dispatch(addItem({ containerId, name, category: "General", qty: 1, unit: "pcs" })),
    createLocation: (name: string) => dispatch(addLocation({ name })),
    createContainer: (locationId: string, name: string, parentId?: string | null) =>
      dispatch(addContainer({ locationId, name, parentId })),
    createItem: (
      containerId: string,
      name: string,
      category: string,
      qty: number,
      unit: string,
      expiryDate?: string,
      imageUri?: string,
      itemId?: ID
    ) => dispatch(addItem({ containerId, name, category, qty, unit, expiryDate, imageUri, itemId })),
    editLocation: (locationId: string, name: string) => dispatch(updateLocation({ locationId, name })),
    editContainer: (containerId: string, name: string, parentId?: string | null) =>
      dispatch(updateContainer({ containerId, name, parentId })),
    editItem: (
      itemId: string,
      name: string,
      category: string,
      qty: number,
      unit: string,
      notes?: string,
      expiryDate?: string,
      imageUri?: string
    ) => dispatch(updateItem({ itemId, name, category, qty, unit, notes, expiryDate, imageUri })),
    chooseItem: (itemId: string) => dispatch(selectItem({ itemId })),
    removeLocation: async (locationId: string) => {
      const containerIds = new Set(
        containers.filter((container) => container.locationId === locationId).map((container) => container.id)
      );
      const allContainerIds = new Set<string>();
      containerIds.forEach((containerId) => {
        collectContainerSubtreeIds(containerId).forEach((id) => allContainerIds.add(id));
      });

      const imageUris = items
        .filter((item) => allContainerIds.has(item.containerId))
        .map((item) => item.imageUri);

      await deleteImagesSafely(imageUris);
      dispatch(deleteLocation({ locationId }));
    },
    removeContainer: async (containerId: string) => {
      const subtreeIds = collectContainerSubtreeIds(containerId);
      const imageUris = items
        .filter((item) => subtreeIds.has(item.containerId))
        .map((item) => item.imageUri);

      await deleteImagesSafely(imageUris);
      dispatch(deleteContainer({ containerId }));
    },
    removeItem: async (itemId: string) => {
      const target = items.find((item) => item.id === itemId);
      await deleteImagesSafely([target?.imageUri]);
      dispatch(deleteItem({ itemId }));
    },
    resetInventoryData: () => dispatch(resetInventory()),
  };
};
