# WhereAt? Implementation Steps (Based on `markdown.md`)

Muc tieu cua tai lieu nay la chuyen spec trong `markdown.md` thanh checklist thuc thi theo thu tu, de khong mat context ban dau khi code.

## 0) Khoi tao du an va phu thuoc

- [x] Tao project Expo (TypeScript) va chay duoc tren iOS/Android.
- [x] Cai dat dependencies:
  - `@reduxjs/toolkit`, `react-redux`
  - `redux-persist`, `@react-native-async-storage/async-storage`
  - `expo-file-system`, `expo-image-picker`
  - `expo-camera`
  - `expo-router`
  - `nativewind`, `tailwindcss`
  - `lucide-react-native`
  - `react-native-reanimated`, `moti`
- [x] Cau hinh NativeWind va Expo Router hoat dong co ban.

## 1) Dinh nghia kieu du lieu va constants

- [x] Tao `src/types/inventory.ts` cho `Location`, `Container`, `Item`, `InventoryState`.
- [x] Tao constants cho:
  - [x] `SCHEMA_VERSION`
  - [x] duong dan thu muc anh (`whereat/images`)
  - [x] danh sach `unit` mac dinh
- [x] Tao helper cho `id`, `nowISO`, `safeTrim`.

## 2) Store + Persist + Migration

- [x] Tao `src/store/rootReducer.ts`.
- [x] Tao `src/store/store.ts` voi RTK.
- [x] Cau hinh `redux-persist` voi AsyncStorage.
- [x] Them `version` + `migrate` (version 1).
- [x] Wrap app voi `Provider` + `PersistGate`.

## 3) Inventory Slice (CRUD + Rules)

- [x] Tao `src/slices/inventorySlice.ts`.
- [ ] Implement actions:
  - [x] `addLocation`, `updateLocation`, `deleteLocation`
  - [x] `addContainer`, `updateContainer`, `deleteContainer`
  - [x] `addItem`, `updateItem`, `deleteItem`
- [ ] Them validation:
  - [x] name bat buoc, max length
  - [x] `qty >= 0`
  - [x] khong tao loop `parentId`
- [ ] Implement cascade delete:
  - [x] delete Location -> containers con -> items
  - [x] delete Container -> subtree -> items

## 4) Image Service (Local File Lifecycle)

- [x] Tao `src/services/imageService.ts`.
- [x] Implement:
  - [x] `saveImageForItem(itemId, tempUri)`
  - [x] `deleteImageForItem(imageUri)`
  - [x] `saveRemoteImageForItem(itemId, remoteUri)` (OpenFoodFacts image -> local file)
- [ ] Rule:
  - [x] copy tu cache sang `documentDirectory`
  - [x] update anh moi thi xoa anh cu
  - [x] delete file idempotent (file khong ton tai thi bo qua)
  - [x] cascade xoa location/container/item se goi xoa image file local

## 5) Selectors + Hooks

- [ ] Tao selectors bang `createSelector`:
  - [x] lay containers theo location
  - [x] lay items theo container
  - [x] breadcrumb path `Location > ...Container`
  - [x] recent items cho Home
- [x] Tao `src/hooks/useInventory.ts` de gom dispatch + selectors.

## 6) Navigation Skeleton (Expo Router)

- [x] Tao tabs:
  - [x] `/app/(tabs)/index.tsx` (Home)
  - [x] `/app/(tabs)/inventory.tsx` (Inventory)
  - [x] `/app/(tabs)/add.tsx` (center CTA tab)
  - [x] `/app/(tabs)/scan.tsx` (Scan)
  - [x] `/app/(tabs)/settings.tsx` (Settings)
- [ ] Tao cac man detail can thiet cho Inventory flow:
  - [x] Location list/detail (same screen version)
  - [x] Container detail (same screen version)
  - [x] Item create/edit form (same screen version)

## 7) UI Components

