# 📘 Smart Vocab – Sổ từ vựng thông minh

Web app giúp tra nghĩa bằng **Google Translate API**, lưu từ vào sổ từ cá nhân trên **Firebase** (Authentication + Cloud Firestore) và ôn tập bằng **Flashcard**.

## Chức năng
1. **Tra & dịch**: dịch từ hoặc câu giữa 8 ngôn ngữ, tự nhận diện ngôn ngữ nguồn.
2. **Đăng nhập Google** (Firebase Authentication).
3. **Sổ từ cá nhân** (Cloud Firestore): lưu, xóa, tìm kiếm, lọc, đánh dấu "đã thuộc". Dữ liệu đồng bộ realtime.
4. **Flashcard**: lật thẻ để xem nghĩa, đánh dấu "đã thuộc" hoặc "chưa thuộc".

## Cấu trúc
```
smart-vocab/
├── index.html            # Giao diện
├── css/style.css
├── js/
│   ├── app.js            # Logic giao diện
│   ├── translate.js      # Gọi Google Translate API
│   ├── firebase.js       # Firebase Auth + Firestore
│   ├── config.example.js # Mẫu cấu hình (commit)
│   └── config.js         # Cấu hình thật (KHÔNG commit)
├── firestore.rules       # Luật bảo mật Firestore
└── firebase.json         # Cấu hình Firebase Hosting
```

## Cài đặt & chạy

### 1. Tạo cấu hình
```bash
cp js/config.example.js js/config.js
```

### 2. Firebase
1. Vào https://console.firebase.google.com và tạo project.
2. **Build → Authentication → Sign-in method** và bật **Google**.
3. **Build → Firestore Database → Create database**, rồi dán nội dung `firestore.rules` vào tab **Rules**.
4. **Project settings → Your apps → Web (</>)**, rồi copy `firebaseConfig` vào `js/config.js`.

### 3. Google Translate API
1. Vào https://console.cloud.google.com, chọn project (có thể dùng chung project Firebase).
2. **APIs & Services → Library**, rồi bật **Cloud Translation API**.
3. **Credentials → Create credentials → API key**, rồi dán vào `TRANSLATE_API_KEY` trong `js/config.js`.
   Nên giới hạn key theo HTTP referrer (domain của web).

> Nếu để trống `TRANSLATE_API_KEY`, app sẽ dùng endpoint công khai `translate.googleapis.com/translate_a/single`. Endpoint này không cần key nhưng có thể bị Google chặn.

### 4. Chạy local
App dùng ES Modules nên phải chạy qua HTTP server, không mở trực tiếp file `index.html`:
```bash
npx serve .
# hoặc dùng extension "Live Server" của VS Code
```
Mở http://localhost:3000.

### 5. Deploy (tùy chọn)
```bash
npm install -g firebase-tools
firebase login
firebase use --add      # chọn project
firebase deploy
```
