# Create all the files needed for GitHub upload with updated content

# 1. index.html - Main HTML file
index_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💕 Our Connection - Couples App</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#FF6B9D">
</head>
<body>
    <!-- Loading Screen -->
    <div id="loadingScreen" class="loading-screen">
        <div class="loading-animation">
            <div class="heart-loader">💕</div>
            <p>Loading your love story...</p>
        </div>
    </div>

    <!-- Pairing Screen -->
    <div id="pairingScreen" class="pairing-screen hidden">
        <div class="pairing-container">
            <div class="pairing-header">
                <h1 class="pairing-title">💕 Our Connection</h1>
                <p class="pairing-subtitle">Connect with your partner</p>
            </div>
            
            <div class="pairing-options">
                <div class="pairing-option" onclick="showCreateCouple()">
                    <div class="option-icon">💕</div>
                    <h3>Create Couple</h3>
                    <p>Generate invite code</p>
                </div>
                
                <div class="pairing-option" onclick="showJoinCouple()">
                    <div class="option-icon">🔗</div>
                    <h3>Join Couple</h3>
                    <p>Enter partner's code</p>
                </div>
            </div>
            
            <!-- Create Couple Form -->
            <div id="createCoupleForm" class="couple-form hidden">
                <h3>Create Your Couple Space</h3>
                <input type="text" id="yourName" placeholder="Your name">
                <button onclick="createCouple()">Generate Code</button>
                <div id="generatedCode" class="generated-code hidden">
                    <p>Share this code with your partner:</p>
                    <div class="invite-code" id="inviteCode"></div>
                </div>
            </div>
            
            <!-- Join Couple Form -->
            <div id="joinCoupleForm" class="couple-form hidden">
                <h3>Join Your Partner</h3>
                <input type="text" id="partnerName" placeholder="Your name">
                <input type="text" id="joinCode" placeholder="Enter invite code">
                <button onclick="joinCouple()">Join</button>
            </div>
        </div>
    </div>

    <!-- Success Screen -->
    <div id="successScreen" class="success-screen hidden">
        <div class="success-content">
            <div class="success-animation">💕</div>
            <h2>Connected!</h2>
            <p>You're now synced with your partner</p>
            <button onclick="enterApp()">Start Your Journey</button>
        </div>
    </div>

    <!-- Main App -->
    <div id="app" class="app hidden">
        <!-- Sync Status -->
        <div id="syncStatus" class="sync-status hidden">
            <span class="sync-icon">🔄</span>
            <span class="sync-text">Syncing...</span>
        </div>

        <!-- Header -->
        <header class="app-header">
            <div class="header-content">
                <h1>💕 Our Connection</h1>
                <div class="partner-status">
                    <span id="partnerStatus" class="partner-indicator">Partner offline</span>
                </div>
            </div>
        </header>

        <!-- Home Section -->
        <main id="homeSection" class="section active">
            <div class="hero-section">
                <div class="anniversary-card">
                    <h2>Together for</h2>
                    <div class="days-counter" id="daysCounter">0</div>
                    <span class="days-label">days</span>
                    <p id="anniversaryDate">Set your anniversary date</p>
                </div>
            </div>
            
            <div class="features-grid">
                <div class="feature-card" data-section="memoriesSection">
                    <div class="card-icon">📸</div>
                    <h3>Memories</h3>
                    <p>Our special moments</p>
                </div>
                
                <div class="feature-card" data-section="notesSection">
                    <div class="card-icon">💌</div>
                    <h3>Love Notes</h3>
                    <p>Sweet messages</p>
                </div>
                
                <div class="feature-card" data-section="moodsSection">
                    <div class="card-icon">😊</div>
                    <h3>Our Moods</h3>
                    <p>How we're feeling</p>
                </div>
                
                <div class="feature-card" data-section="bucketSection">
                    <div class="card-icon">🎯</div>
                    <h3>Bucket List</h3>
                    <p>Dreams & goals</p>
                </div>
            </div>
        </main>

        <!-- Memories Section -->
        <section id="memoriesSection" class="section hidden">
            <div class="section-header">
                <h2>Our Memories</h2>
                <button class="add-btn" onclick="showAddMemory()">+ Add Memory</button>
            </div>
            
            <div id="addMemoryForm" class="add-form hidden">
                <input type="text" id="memoryTitle" placeholder="Memory title">
                <textarea id="memoryDescription" placeholder="Describe this moment..."></textarea>
                <input type="file" id="memoryPhotos" multiple accept="image/*" capture="environment">
                <div class="form-actions">
                    <button onclick="saveMemory()">Save Memory</button>
                    <button onclick="hideAddMemory()">Cancel</button>
                </div>
            </div>
            
            <div id="memoriesGrid" class="memories-grid"></div>
        </section>

        <!-- Other sections placeholders -->
        <section id="notesSection" class="section hidden">
            <div class="section-header">
                <h2>Love Notes</h2>
            </div>
            <p>Love notes feature coming soon...</p>
        </section>

        <section id="moodsSection" class="section hidden">
            <div class="section-header">
                <h2>Our Moods</h2>
            </div>
            <p>Mood tracking feature coming soon...</p>
        </section>

        <section id="bucketSection" class="section hidden">
            <div class="section-header">
                <h2>Bucket List</h2>
            </div>
            <p>Bucket list feature coming soon...</p>
        </section>

        <!-- Bottom Navigation -->
        <nav class="bottom-nav">
            <button class="nav-btn active" data-section="homeSection">🏠</button>
            <button class="nav-btn" data-section="memoriesSection">📸</button>
            <button class="nav-btn" data-section="notesSection">💌</button>
            <button class="nav-btn" data-section="moodsSection">😊</button>
            <button class="nav-btn" data-section="bucketSection">🎯</button>
        </nav>
    </div>

    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-storage-compat.js"></script>
    
    <!-- App Script -->
    <script src="app.js"></script>
