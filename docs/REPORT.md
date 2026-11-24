# Lab07 – Google Translate API & Firebase API

**Họ tên:** _[điền]_ · **MSSV:** _[điền]_ · **Lớp:** _[điền]_

**Sản phẩm:** Smart Vocab – Sổ từ vựng thông minh

---

## 1. Explanation – Giới thiệu website

### 1.1 Ý tưởng
Khi học ngoại ngữ, người học thường tra từ bằng Google Translate rồi quên ngay vì không có chỗ lưu lại để ôn. **Smart Vocab** gộp ba bước *tra từ → lưu từ → ôn tập* vào một website duy nhất:

- Tra nghĩa bằng **Google Translate API**.
- Lưu vào sổ từ cá nhân trên đám mây bằng **Firebase (Authentication + Cloud Firestore)**, dùng được trên mọi thiết bị.
- Ôn tập bằng **Flashcard** cho đến khi thuộc.

### 1.2 Chức năng

| # | Chức năng | Mô tả | API sử dụng |
|---|-----------|-------|-------------|
| 1 | Tra & dịch | Dịch từ/câu giữa 8 ngôn ngữ, tự nhận diện ngôn ngữ nguồn, đổi chiều dịch | Google Translate |
| 2 | Đăng nhập | Đăng nhập bằng tài khoản Google | Firebase Authentication |
| 3 | Lưu từ | Lưu từ kèm nghĩa và ghi chú, chặn lưu trùng | Cloud Firestore |
| 4 | Quản lý sổ từ | Xem, tìm kiếm, lọc (đang học / đã thuộc), đánh dấu, xóa. Đồng bộ realtime | Cloud Firestore |
| 5 | Flashcard | Lật thẻ xem nghĩa, đánh dấu "đã thuộc" / "chưa thuộc", đếm số lần ôn | Cloud Firestore |

### 1.3 Kiến trúc

```
Trình duyệt (HTML/CSS/JS thuần, ES Modules)
 ├── js/translate.js ──HTTP──► Google Cloud Translation API v2
 └── js/firebase.js  ──SDK───► Firebase Authentication (Google Sign-In)
                              └► Cloud Firestore: users/{uid}/words/{wordId}
```

Website là **ứng dụng tĩnh, không cần backend riêng**: mọi logic chạy ở trình duyệt, dữ liệu lưu trên Firestore và được bảo vệ bằng Security Rules.

### 1.4 Tích hợp Google Translate API (`js/translate.js`)
Gửi request `POST` tới endpoint của Cloud Translation API v2:

```js
const res = await fetch(
  `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target, source, format: "text" }),
  }
);
const t = (await res.json()).data.translations[0];
// t.translatedText, t.detectedSourceLanguage
```

- Nếu không truyền `source`, API tự nhận diện ngôn ngữ và trả về `detectedSourceLanguage`. Giá trị này được hiển thị cho người dùng và lưu cùng từ.
- API key nằm trong `js/config.js`. File này được `.gitignore` nên không bị đưa lên Git.

### 1.5 Tích hợp Firebase (`js/firebase.js`)

**Authentication:** đăng nhập Google bằng popup, theo dõi trạng thái bằng `onAuthStateChanged`.
```js
export const login = () => signInWithPopup(auth, new GoogleAuthProvider());
export const onUserChanged = (cb) => onAuthStateChanged(auth, cb);
```

**Cloud Firestore:** mỗi người dùng có một sub-collection riêng `users/{uid}/words`.
```js
addDoc(collection(db, "users", uid, "words"), {
  text, translated, source, target, note,
  learned: false, reviewCount: 0, createdAt: serverTimestamp(),
});
```
Danh sách từ được lắng nghe **realtime** bằng `onSnapshot`. Khi thêm, xóa hoặc đánh dấu, giao diện tự cập nhật (kể cả khi mở trên nhiều tab hoặc thiết bị).

**Security Rules** (`firestore.rules`): mỗi người chỉ đọc và ghi được dữ liệu của chính mình.
```
match /users/{userId}/words/{wordId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### 1.6 Hướng dẫn chạy
Xem chi tiết trong [`README.md`](../README.md): tạo project Firebase, bật Cloud Translation API, điền `js/config.js`, rồi chạy `npx serve .`.

---

## 2. Source Code
- Repository: _[điền link GitHub]_
- Các file chính: `index.html`, `css/style.css`, `js/app.js`, `js/translate.js`, `js/firebase.js`, `firestore.rules`.

## 3. Video Demonstration
- Link video: _[điền link YouTube / Google Drive]_
- Nội dung video: dịch từ → đăng nhập Google → lưu từ → xem dữ liệu trên Firebase Console → tìm kiếm, lọc → ôn Flashcard → đánh dấu đã thuộc.

## 4. AI Usage Declaration
Trong quá trình làm bài, em có sử dụng công cụ AI **Claude Code (Anthropic)** để:
- Gợi ý ý tưởng đề tài.
- Sinh mã nguồn ban đầu cho giao diện (HTML/CSS), module gọi Google Translate API, module Firebase Auth/Firestore và chức năng Flashcard.
- Kiểm thử trên trình duyệt và sửa lỗi giao diện.
- Soạn khung tài liệu README và báo cáo này.

Em đã tự đọc hiểu mã nguồn, tạo và cấu hình project Firebase / Google Cloud, chạy thử, quay video demo, chỉnh sửa và chịu trách nhiệm về toàn bộ nội dung nộp. _[Bổ sung phần em tự chỉnh sửa, nếu có]_

## 5. Git Commit History
_(Xuất bằng lệnh `git log --pretty=format:"%h | %ad | %s" --date=short`)_

```
[dán kết quả git log vào đây]
```