- [ ] Tao UI kit trong `src/components`:
  - [x] `Button`, `Card`, `ListItem`, `SearchBar`, `EmptyState`
- [x] Dung NativeWind cho style co tinh nhat quan.
- [x] Hien thi icon bang `lucide-react-native`.

## 7.1) Motion System (Animation Mood)

- [x] Tao `src/theme/motion.ts` cho motion tokens:
  - [x] durations: fast/normal/slow
  - [x] easing presets: enter/exit/emphasis
- [ ] Tao reusable wrappers:
  - [x] `PressableScale` (tap scale 0.96 -> 1.0)
  - [x] `FadeSlideIn` (enter)
  - [x] `FadeSlideOut` (exit)
- [ ] Apply animation vao:
  - [x] Item cards trong list (enter/exit)
  - [x] Buttons/CTA chinh (tap feedback)
  - [x] Modal/bottom sheet open/close
- [ ] Bat reduced motion fallback (giam/tat animation neu can).
  - [x] Bat reduced motion fallback (giam/tat animation neu can).

## 8) Barcode Flow + OpenFoodFacts

- [x] Xin camera permission va xu ly denied state.
- [x] Scan barcode trong tab `scan`.
- [ ] Goi API OpenFoodFacts:
  - [x] timeout + error handling
  - [x] parse product name, image
- [x] Pre-fill vao form tao Item.
- [x] Fallback cho user nhap tay khi API fail/offline.

## 9) Error Handling va UX an toan

- [ ] Them toast/alert cho cac loi chinh:
  - [ ] copy/delete image fail
  - [ ] API fail
  - [x] persist/rehydrate fail
  - [ ] storage day
- [x] Dam bao flow tao item khong bi block boi cac loi khong critical.

## 10) Acceptance Checklist (MVP Gate)

- [ ] CRUD Location/Container/Item hoat dong dung.
- [ ] Persist qua restart app dung.
- [ ] Cascade delete dung va khong de lai du lieu mo coi.
- [ ] Anh duoc copy va xoa vat ly dung theo lifecycle.
- [ ] Breadcrumb path dung voi tree 3-4 tang.
- [ ] Barcode scan pre-fill duoc khi online, fallback dung khi offline.
- [ ] Micro-interactions hoat dong (tap, open, close, add, delete).
- [ ] Animation khong gay giat/lag tren device tam trung.

## 11) Test Plan

- [ ] Unit tests:
  - [ ] reducers CRUD
  - [ ] cascade delete
  - [ ] breadcrumb selector
  - [ ] imageService
- [ ] Manual QA:
  - [ ] tao data mau -> restart app
  - [ ] tao item co anh -> xoa item/container/location
  - [ ] scan online/offline
  - [ ] test deep container tree
  - [ ] test add/delete item voi enter/exit animation
  - [ ] test reduced motion mode

## 12) Optional Hardening (Sau MVP)

- [ ] Export/Import JSON.
- [ ] App lock (PIN/Biometric).
- [ ] Multi-image per item.
- [ ] Filter nang cao (expiry, category).

## Working Rule de giu context

- Luon cap nhat tiep tai lieu nay truoc khi code feature lon.
- Moi buoc xong thi tick checklist ngay.
- Neu thay doi spec trong `markdown.md`, cap nhat file nay cung luc.
- Sau moi lan implement, bat buoc ghi chu nhung gi da xong vao file markdown nay.

## Progress Log