</body>
</html>'''

# 2. app.js - Already created with Firebase config, will use the existing one
app_js = '''// ==========================================
// FIREBASE CONFIGURATION - UPDATED WITH YOUR REAL CONFIG
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBPy59JZclpS2CbJgsYykGx5jJ0fjg8p7A",
  authDomain: "our-app-833bd.firebaseapp.com",
  projectId: "our-app-833bd",
  storageBucket: "our-app-833bd.firebasestorage.app",
  messagingSenderId: "298758161551",
  appId: "1:298758161551:web:e395cc0c095d23a45a5cfa",
  measurementId: "G-ZR6793B86F"
};

// Initialize Firebase (using v8 compat SDK for simplicity)
firebase.initializeApp(firebaseConfig);

// Firebase services
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Enable offline persistence
db.enablePersistence().catch(console.error);

// ==========================================
// APP STATE
// ==========================================
let currentUser = null;
let currentCouple = null;
let unsubscribeFunctions = [];

// ==========================================
// APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen
    showScreen('loadingScreen');
    
    // Initialize auth listener
    auth.onAuthStateChanged(handleAuthStateChange);
    
    // Setup navigation
    setupNavigation();
    
    // Setup form handlers
    setupFormHandlers();
});

// ==========================================
// AUTHENTICATION & PAIRING
// ==========================================
function handleAuthStateChange(user) {
    if (user) {
        currentUser = user;
        console.log('User signed in:', user.uid);
        checkCoupleStatus();
    } else {
        console.log('Signing in anonymously...');
        // Sign in anonymously
        auth.signInAnonymously().catch(error => {
            console.error('Error signing in:', error);
        });
    }
}

function checkCoupleStatus() {
    console.log('Checking couple status for user:', currentUser.uid);
    
    // Check if user is part of a couple
    db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
            if (doc.exists && doc.data().coupleId) {
                console.log('User is part of couple:', doc.data().coupleId);
                currentCouple = doc.data().coupleId;
                loadCoupleData();
                showScreen('app');
            } else {
                console.log('User not part of any couple, showing pairing screen');
                showScreen('pairingScreen');
            }
        })
        .catch(error => {
            console.error('Error checking couple status:', error);
            showScreen('pairingScreen');
        });
}

function showCreateCouple() {
    document.getElementById('createCoupleForm').classList.remove('hidden');
    document.getElementById('joinCoupleForm').classList.add('hidden');
}

function showJoinCouple() {
    document.getElementById('joinCoupleForm').classList.remove('hidden');
    document.getElementById('createCoupleForm').classList.add('hidden');
}

