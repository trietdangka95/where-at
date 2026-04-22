📦 Project Specification: WhereAt? (Local Inventory Manager)

1. Project Overview
   App Name: WhereAt?

Concept: Local-only personal inventory manager. No Backend, No Cloud.

Goal: Help users track where they put their stuff (Location > Container > Item).

Tech Stack: - Framework: Expo (React Native).

State Management: Redux Toolkit (RTK).

Persistence: Redux Persist + AsyncStorage.

File System: expo-file-system (to store actual image files).

Icons: lucide-react-native.

Styling: NativeWind (Tailwind CSS).

Animation: React Native Reanimated + Moti (tap/enter/exit micro-interactions, smooth motion).

2. Data Structure (Redux Schema)
   Item Entity

TypeScript
{
id: string; // UUID
containerId: string;
name: string;
category: string;
qty: number;
unit: string; // pcs, kg, box...
barcode?: string;
expiryDate?: string; // ISO string
imageUri: string; // Local file path: file:///...
notes: string;
}
Container & Location

Location: { id, name, icon } (e.g., Home, Office, Garage).

Container: { id, locationId, parentId?, name } (e.g., Fridge, Cabinet, Box #1).

3. Core Business Logic & Implementation
   A. Offline Persistence (Redux Persist)

Engine: @react-native-async-storage/async-storage.

Logic: Toàn bộ state của inventorySlice phải được persisted để dữ liệu không mất khi đóng app.

B. Image Management (Crucial)

Vì không có Cloud, logic quản lý file vật lý phải cực kỳ chặt chẽ:

Save Flow: - expo-image-picker chụp ảnh -> Lưu vào cache tạm.

Sử dụng expo-file-system để copy ảnh từ cache vào thư mục vĩnh viễn của App: ${FileSystem.documentDirectory}whereat/images/${itemId}.jpg.

Lưu đường dẫn vĩnh viễn này vào Redux imageUri.

Delete Flow: - Khi xóa một Item, Agent phải dispatch action đồng thời gọi FileSystem.deleteAsync(imageUri) để giải phóng bộ nhớ điện thoại.

C. Tree-path Logic (Breadcrumbs)

Viết một Selector sử dụng createSelector để truy ngược vị trí: Item -> Container -> Location.

Kết quả mong đợi: Một chuỗi hoặc mảng như ["Home", "Kitchen", "Cabinet A"].

D. Smart Barcode Input

Sử dụng expo-camera (CameraView + barcodeScannerSettings).

Khi scan thành công, gọi API https://world.openfoodfacts.org/api/v2/product/{barcode}.json để lấy thông tin sơ bộ (Product Name, Image) và điền sẵn (pre-fill) vào form thêm mới.

4. Folder Structure
   Plaintext
   /app # Expo Router (Tabs: index, inventory, add, scan, settings)
   /src
   /store # store.ts, rootReducer.ts
   /slices # inventorySlice.ts (CRUD logic)
   /services # imageService.ts (Copy/Delete files)
   /components # UI Kit (Button, Card, List, SearchBar)
   /hooks # useInventory (wrapper for dispatch/selector)
   /utils # Constants, date-formatter
5. Instructions for Agent (Copy & Paste this)
   "Hãy thực hiện code ứng dụng 'WhereAt?' dựa trên đặc tả sau:

Setup Redux: Cài đặt RTK và Redux Persist với AsyncStorage. Tạo inventorySlice quản lý locations, containers, và items.

File System Logic: Viết một service xử lý ảnh. Khi thêm item, copy ảnh từ cache vào ${FileSystem.documentDirectory}. Khi xóa item, phải xóa file ảnh tương ứng.

UI/UX: > - Sử dụng NativeWind để styling.

Màn hình chính hiển thị danh sách item gần đây (FlashList).

Hệ thống quản lý theo phân cấp: Chọn Location -> Hiện Containers -> Hiện Items.

Navigation: Sử dụng Expo Router (Tab bar).

Feature: Tích hợp Scan Barcode và gọi API OpenFoodFacts để lấy thông tin sản phẩm.

Hãy bắt đầu bằng việc khởi tạo Store và Slice trước, sau đó là Service quản lý File ảnh."

6. MVP Scope (v1) vs Future Scope
   MVP (Must-have for v1):

- Tạo / sửa / xóa Location.
- Tạo / sửa / xóa Container (hỗ trợ parentId để tạo cây đơn giản).
- Tạo / sửa / xóa Item có ảnh local.
- Xem danh sách theo cấu trúc Location > Container > Item.
- Tìm kiếm Item theo name/barcode.
- Scan barcode và pre-fill form khi API trả về dữ liệu.
- Persist toàn bộ dữ liệu bằng Redux Persist + AsyncStorage.

Future (v1.1+):

- Export/Import dữ liệu (JSON).
- App lock (PIN/biometric).
- Nhiều ảnh cho 1 item.
- Advanced filters (expiry range, category chips).

7. TypeScript Data Contracts (Complete)
   TypeScript
   type ID = string;

export interface Location {
  id: ID;
  name: string;
  icon?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Container {
  id: ID;
  locationId: ID;
  parentId?: ID | null;
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Item {
  id: ID;
  containerId: ID;
  name: string;
  category: string;
  qty: number;
  unit: string; // pcs, kg, box...
  barcode?: string;
  expiryDate?: string; // ISO
  imageUri?: string; // file:///...
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface InventoryState {
  locations: Record<ID, Location>;
  containers: Record<ID, Container>;
  items: Record<ID, Item>;
  recentItemIds: ID[]; // dùng cho màn hình Home
  schemaVersion: number;
}

8. Business Rules (Critical)
   Validation Rules

- name bắt buộc, trim(), tối đa 100 ký tự.
- qty >= 0.
- Không cho tạo container với parentId trỏ tới chính nó.
- Không cho tạo vòng lặp cây container (A -> B -> A).

Cascade Delete Rules

- Xóa Location -> xóa toàn bộ Containers thuộc location đó -> xóa toàn bộ Items thuộc các container đó -> xóa image files liên quan.
- Xóa Container -> xóa mọi container con (DFS/BFS) -> xóa toàn bộ Items liên quan -> xóa image files liên quan.
- Xóa Item -> xóa bản ghi item + gọi delete image file nếu tồn tại.

Image Lifecycle Rules

- Khi create/update ảnh item:
  - copy ảnh vào: ${FileSystem.documentDirectory}whereat/images/${itemId}.jpg
  - nếu item đã có ảnh cũ thì xóa ảnh cũ trước khi ghi path mới.
- Nếu deleteAsync lỗi vì file không tồn tại thì bỏ qua (idempotent).

9. Error Handling Matrix
   Camera Permission denied:
- Hiện CTA mở Settings + cho nhập tay barcode.

Barcode API timeout/fail:
- Không block flow tạo item, chỉ bỏ pre-fill và cho user nhập tay.

Image copy thất bại:
- Vẫn cho tạo item không ảnh, hiển thị toast cảnh báo.

Persist rehydrate lỗi:
- Reset về initial state an toàn + ghi log lỗi.

Storage đầy:
- Hiện thông báo giải phóng bộ nhớ và cho retry.

10. Persistence Versioning & Migration
    redux-persist config cần có version + migrate:

- version: 1 khi release đầu.
- Mỗi lần đổi schema tăng version và viết migrate function.
- Ví dụ: thêm field notes mặc định "" cho dữ liệu cũ.

11. Navigation & Screen Definition (Expo Router)
    /app/(tabs)/index.tsx
- Home: recent items + quick actions (Add Item, Scan).

/app/(tabs)/inventory.tsx
- Inventory root: chọn Location.
- Location Detail: list containers.
- Container Detail: list items.

/app/(tabs)/scan.tsx
- Barcode scanner + kết quả lookup + nút "Create Item".

/app/(tabs)/settings.tsx
- App info, data reset, future export/import.

12. Acceptance Criteria (Definition of Done)
    CRUD & Persist

- Tạo Location/Container/Item thành công và hiển thị đúng.
- Đóng app mở lại vẫn còn dữ liệu.
- Sửa/xóa phản ánh đúng ở mọi màn.

Image

- Thêm item với ảnh: file được copy vào documentDirectory.
- Xóa item/container/location: ảnh liên quan bị xóa vật lý.

Hierarchy

- Breadcrumb selector trả đúng path cho item.
- Không bị loop khi container có parentId.

Barcode

- Scan thành công -> gọi API -> pre-fill name (và image nếu có).
- API fail vẫn tạo item thủ công bình thường.

13. Test Plan (Minimum)
    Unit tests

- inventorySlice reducers: add/update/delete location/container/item.
- cascade delete logic.
- breadcrumb selector.
- imageService: saveImageForItem, deleteImageForItem.

Manual QA checklist

- Fresh install -> tạo dữ liệu mẫu -> restart app -> verify rehydrate.
- Tạo item có ảnh -> xóa item -> verify file removed.
- Scan barcode khi online/offline.
- Deep tree containers (3-4 levels) và kiểm tra path hiển thị.

14. Motion & Animation Guidelines (UI Mood)
    Animation Stack

- Core: `react-native-reanimated`.
- Convenience components: `moti`.
- List animation: Reanimated layout transitions cho add/remove/reorder item card.

Interaction Patterns (Bay ra / Bay vao)

- Tap feedback (nhấn vào card/button):
  - scale down nhanh 0.96 -> về 1.0 trong 120-180ms.
  - optional opacity 1 -> 0.9 -> 1 để tạo cảm giác "nảy".
- Enter animation (bay vao):
  - item mới xuất hiện từ `translateY: 8-16` + `opacity: 0 -> 1` trong 180-260ms.
- Exit animation (bay ra):
  - item bị xóa `translateX: 12` hoặc `translateY: -8` + `opacity: 1 -> 0` trong 140-220ms.
- Modal/Bottom-sheet:
  - slide up + fade in, khi đóng thì đảo ngược.

Motion Tokens (để đồng bộ toàn app)

- duration:
  - fast: 120ms
  - normal: 200ms
  - slow: 280ms
- easing:
  - enter: ease-out
  - exit: ease-in
  - emphasis: spring nhẹ (damping vừa phải, không rung quá đà)

Performance Rules

- Ưu tiên transform/opacity, tránh animate width/height nếu không cần.
- Với list dài, chỉ animate item mới thay đổi; không animate toàn bộ list mỗi render.
- Tôn trọng Reduced Motion (nếu người dùng bật accessibility giảm chuyển động).
- Giữ animation subtle, không làm chậm thao tác CRUD.

Definition of Done for Motion

- Mọi CTA chính (Add, Save, Delete, Open detail) có micro-interaction.
- Add/Delete item có enter/exit animation nhất quán.
- Không drop frame rõ rệt trên thiết bị tầm trung.

15. Implementation Notes (Update Continuously)

- Rule: Sau moi task code hoan thanh, cap nhat ngay trang thai vao `implementation-steps.md`.
- Rule: Neu task lon thay doi scope, cap nhat ca `markdown.md` va `implementation-steps.md` cung luc.
- Current progress (2026-04-18):
  - Da xong scaffold Expo + tab navigation + persist base.
  - Da xong `inventorySlice` ban dau va selectors breadcrumb.
  - Da xong `imageService` save/delete local image.
  - Da xong UI skeleton va motion co ban (tap scale + item enter).
  - Da xong CRUD UI first-pass trong tab Inventory (tao/xoa theo hierarchy Location > Container > Item).
  - Da them cac reducers update (`updateLocation`, `updateContainer`, `updateItem`) va validation chong loop parent container.
  - Da xong MVP UI polish cho Inventory: SearchBar, EmptyState, AppButton va edit inline.
  - Da them persist migration v1 + constants units mac dinh.
  - Da bo sung UX feedback (alerts) cho create/validation de thao tac ro rang hon.
  - Da refactor bo cuc 4 tabs theo style mock reference (Home, Inventory, Add Item, Item Detail).
  - Da noi luong du lieu dong cho detail: bam item tu Home/Inventory se chuyen sang man detail va hien thi du lieu item duoc chon.
  - Da hoan thanh thao tac Edit/Delete ngay tren man detail va cap nhat state realtime.
  - Da them image lifecycle o detail: chon anh, luu local qua file service, va render lai anh tren Home grid.
  - Da tach Item Detail ra route rieng (`/item-detail`) va cap nhat Home/Inventory dieu huong vao route nay.
  - Da dua tab `settings` ve dung muc dich App Info + Data Reset local, phu hop dinh nghia man hinh trong spec.
  - Da bo sung action reset store (`resetInventory`) de clear data local nhanh cho MVP.
  - Da migrate barcode scanner sang `expo-camera` de tranh loi native module.
  - Da fix breadcrumb o man Item Detail de khong bi duplicate path.
  - Da bo sung chuan hoa Title Case cho Location/Container khi create/update.
  - Da bo sung easing tokens (`enter/exit/emphasis`) trong motion system.
  - Da them `BottomSheetPanel` cho flow edit item (slide + fade animation).
  - Da fix crash runtime `Exception in HostFunction` bang cach bo phu thuoc `moti` o wrappers motion moi va dung `Animated` thuần.
  - Da them `scheme` (`whereat`) trong Expo config de tranh warning Linking cho production build.
  - Da refactor bottom tab co nut `+` o giua (tab `add`) va giu `scan` la tab rieng, dong thoi can chinh lai spacing/height de khong bi meo layout.
