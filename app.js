// ==========================================
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
window.viewMemory = viewMemory;