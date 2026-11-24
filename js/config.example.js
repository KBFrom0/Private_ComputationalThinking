// Sao chép file này thành config.js rồi điền thông tin thật.
// config.js đã được .gitignore để không lộ API key lên Git.

// Firebase Console → Project settings → General → Your apps → Web app → SDK config
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxx",
};

// Google Cloud Console → APIs & Services → Credentials → API key
// (cần bật "Cloud Translation API"). Để trống "" thì app dùng endpoint
// miễn phí translate.googleapis.com (không cần key, chỉ nên dùng để thử).
export const TRANSLATE_API_KEY = "";