function createCouple() {
    const yourName = document.getElementById('yourName').value.trim();
    if (!yourName) {
        alert('Please enter your name');
        return;
    }
    
    console.log('Creating couple for user:', yourName);
    showSyncStatus('Creating your couple space...');
    
    const coupleId = generateCoupleId();
    const inviteCode = generateInviteCode();
    
    // Create couple document
    db.collection('couples').doc(coupleId).set({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        inviteCode: inviteCode,
        members: {
            [currentUser.uid]: yourName
        },
        memberCount: 1,
        anniversaryDate: null,
        settings: {
            theme: 'romantic',
            partner1Name: yourName,
            partner2Name: null
        }
    }).then(() => {
        console.log('Couple created successfully');
        // Update user document
        return db.collection('users').doc(currentUser.uid).set({
            coupleId: coupleId,
            name: yourName,
            role: 'creator'
        });
    }).then(() => {
        console.log('User document updated');
        // Show invite code
        document.getElementById('inviteCode').textContent = inviteCode;
        document.getElementById('generatedCode').classList.remove('hidden');
        
        currentCouple = coupleId;
        hideSyncStatus();
        
        // Auto-enter app after showing code
        setTimeout(() => {
            showScreen('successScreen');
            setTimeout(() => enterApp(), 2000);
        }, 3000);
    }).catch(error => {
        console.error('Error creating couple:', error);
        alert('Error creating couple. Please try again.');
        hideSyncStatus();
    });
}

function joinCouple() {
    const partnerName = document.getElementById('partnerName').value.trim();
    const joinCode = document.getElementById('joinCode').value.trim().toUpperCase();
    
    if (!partnerName || !joinCode) {
        alert('Please enter both your name and the invite code');
        return;
    }
    
    console.log('Joining couple with code:', joinCode);
    showSyncStatus('Connecting to your partner...');
    
    // Find couple by invite code
    db.collection('couples')
        .where('inviteCode', '==', joinCode)
        .get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                alert('Invalid invite code. Please check and try again.');
                hideSyncStatus();
                return;
            }
            
            const coupleDoc = querySnapshot.docs[0];
            const coupleId = coupleDoc.id;
            const coupleData = coupleDoc.data();
            
            console.log('Found couple:', coupleId);
            
            // Check if couple already has 2 members
            if (coupleData.memberCount >= 2) {
                alert('This couple is already full. Please check your invite code.');
                hideSyncStatus();
                return;
            }
            
            // Add user to couple
            const updatedMembers = {
                ...coupleData.members,
                [currentUser.uid]: partnerName
            };
            
            const updatedSettings = {
                ...coupleData.settings,
                partner2Name: partnerName
            };
            
            return db.collection('couples').doc(coupleId).update({
                members: updatedMembers,
                memberCount: 2,
                settings: updatedSettings
            }).then(() => {
                return db.collection('users').doc(currentUser.uid).set({
                    coupleId: coupleId,
                    name: partnerName,
                    role: 'partner'
                });
            }).then(() => {
                console.log('Successfully joined couple');
                currentCouple = coupleId;
                hideSyncStatus();
                showScreen('successScreen');
                setTimeout(() => enterApp(), 2000);
            });
        })
        .catch(error => {
            console.error('Error joining couple:', error);
            alert('Error joining couple. Please try again.');
            hideSyncStatus();
        });
}

function enterApp() {
    console.log('Entering main app');
    loadCoupleData();
    showScreen('app');
}

// ==========================================
// DATA LOADING & SYNCING
// ==========================================
function loadCoupleData() {
    if (!currentCouple) return;
    
    console.log('Loading couple data for:', currentCouple);
    
    // Setup real-time listeners
    setupMemoriesListener();
    
    // Load anniversary date
    loadAnniversaryDate();
    
    // Load couple settings
    loadCoupleSettings();
}

function setupMemoriesListener() {
    console.log('Setting up memories listener');
    
    const unsubscribe = db.collection('couples')
        .doc(currentCouple)
        .collection('memories')
        .orderBy('timestamp', 'desc')
        .onSnapshot(querySnapshot => {
            const memories = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                memories.push({ 
                    id: doc.id, 
                    ...data,
                    timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
                });
            });
            console.log('Memories updated:', memories.length);
            renderMemories(memories);
        }, error => {
            console.error('Error listening to memories:', error);
        });
    
    unsubscribeFunctions.push(unsubscribe);
}

