// ==========================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, query, where, collection, getDocs, onSnapshot, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-zFYep-gFDuTDLs1JMDWTiY0IedKwFGw",
  authDomain: "my-app-8205a.firebaseapp.com",
  projectId: "my-app-8205a",
  storageBucket: "my-app-8205a.firebasestorage.app",
  messagingSenderId: "810403652444",
  appId: "1:810403652444:web:f6ed34b1d12e5ca534d799"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==========================================
// APP STATE
// ==========================================
let currentUser = null;
let currentCouple = null;
let partnerUid = null;
let unsubscribeFunctions = [];

// ==========================================
// APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    showScreen('loadingScreen');
    setupNavigation();
    setupFormHandlers();
});

// ==========================================
// AUTHENTICATION
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log('User signed in:', currentUser.uid);
        setPresenceOnline();
        checkCoupleStatus();
    } else {
        console.log('Signing in anonymously...');
        signInAnonymously(auth).catch(error => {
            console.error('Error signing in:', error);
            alert('Error connecting to app. Please refresh.');
        });
    }
});

async function checkCoupleStatus() {
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().coupleId) {
            currentCouple = userSnap.data().coupleId;
            console.log('User is part of couple:', currentCouple);

            // Get partner info
            await loadPartnerInfo();
            loadCoupleData();
            showScreen('app');
        } else {
            console.log('User not part of any couple');
            showScreen('pairingScreen');
        }
    } catch (error) {
        console.error('Error checking couple status:', error);
        showScreen('pairingScreen');
    }
}

async function loadPartnerInfo() {
    try {
        const coupleRef = doc(db, 'couples', currentCouple);
        const coupleSnap = await getDoc(coupleRef);

        if (coupleSnap.exists()) {
            const coupleData = coupleSnap.data();
            const members = coupleData.members || {};

            // Find partner UID (not current user)
            partnerUid = Object.keys(members).find(uid => uid !== currentUser.uid);

            if (partnerUid) {
                console.log('Partner found:', partnerUid);
                listenPartnerPresence();
            }
        }
    } catch (error) {
        console.error('Error loading partner info:', error);
    }
}

// ==========================================
// PRESENCE SYSTEM
// ==========================================
async function setPresenceOnline() {
    if (!currentUser) return;

    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
            status: 'online',
            last_changed: serverTimestamp()
        }, { merge: true });
        console.log('Presence set to online');
    } catch (error) {
        console.error('Error setting presence:', error);
    }
}

async function setPresenceOffline() {
    if (!currentUser) return;

    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
            status: 'offline',
            last_changed: serverTimestamp()
        }, { merge: true });
        console.log('Presence set to offline');
    } catch (error) {
        console.error('Error setting presence:', error);
    }
}

function listenPartnerPresence() {
    if (!partnerUid) return;

    const partnerRef = doc(db, 'users', partnerUid);
    const unsubscribe = onSnapshot(partnerRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            updatePartnerStatusUI(data.status === 'online');
        } else {
            updatePartnerStatusUI(false);
        }
    });

    unsubscribeFunctions.push(unsubscribe);
}

function updatePartnerStatusUI(isOnline) {
    const partnerStatusElem = document.getElementById('partnerStatus');
    if (partnerStatusElem) {
        if (isOnline) {
            partnerStatusElem.textContent = 'Partner online';
            partnerStatusElem.classList.add('online');
        } else {
            partnerStatusElem.textContent = 'Partner offline';
            partnerStatusElem.classList.remove('online');
        }
    }
}

// Handle page unload
window.addEventListener('beforeunload', setPresenceOffline);
window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        setPresenceOffline();
    } else {
        setPresenceOnline();
    }
});

// ==========================================
// COUPLE CREATION & JOINING
// ==========================================
function generateInviteCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function generateCoupleId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

