# 📘 Smart Vocab – Smart Vocabulary Notebook

A web app that looks up meanings with the **Google Translate API**, saves words to a personal notebook on **Firebase** (Authentication + Cloud Firestore), and helps you review them with **flashcards**.

- 🌐 **Live demo:** https://smart-vocab-d4665.web.app
- 🎬 **Demo video (English subtitles):** [`docs/demo.mp4`](docs/demo.mp4)
- 📄 **Report:** [`docs/REPORT.md`](docs/REPORT.md) · [`docs/REPORT.pdf`](docs/REPORT.pdf)

## Features
1. **Translate**: translate words or sentences between 8 languages, with automatic source-language detection.
2. **Sign in** with Google or Email/Password (Firebase Authentication).
3. **Personal notebook** (Cloud Firestore): save, delete, search, filter, and mark words as learned. Data syncs in realtime.
4. **Flashcards**: flip a card to see the meaning, then mark it as "learned" or "not yet".

## Project structure
```
23125084_W07_01/
├── index.html            # UI
├── css/style.css
├── js/
│   ├── app.js            # UI logic
│   ├── translate.js      # Google Translate API calls
│   ├── firebase.js       # Firebase Auth + Firestore
│   ├── config.example.js # Config template (committed)
│   └── config.js         # Real config (NOT committed)
├── firestore.rules       # Firestore security rules
└── firebase.json         # Firebase Hosting config
```

## Setup & run

### 1. Create the config file
```bash
cp js/config.example.js js/config.js
```

### 2. Firebase
1. Go to https://console.firebase.google.com and create a project.
2. **Build → Authentication → Sign-in method**, then enable **Google** and **Email/Password**.
3. **Build → Firestore Database → Create database**, then paste the contents of `firestore.rules` into the **Rules** tab.
4. **Project settings → Your apps → Web (</>)**, then copy `firebaseConfig` into `js/config.js`.

### 3. Google Translate API
1. Go to https://console.cloud.google.com and select your project (you can reuse the Firebase project).
2. **APIs & Services → Library**, then enable **Cloud Translation API**.
3. **Credentials → Create credentials → API key**, then paste the key into `TRANSLATE_API_KEY` in `js/config.js`.
   It is recommended to restrict the key by HTTP referrer (your site's domain).

> If `TRANSLATE_API_KEY` is left empty, the app falls back to the public endpoint `translate.googleapis.com/translate_a/single`. It needs no key, but Google may block it.

### 4. Run locally
The app uses ES Modules, so it must be served over HTTP. Opening `index.html` directly as a file will not work:
```bash
npx serve .
# or use the "Live Server" extension in VS Code
```
Then open http://localhost:3000.

### 5. Deploy (optional)
```bash
npm install -g firebase-tools
firebase login
firebase use --add      # select your project
firebase deploy
```