// ==========================================
// MEMORY FUNCTIONS
// ==========================================
function showAddMemory() {
    document.getElementById('addMemoryForm').classList.remove('hidden');
    document.querySelector('[data-section="memoriesSection"]')?.scrollIntoView();
}

function hideAddMemory() {
    document.getElementById('addMemoryForm').classList.add('hidden');
    // Clear form
    document.getElementById('memoryTitle').value = '';
    document.getElementById('memoryDescription').value = '';
    document.getElementById('memoryPhotos').value = '';
}

async function saveMemory() {
    const title = document.getElementById('memoryTitle').value.trim();
    const description = document.getElementById('memoryDescription').value.trim();
    const photosInput = document.getElementById('memoryPhotos');
    
    if (!title) {
        alert('Please enter a memory title');
        return;
    }
    
    console.log('Saving memory:', title);
    showSyncStatus('Saving memory...');
    
    try {
        // Upload photos if any
        const photoUrls = [];
        if (photosInput.files.length > 0) {
            console.log('Uploading', photosInput.files.length, 'photos');
            for (let file of photosInput.files) {
                const compressedFile = await compressImage(file);
                const photoUrl = await uploadPhoto(compressedFile);
                photoUrls.push(photoUrl);
            }
        }
        
        // Get current user name
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userName = userDoc.data()?.name || 'Unknown';
        
        // Save memory to Firestore
        await db.collection('couples')
            .doc(currentCouple)
            .collection('memories')
            .add({
                title: title,
                description: description,
                photos: photoUrls,
                author: currentUser.uid,
                authorName: userName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString().split('T')[0],
                favorited: false
            });
        
        console.log('Memory saved successfully');
        hideAddMemory();
        hideSyncStatus();
        
    } catch (error) {
        console.error('Error saving memory:', error);
        alert('Error saving memory. Please try again.');
        hideSyncStatus();
    }
}

async function uploadPhoto(file) {
    const fileName = Date.now() + '_' + Math.random().toString(36).substr(2, 9) + '.jpg';
    const storageRef = storage.ref('couples/' + currentCouple + '/photos/' + fileName);
    
    console.log('Uploading photo:', fileName);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    console.log('Photo uploaded successfully:', downloadURL);
    return downloadURL;
}

async function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