async function createCouple() {
    const yourName = document.getElementById('yourName').value.trim();

    if (!yourName) {
        alert('Please enter your name');
        return;
    }

    if (!currentUser) {
        alert('Please wait for app to load');
        return;
    }

    console.log('Creating couple for:', yourName);
    showSyncStatus('Creating your couple space...');

    try {
        const coupleId = generateCoupleId();
        const inviteCode = generateInviteCode();

        // Create couple document
        const coupleRef = doc(db, 'couples', coupleId);
        await setDoc(coupleRef, {
            createdAt: serverTimestamp(),
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
        });

        // Create/update user document
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
            coupleId: coupleId,
            name: yourName,
            role: 'creator'
        }, { merge: true });

        // Set presence online
        await setPresenceOnline();

        currentCouple = coupleId;

        // Show invite code
        document.getElementById('inviteCode').textContent = inviteCode;
        document.getElementById('generatedCode').classList.remove('hidden');

        hideSyncStatus();
        console.log('Couple created successfully');

        // Auto-transition after showing code
        setTimeout(() => {
            showScreen('successScreen');
            setTimeout(() => {
                loadCoupleData();
                showScreen('app');
            }, 2000);
        }, 3000);

    } catch (error) {
        console.error('Error creating couple:', error);
        alert('Error creating couple: ' + error.message);
        hideSyncStatus();
    }
}

async function joinCouple() {
    const partnerName = document.getElementById('partnerName').value.trim();
    const joinCode = document.getElementById('joinCode').value.trim().toUpperCase();

    if (!partnerName || !joinCode) {
        alert('Please enter both your name and the invite code');
        return;
    }

    if (!currentUser) {
        alert('Please wait for app to load');
        return;
    }

    console.log('Joining couple with code:', joinCode);
    showSyncStatus('Connecting to your partner...');

    try {
        // Find couple by invite code
        const couplesRef = collection(db, 'couples');
        const q = query(couplesRef, where('inviteCode', '==', joinCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert('Invalid invite code. Please check and try again.');
            hideSyncStatus();
            return;
        }

        const coupleDoc = querySnapshot.docs[0];
        const coupleId = coupleDoc.id;
        const coupleData = coupleDoc.data();

        // Check if couple already has 2 members
        if (coupleData.memberCount >= 2) {
            alert('This couple is already full. Please check your invite code.');
            hideSyncStatus();
            return;
        }

        // Update couple document with new member
        const updatedMembers = {
            ...coupleData.members,
            [currentUser.uid]: partnerName
        };

        const updatedSettings = {
            ...coupleData.settings,
            partner2Name: partnerName
        };

        const coupleRef = doc(db, 'couples', coupleId);
        await setDoc(coupleRef, {
            members: updatedMembers,
            memberCount: 2,
            settings: updatedSettings
        }, { merge: true });

        // Create/update user document
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
            coupleId: coupleId,
            name: partnerName,
            role: 'partner'
        }, { merge: true });

        // Set presence online
        await setPresenceOnline();

        currentCouple = coupleId;

        console.log('Successfully joined couple');
        hideSyncStatus();

        showScreen('successScreen');
        setTimeout(() => {
            loadPartnerInfo();
            loadCoupleData();
            showScreen('app');
        }, 2000);

    } catch (error) {
        console.error('Error joining couple:', error);
        alert('Error joining couple: ' + error.message);
        hideSyncStatus();
    }
}

// ==========================================
// DATA LOADING & SYNCING
// ==========================================
function loadCoupleData() {
    if (!currentCouple) return;

    console.log('Loading couple data for:', currentCouple);
    setupMemoriesListener();
    loadAnniversaryDate();
}

function setupMemoriesListener() {
    if (!currentCouple) return;

    const memoriesRef = collection(db, 'couples', currentCouple, 'memories');
    const q = query(memoriesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const memories = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            memories.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
            });
        });

        console.log('Memories updated:', memories.length);
        renderMemories(memories);
    }, (error) => {
        console.error('Error listening to memories:', error);
    });

    unsubscribeFunctions.push(unsubscribe);
}

