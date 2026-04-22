export type ID = string;

export interface Location {
  id: ID;
  name: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Container {
  id: ID;
  locationId: ID;
  parentId?: ID | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: ID;
  containerId: ID;
  name: string;
  category: string;
  qty: number;
  unit: string;
  barcode?: string;
  expiryDate?: string;
  imageUri?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryState {
  locations: Record<ID, Location>;
  containers: Record<ID, Container>;
  items: Record<ID, Item>;
  recentItemIds: ID[];
  selectedItemId?: ID;
  schemaVersion: number;
}
