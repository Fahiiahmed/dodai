# 💕 Our Connection - Couples App

A beautiful, real-time syncing couples app built with Firebase v12 and vanilla JavaScript.

## ✨ Features

- 🔄 **Real-time sync** between two devices
- 👫 **Simple pairing** with 6-digit invite codes
- 📸 **Photo memories** with upload capability
- 👥 **Presence tracking** - see when your partner is online
- 🔐 **Anonymous authentication** - no personal info required
- 📱 **Mobile-first** responsive design
- 🌐 **Progressive Web App** (PWA) support

## 🚀 Live Demo

Experience the magic at: [Your GitHub Pages URL]

## 🛠️ Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Project name: `couples-app-v2` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Firebase Services

#### Authentication
1. Go to **Authentication** → **Get started**
2. Click **"Sign-in method"** tab
3. Enable **"Anonymous"** provider
4. Save changes

#### Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Start in **production mode**
3. Choose your region (closest to your location)
4. Click **"Done"**

#### Storage (Optional for photos)
1. Go to **Storage** → **Get started**
2. Start in **production mode**
3. Choose same region as Firestore
4. Click **"Done"**

### 3. Add Web App

1. In Firebase project overview, click web icon `</>`
2. App nickname: `"Couples Connection"`
3. Don't check Firebase Hosting (we'll use GitHub Pages)
4. Click **"Register app"**
5. **Copy your Firebase configuration**

### 4. Update Your Firebase Config

1. Open `app.js` file
2. Replace the `firebaseConfig` object with your config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 5. Set Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace existing rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }

    match /couples/{coupleId} {
      allow create: if request.auth != null;
      allow read, write: if request.auth != null &&
        (request.auth.uid in resource.data.members.keys() ||
         request.auth.uid in request.resource.data.members.keys());

      match /{subCollection}/{document} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/couples/$(coupleId)).data.members.keys();
      }
    }
  }
}
```

3. Click **"Publish"**

### 6. Deploy to GitHub Pages

1. Create new GitHub repository: `couples-app`
2. Upload all project files:
   - `index.html`
   - `app.js` (with your Firebase config)
   - `style.css`
   - `manifest.json`
   - `README.md`
3. Go to **Settings** → **Pages**
4. Source: **Deploy from a branch**
5. Branch: **main** / **root**
6. Save and wait 5-10 minutes

## 📱 How to Use

### For the First Partner:
1. Open the app URL
2. Click **"Create Couple"**
3. Enter your name
4. Share the 6-digit code with your partner

### For the Second Partner:
1. Open the same app URL
2. Click **"Join Couple"**
3. Enter your name and the 6-digit code
4. You're now connected!

### Adding Memories:
1. Go to **Memories** section (📸)
2. Click **"+ Add Memory"**
3. Enter title and description
4. Save to sync with your partner instantly

## 🏗️ Project Structure

```
couples-app/
├── index.html          # Main HTML structure
├── app.js             # Firebase v12 integration & app logic
├── style.css          # Modern responsive styles
├── manifest.json      # PWA configuration
└── README.md          # This file
```

## 🔧 Technical Details

- **Firebase SDK**: v12.2.1 (Modular)
- **Authentication**: Anonymous
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (for future photo uploads)
- **Hosting**: GitHub Pages
- **Framework**: Vanilla JavaScript (no dependencies)

## 🚦 Firebase Usage (Free Tier)

Perfect for couples! The app stays within Firebase free limits:
- **Firestore**: 50K reads/20K writes per day
- **Storage**: 5 GB total storage
- **Authentication**: 10K sign-ins per month

## 🔒 Security & Privacy

- ✅ Anonymous authentication (no personal data required)
- ✅ Data encrypted in transit (HTTPS)
- ✅ Isolated couple data (only you and partner can access)
- ✅ Secure Firestore rules
- ✅ Real-time presence tracking

## 🎨 Customization

The app uses CSS variables for easy theming:

```css
:root {
    --primary-color: #FF6B9D;    /* Pink */
    --secondary-color: #C77DFF;  /* Purple */
    --accent-color: #FFD93D;     /* Yellow */
}
```

## 🐛 Troubleshooting

### App won't load:
- Check Firebase config in `app.js`
- Verify all Firebase services are enabled
- Check browser console for errors

### Can't create/join couple:
- Verify Firestore rules are published
- Check Authentication is enabled
- Ensure both users have internet connection

### Partner showing offline:
- Both users need to be on the app
- Check Firestore real-time listeners
- Verify presence system is working

## 🔮 Planned Features

- [ ] Photo upload for memories
- [ ] Love notes messaging
- [ ] Mood tracking with history
- [ ] Shared bucket list
- [ ] Anniversary date setting
- [ ] Push notifications
- [ ] Custom themes

## 💝 Made with Love

Created for couples who want to stay digitally connected. Perfect for:
- Long-distance relationships
- Daily connection reminders  
- Shared memory keeping
- Real-time presence awareness

---

**Have questions?** Open an issue or contribute to make this even better! 💕