async function loadAnniversaryDate() {
    if (!currentCouple) return;

    try {
        const coupleRef = doc(db, 'couples', currentCouple);
        const coupleSnap = await getDoc(coupleRef);

        if (coupleSnap.exists()) {
            const data = coupleSnap.data();
            if (data.anniversaryDate) {
                const anniversaryDate = new Date(data.anniversaryDate);
                const today = new Date();
                const diffTime = Math.abs(today - anniversaryDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                document.getElementById('daysCounter').textContent = diffDays;
                document.getElementById('anniversaryDate').textContent = `Since ${anniversaryDate.toLocaleDateString()}`;
            } else {
                document.getElementById('daysCounter').textContent = '?';
                document.getElementById('anniversaryDate').textContent = 'Set your anniversary date';
            }
        }
    } catch (error) {
        console.error('Error loading anniversary date:', error);
    }
}

// ==========================================
// MEMORY FUNCTIONS
// ==========================================
function showAddMemory() {
    document.getElementById('addMemoryForm').classList.remove('hidden');
    document.querySelector('#addMemoryForm').scrollIntoView();
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

    if (!title) {
        alert('Please enter a memory title');
        return;
    }

    if (!currentCouple) {
        alert('Not connected to couple');
        return;
    }

    console.log('Saving memory:', title);
    showSyncStatus('Saving memory...');

    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userName = userSnap.exists() ? userSnap.data().name : 'Unknown';

        // Save memory to Firestore
        const memoriesRef = collection(db, 'couples', currentCouple, 'memories');
        await addDoc(memoriesRef, {
            title: title,
            description: description,
            photos: [], // Photo upload will be implemented later
            author: currentUser.uid,
            authorName: userName,
            timestamp: serverTimestamp(),
            date: new Date().toISOString().split('T')[0],
            favorited: false
        });

        console.log('Memory saved successfully');
        hideAddMemory();
        hideSyncStatus();

    } catch (error) {
        console.error('Error saving memory:', error);
        alert('Error saving memory: ' + error.message);
        hideSyncStatus();
    }
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
        <div class="memory-card">
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

// ==========================================
// UI FUNCTIONS
// ==========================================
function showScreen(screenId) {
    console.log('Showing screen:', screenId);

    // Hide all screens
    document.querySelectorAll('.screen').forEach(el => {
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

function showCreateCouple() {
    document.getElementById('createCoupleForm').classList.remove('hidden');
    document.getElementById('joinCoupleForm').classList.add('hidden');
    document.getElementById('backButton').classList.remove('hidden');
}

function showJoinCouple() {
    document.getElementById('joinCoupleForm').classList.remove('hidden');
    document.getElementById('createCoupleForm').classList.add('hidden');
    document.getElementById('backButton').classList.remove('hidden');
}

function hideAllForms() {
    document.getElementById('createCoupleForm').classList.add('hidden');
    document.getElementById('joinCoupleForm').classList.add('hidden');
    document.getElementById('generatedCode').classList.add('hidden');
    document.getElementById('backButton').classList.add('hidden');
    document.getElementById('yourName').value = '';
    document.getElementById('partnerName').value = '';
    document.getElementById('joinCode').value = '';
}

function setupNavigation() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-section]')) {
            const section = e.target.dataset.section;
            showSection(section);
        }
    });
}

function showSection(sectionId) {
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
    // Handle enter key in forms
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (e.target.id === 'yourName') {
                createCouple();
            } else if (e.target.id === 'joinCode' || e.target.id === 'partnerName') {
                joinCouple();
            }
        }
    });

    // Auto-uppercase join code
    const joinCodeInput = document.getElementById('joinCode');
    if (joinCodeInput) {
        joinCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
}

// Make functions available globally for HTML onclick handlers
window.createCouple = createCouple;
window.joinCouple = joinCouple;
window.showCreateCouple = showCreateCouple;
window.showJoinCouple = showJoinCouple;
window.hideAllForms = hideAllForms;
window.showAddMemory = showAddMemory;
window.hideAddMemory = hideAddMemory;
window.saveMemory = saveMemory;