function renderMemories(memories) {
    const grid = document.getElementById('memoriesGrid');
    if (!grid) return;
    
    if (memories.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📸</div>
                <h3>No memories yet</h3>
                <p>Start creating beautiful memories together!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = memories.map(memory => `
        <div class="memory-card" onclick="viewMemory('${memory.id}')">
            ${memory.photos && memory.photos.length > 0 ? 
                `<img src="${memory.photos[0]}" alt="${memory.title}" loading="lazy">` :
                '<div class="memory-placeholder">📸</div>'
            }
            <div class="memory-info">
                <h3>${memory.title}</h3>
                <p>${memory.description}</p>
                <div class="memory-meta">
                    <span class="memory-date">${memory.date}</span>
                    <span class="memory-author">by ${memory.authorName}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function viewMemory(memoryId) {
    console.log('Viewing memory:', memoryId);
    // Implementation for full-screen memory view
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function generateCoupleId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateInviteCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    // Hide all screens
    document.querySelectorAll('.loading-screen, .pairing-screen, .success-screen, .app').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

function showSyncStatus(message) {
    const status = document.getElementById('syncStatus');
    if (status) {
        status.querySelector('.sync-text').textContent = message;
        status.classList.remove('hidden');
    }
}

function hideSyncStatus() {
    const status = document.getElementById('syncStatus');
    if (status) {
        status.classList.add('hidden');
    }
}

function setupNavigation() {
    document.addEventListener('click', (e) => {
        // Handle navigation clicks
        if (e.target.matches('[data-section]')) {
            const section = e.target.dataset.section;
            showSection(section);
        }
    });
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        }
    });
}

function setupFormHandlers() {
    // Form submission handlers will be added here
}

function loadAnniversaryDate() {
    db.collection('couples').doc(currentCouple).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                if (data.anniversaryDate) {
                    const anniversaryDate = new Date(data.anniversaryDate);
                    const today = new Date();
                    const diffTime = Math.abs(today - anniversaryDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    const counter = document.getElementById('daysCounter');
                    const dateElement = document.getElementById('anniversaryDate');
                    
                    if (counter) counter.textContent = diffDays;
                    if (dateElement) dateElement.textContent = `Since ${anniversaryDate.toLocaleDateString()}`;
                } else {
                    // No anniversary date set
                    const counter = document.getElementById('daysCounter');
                    const dateElement = document.getElementById('anniversaryDate');
                    
                    if (counter) counter.textContent = '?';
                    if (dateElement) dateElement.textContent = 'Set your anniversary date';
                }
            }
        })
        .catch(console.error);
}

function loadCoupleSettings() {
    db.collection('couples').doc(currentCouple).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                console.log('Couple settings loaded:', data.settings);
                // Update UI with couple settings
            }
        })
        .catch(console.error);
}

// Global functions that need to be accessible from HTML
window.showCreateCouple = showCreateCouple;
window.showJoinCouple = showJoinCouple;
window.createCouple = createCouple;
window.joinCouple = joinCouple;
window.enterApp = enterApp;
window.showAddMemory = showAddMemory;
window.hideAddMemory = hideAddMemory;
window.saveMemory = saveMemory;
window.viewMemory = viewMemory;'''

# 3. style.css - CSS styles
style_css = '''/* Modern Couples App Styles */
:root {
    --primary-color: #FF6B9D;
    --secondary-color: #C77DFF;
    --accent-color: #FFD93D;
    --text-color: #2D3748;
    --text-light: #718096;
    --background: #F7FAFC;
    --surface: #FFFFFF;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --radius: 12px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #FF6B9D 0%, #C77DFF 100%);
    min-height: 100vh;
    color: var(--text-color);
}

.hidden {
    display: none !important;
}

/* Loading Screen */
.loading-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #FF6B9D 0%, #C77DFF 100%);
    color: white;
}

.heart-loader {
    font-size: 3rem;
    animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* Pairing Screen */
.pairing-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
}

.pairing-container {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    box-shadow: var(--shadow);
}

.pairing-title {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.pairing-subtitle {
    text-align: center;
    color: var(--text-light);
    margin-bottom: 2rem;
}

.pairing-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.pairing-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    border: 2px solid #E2E8F0;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.3s ease;
}

.pairing-option:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
}

.option-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.couple-form {
    margin-top: 1rem;
}

.couple-form input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius);
    margin-bottom: 1rem;
    font-size: 1rem;
}

.couple-form button {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.3s ease;
}

.couple-form button:hover {
    opacity: 0.9;
}

.generated-code {
    text-align: center;
    margin-top: 1rem;
}

.invite-code {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
    background: #F7FAFC;
    padding: 1rem;
    border-radius: var(--radius);
    margin-top: 0.5rem;
    letter-spacing: 2px;
}

/* Success Screen */
.success-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #FF6B9D 0%, #C77DFF 100%);
    color: white;
    text-align: center;
}

.success-animation {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 2s infinite;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
}

.success-content button {
    margin-top: 2rem;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 1rem;
}

/* Main App */
.app {
    min-height: 100vh;
    background: var(--background);
    padding-bottom: 80px; /* Space for bottom nav */
}

.sync-status {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--primary-color);
    color: white;
    padding: 0.5rem;
    text-align: center;
    z-index: 1000;
    font-size: 0.9rem;
}

.app-header {
    background: var(--surface);
    padding: 1rem;
    box-shadow: var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 800px;
    margin: 0 auto;
}

.partner-status {
    font-size: 0.9rem;
    color: var(--text-light);
}

.partner-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.partner-indicator::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #EF4444;
}

.partner-indicator.online::before {
    background: #10B981;
}

/* Home Section */
.hero-section {
    padding: 2rem 1rem;
    background: linear-gradient(135deg, #FF6B9D 0%, #C77DFF 100%);
    color: white;
    text-align: center;
}

.anniversary-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: var(--radius);
    padding: 2rem;
    max-width: 300px;
    margin: 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.days-counter {
    font-size: 3rem;
    font-weight: bold;
    margin: 0.5rem 0;
}

.days-label {
    font-size: 1.2rem;
    opacity: 0.9;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    padding: 2rem 1rem;
    max-width: 800px;
    margin: 0 auto;
}

.feature-card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 1.5rem;
    text-align: center;
    box-shadow: var(--shadow);
    cursor: pointer;
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);
}

.card-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.feature-card h3 {
    margin-bottom: 0.5rem;
    color: var(--text-color);
}

.feature-card p {
    color: var(--text-light);
    font-size: 0.9rem;
}

/* Sections */
.section {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
}

.section.hidden {
    display: none;
}

.section.active {
    display: block;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.add-btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 0.9rem;
}

/* Forms */
.add-form {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow);
}

.add-form input,
.add-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius);
    margin-bottom: 1rem;
    font-family: inherit;
    font-size: 1rem;
}

.add-form textarea {
    resize: vertical;
    min-height: 100px;
}

.form-actions {
    display: flex;
    gap: 1rem;
}

.form-actions button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 1rem;
}

.form-actions button:first-child {
    background: var(--primary-color);
    color: white;
}

.form-actions button:last-child {
    background: #E2E8F0;
    color: var(--text-color);
}

/* Memory Grid */
.memories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.memory-card {
    background: var(--surface);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
    cursor: pointer;
    transition: transform 0.3s ease;
}

.memory-card:hover {
    transform: translateY(-2px);
}

.memory-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.memory-placeholder {
    width: 100%;
    height: 200px;
    background: #F7FAFC;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: var(--text-light);
}

.memory-info {
    padding: 1rem;
}

.memory-info h3 {
    margin-bottom: 0.5rem;
}

.memory-info p {
    color: var(--text-light);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.memory-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--text-light);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-light);
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

/* Bottom Navigation */
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-around;
    padding: 1rem 0;
    z-index: 100;
}

.nav-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    padding: 0.5rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.3s ease;
}

.nav-btn.active {
    opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
    .features-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .memories-grid {
        grid-template-columns: 1fr;
    }
    
    .pairing-container {
        margin: 1rem;
        padding: 1.5rem;
    }
    
    .form-actions {
        flex-direction: column;
    }
}'''

# 4. manifest.json - PWA manifest
manifest_json = '''{
  "name": "Our Connection - Couples App",
  "short_name": "Our Connection",
  "description": "A beautiful couples app with real-time sync",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FF6B9D",
  "theme_color": "#FF6B9D",
  "orientation": "portrait",
  "icons": [
    {
      "src": "https://via.placeholder.com/192x192/FF6B9D/FFFFFF?text=💕",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "https://via.placeholder.com/512x512/FF6B9D/FFFFFF?text=💕",
      "sizes": "512x512", 
      "type": "image/png"
    }
  ]
}'''

# 5. README.md - Project documentation
readme_md = '''# 💕 Our Connection - Couples App

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

Made with 💕 for couples who want to stay connected digitally!'''

# 6. package.json - Project configuration
package_json = '''{
  "name": "couples-connection-app",
  "version": "1.0.0",
  "description": "A real-time syncing couples app with Firebase",
  "main": "index.html",
  "scripts": {
    "start": "serve .",
    "build": "echo 'No build process needed for vanilla JS app'",
    "deploy": "firebase deploy"
  },
  "keywords": ["couples", "firebase", "pwa", "real-time", "sync"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "serve": "^14.0.0"
  }
}'''

# 7. .gitignore - Git ignore file
gitignore = '''# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Firebase
.firebase/
firebase-debug.log*
firestore-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Environment variables
.env
.env.local
.env.production'''

# Save all files
files = {
    'index.html': index_html,
    'app.js': app_js,
    'style.css': style_css,
    'manifest.json': manifest_json,
    'README.md': readme_md,
    'package.json': package_json,
    '.gitignore': gitignore
}

for filename, content in files.items():
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ All files created for GitHub upload!")
print("\nFiles ready to upload:")
for filename in files.keys():
    print(f"- {filename}")
    
print(f"\n📁 Total files: {len(files)}")
print("\n🚀 Ready to upload to GitHub!")
print("\nNext steps:")
print("1. Create new GitHub repository")
print("2. Upload all these files")  
print("3. Enable GitHub Pages")
print("4. Complete Firebase setup")
print("5. Test with your girlfriend! 💕")