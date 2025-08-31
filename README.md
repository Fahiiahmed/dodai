# 💕 Our Connection - Couples App

A beautiful, real-time syncing couples app built with Firebase and vanilla JavaScript.

## Features

- 🔄 **Real-time sync** between two devices
- 📸 **Photo memories** with upload and compression
- 💌 **Love notes** with instant messaging
- 😊 **Mood tracking** with partner comparison  
- 🎯 **Collaborative bucket list**
- 🔗 **Simple pairing** with invite codes
- 📱 **Mobile-first** responsive design
- 🌐 **Works offline** with background sync

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project (e.g., "couples-app-sync")
4. Disable Google Analytics
5. Click "Create project"

### 2. Enable Firebase Services

1. **Firestore Database**:
   - Go to "Firestore Database" → "Create database"
   - Start in production mode
   - Choose your region

2. **Storage**:
   - Go to "Storage" → "Get started"  
   - Start in production mode

3. **Authentication**:
   - Go to "Authentication" → "Get started"
   - Enable "Anonymous" sign-in method

### 3. Add Web App to Firebase

1. In your Firebase project, click the web icon `</>`
2. App nickname: "Couples Connection App"
3. Check "Also set up Firebase Hosting"
4. Click "Register app"
5. **Copy the Firebase configuration**

### 4. Update Firebase Config

1. Open `app.js`
2. Replace the `firebaseConfig` object with your actual config

### 5. Set Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /couples/{coupleId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members.keys();

      match /{document=**} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/couples/$(coupleId)).data.members.keys();
      }
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /couples/{coupleId}/{allPaths=**} {
      allow read, write: if request.auth != null &&
        request.auth.uid in firestore.get(/databases/(default)/documents/couples/$(coupleId)).data.members.keys();
    }
  }
}
```

### 6. Deploy to GitHub Pages

1. Create new GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Source: Deploy from branch `main`
5. Your app will be available at: `https://username.github.io/repository-name`

### 7. Usage

1. **First partner**: Open the app → "Create Couple" → Share the 6-digit code
2. **Second partner**: Open the app → "Join Couple" → Enter the code
3. **Start using**: Add memories, send notes, track moods, and build your bucket list together!

## Security & Privacy

- ✅ Data isolated to your couple only
- ✅ Encrypted data transmission (HTTPS)
- ✅ Secure Firebase authentication
- ✅ Photos stored in private Firebase Storage
- ✅ Anonymous authentication (no personal info required)

## Firebase Usage (Free Tier)

The app is designed to stay within Firebase's free limits:
- **Storage**: 5 GB (plenty for photos)
- **Database**: 50K reads/day, 20K writes/day
- **Authentication**: 10K sign-ins/month

Perfect for a two-person couples app! 💕

## Development

### Local Development

1. Clone the repository
2. Update Firebase config in `app.js`  
3. Serve the files with any local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .
   ```

## Customization

The app is built with vanilla JavaScript and CSS - easy to customize:
- Colors and themes in CSS variables
- Features can be added/removed easily
- Mobile-first responsive design
- Modern glassmorphism UI

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Firebase configuration
3. Ensure all Firebase services are enabled
4. Check that your Firebase project has the correct security rules

---

Made with 💕 for couples who want to stay connected digitally!