- 2026-04-18:
  - Hoan thanh scaffold Expo + Expo Router tabs + Redux Persist base.
  - Hoan thanh `inventorySlice` ban dau (add/delete + selectors + breadcrumb).
  - Hoan thanh `imageService` (save/delete, idempotent delete).
  - Hoan thanh theme mau co ban + animation tap/enter skeleton.
  - Typecheck (`npx tsc --noEmit`) da pass.
  - Hoan thanh CRUD UI first-pass tren `inventory` (tao/xoa Location, Container, Item + hierarchy chon theo cap).
  - Hoan thanh `updateLocation`, `updateContainer`, `updateItem` trong slice.
  - Them check chong loop `parentId` khi update container.
  - Hoan thanh MVP UI polish cho Inventory: search bar, empty states, button system va edit inline cho Location/Container/Item.
  - Fix run error Metro: them `babel-preset-expo` vao devDependencies (loi `Cannot find module 'babel-preset-expo'`).
  - Fix web run prerequisites: cai them `react-dom` va `react-native-web` bang `expo install`.
  - Fix Babel web bundling error `.plugins is not a valid Plugin property` bang cach bo `nativewind/babel` khoi `babel.config.js` (vi UI hien tai chua dung className NativeWind).
  - Hoan thanh constants con thieu: them danh sach unit mac dinh.
  - Hoan thanh persist migration v1 (`createMigrate`) va schema version wiring.
  - Hoan thanh UI kit du cho MVP (`AppButton`, `Card`, `ListItem`, `SearchBar`, `EmptyState`).
  - Them UX feedback bang alert cho create flows va validation de tranh thao tac "im lang".
  - Refactor UI theo mock moi: Home grid cards, Inventory location cards, Add Item form layout, Item detail screen layout.
  - Noi data dong cho Item Detail: chon item tu Home/Inventory -> mo Settings va hien thi thong tin thuc.
  - Hoan thanh Edit/Delete thuc te trong man Item Detail (save update vao store, delete item va dieu huong lai).
  - Hoan thanh image flow trong Item Detail: chon anh tu thu vien, luu local file, hien thi tren detail va Home cards.
- 2026-04-20:
  - Hoan thanh Barcode flow trong `scan` tab: xin camera permission, scan barcode, pre-fill du lieu.
  - Hoan thanh OpenFoodFacts service voi timeout + fallback de khong block luong tao item thu cong.
  - Hoan thanh create item tu man Scan voi chon container, qty/unit va thong bao huong dan khi chua co container.
  - Hoan thanh luu anh OpenFoodFacts ve local file khi tao item tu man Scan.
  - Hoan thanh cascade xoa image file local trong `useInventory` khi xoa item/container/location.
- 2026-04-22:
  - Tach man Item Detail thanh route rieng `app/item-detail.tsx` va cap nhat dieu huong tu Home/Inventory.
  - Tra `app/(tabs)/settings.tsx` ve dung scope Settings (App Info + Data Reset local).
  - Them action `resetInventory` trong slice va hook `resetInventoryData` de xoa toan bo du lieu local nhanh.
  - Migate barcode scanner sang `expo-camera` de fix loi native module `ExpoBarCodeScanner`.
  - Fix breadcrumb man Item Detail de khong bi lap `Home > home >`.
  - Chuan hoa ten Location/Container theo Title Case khi create/update.
  - Bo sung `motion.easing` tokens va ap dung easing vao `PressableScale`.
  - Them reusable motion wrappers `FadeSlideIn`/`FadeSlideOut` va apply vao Home recent item cards.
  - Them reusable `BottomSheetPanel` (fade backdrop + slide sheet) va apply vao flow Edit Item trong Inventory.
  - Fix runtime crash `Exception in HostFunction` bang cach bo `AnimatePresence`/`moti` khoi wrappers moi va chuyen sang `Animated` thuần.
  - Them `scheme` vao `app.json` (`whereat`) de tranh canh bao Linking cho production build.
  - Refactor bottom tabs: them tab `add` o giua (CTA `+`) va giu `scan` la tab rieng, tranh bi de/chen len nhau.
  - Tinh chinh tab bar spacing/chieu cao va vi tri nut `+` de bo cuc deu, khong meo va can doi hon.
  - Them hook `useReducedMotion` va ap dung fallback cho `PressableScale`, `FadeSlideIn`, `FadeSlideOut`, `BottomSheetPanel`.
