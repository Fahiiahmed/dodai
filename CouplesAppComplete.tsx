
"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Users, Clock, Plus, Upload, Check, AlertCircle, Wifi, WifiOff } from "lucide-react";

// Firebase imports
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  addDoc,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { 
  getDatabase, 
  ref, 
  set, 
  onValue,
  onDisconnect,
  serverTimestamp as rtdbServerTimestamp
} from "firebase/database";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  User
} from "firebase/auth";

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
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);

// Interface for memories
interface Memory {
  id: string;
  text: string;
  imageUrl?: string;
  timestamp: Timestamp;
  userId: string;
  userName?: string;
}

interface Invite {
  id: string;
  creatorId: string;
  creatorName: string;
  createdAt: Timestamp;
  expiresAt: Date;
  partnerId?: string;
  partnerName?: string;
  joinedAt?: Timestamp;
  active: boolean;
}

export default function CouplesAppComplete() {
  // App states
  const [appState, setAppState] = useState<"loading" | "welcome" | "create" | "join" | "paired">("loading");
  const [inviteCode, setInviteCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [userName, setUserName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerStatus, setPartnerStatus] = useState<"online" | "offline">("offline");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemory, setNewMemory] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);

  // Refs for cleanup
  const presenceUnsubscribe = useRef<(() => void) | null>(null);
  const memoriesUnsubscribe = useRef<(() => void) | null>(null);
  const coupleUnsubscribe = useRef<(() => void) | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkExistingCouple(currentUser.uid);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Error signing in anonymously:", error);
          setError("Failed to initialize app. Please refresh.");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Check if user is already in a couple
  const checkExistingCouple = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.coupleId) {
          setCoupleId(userData.coupleId);
          setUserName(userData.name || "");

          // Load couple data
          const coupleDoc = await getDoc(doc(db, "couples", userData.coupleId));
          if (coupleDoc.exists()) {
            const coupleData = coupleDoc.data();
            const partner = Object.keys(coupleData.members).find(id => id !== userId);
            if (partner) {
              setPartnerId(partner);
              setPartnerName(coupleData.members[partner] || "Partner");
              setAppState("paired");
              setupPresenceTracking(userId, partner);
              setupMemoriesListener(userData.coupleId);
              return;
            }
          }
        }
      }
      setAppState("welcome");
    } catch (error) {
      console.error("Error checking existing couple:", error);
      setAppState("welcome");
    }
  };

  // Generate unique IDs
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const generateInviteCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Handle creating a new invite code
  const handleCreateCode = async () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!user) {
      setError("Please wait for app to load");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const code = generateInviteCode();
      const coupleId = generateId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create couple document
      await setDoc(doc(db, "couples", coupleId), {
        inviteCode: code,
        creatorId: user.uid,
        creatorName: userName,
        members: {
          [user.uid]: userName
        },
        memberCount: 1,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        active: true
      });

      // Create/update user document
      await setDoc(doc(db, "users", user.uid), {
        name: userName,
        coupleId: coupleId,
        role: "creator",
        joinedAt: serverTimestamp()
      });

      setInviteCode(code);
      setCoupleId(coupleId);
      setAppState("create");

      // Listen for partner joining
      setupCoupleListener(coupleId);
    } catch (err: any) {
      console.error("Error creating invite code:", err);
      setError("Failed to create invite code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle joining with invite code
  const handleJoinCode = async () => {
    if (inputCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!user) {
      setError("Please wait for app to load");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find couple by invite code
      const couplesQuery = query(
        collection(db, "couples"),
        where("inviteCode", "==", inputCode),
        where("active", "==", true)
      );

      const querySnapshot = await getDocs(couplesQuery);

      if (querySnapshot.empty) {
        setError("Invalid invite code. Please check and try again.");
        return;
      }

      const coupleDoc = querySnapshot.docs[0];
      const coupleData = coupleDoc.data();

      // Check if couple is full
      if (coupleData.memberCount >= 2) {
        setError("This couple is already full.");
        return;
      }

      // Check if code has expired
      if (coupleData.expiresAt.toDate() < new Date()) {
        setError("This invite code has expired.");
        return;
      }

      const coupleId = coupleDoc.id;

      // Update couple document with new member
      await setDoc(doc(db, "couples", coupleId), {
        ...coupleData,
        members: {
          ...coupleData.members,
          [user.uid]: userName
        },
        memberCount: 2,
        partnerId: user.uid,
        partnerName: userName,
        joinedAt: serverTimestamp()
      });

      // Create/update user document
      await setDoc(doc(db, "users", user.uid), {
        name: userName,
        coupleId: coupleId,
        role: "partner",
        joinedAt: serverTimestamp()
      });

      setCoupleId(coupleId);
      setPartnerId(coupleData.creatorId);
      setPartnerName(coupleData.creatorName);
      setAppState("paired");

      // Set up real-time listeners
      setupPresenceTracking(user.uid, coupleData.creatorId);
      setupMemoriesListener(coupleId);
    } catch (err: any) {
      console.error("Error joining:", err);
      setError(err.message || "Failed to join. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Listen for couple updates (when partner joins)
  const setupCoupleListener = (coupleId: string) => {
    if (coupleUnsubscribe.current) {
      coupleUnsubscribe.current();
    }

    coupleUnsubscribe.current = onSnapshot(
      doc(db, "couples", coupleId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.memberCount === 2 && data.partnerId) {
            setPartnerId(data.partnerId);
            setPartnerName(data.partnerName || "Partner");
            setAppState("paired");
            setupPresenceTracking(user!.uid, data.partnerId);
            setupMemoriesListener(coupleId);
          }
        }
      },
      (error) => {
        console.error("Error listening to couple:", error);
      }
    );
  };

  // Set up real-time presence tracking
  const setupPresenceTracking = (userId: string, partnerId: string) => {
    // Clean up previous listeners
    if (presenceUnsubscribe.current) {
      presenceUnsubscribe.current();
    }

    try {
      const userStatusRef = ref(rtdb, `status/${userId}`);
      const partnerStatusRef = ref(rtdb, `status/${partnerId}`);

      // Set user as online
      set(userStatusRef, {
        state: "online",
        last_changed: rtdbServerTimestamp()
      });

      // Set user as offline when disconnected
      onDisconnect(userStatusRef).set({
        state: "offline",
        last_changed: rtdbServerTimestamp()
      });

      // Listen for partner's status
      presenceUnsubscribe.current = onValue(partnerStatusRef, (snapshot) => {
        const status = snapshot.val();
        setPartnerStatus(status?.state || "offline");
      }, (error) => {
        console.error("Error listening to partner presence:", error);
        setPartnerStatus("offline");
      });

      // Listen for connection state
      const connectedRef = ref(rtdb, ".info/connected");
      onValue(connectedRef, (snapshot) => {
        setConnected(snapshot.val() === true);
      });
    } catch (error) {
      console.error("Error setting up presence:", error);
    }
  };

  // Set up memories listener
  const setupMemoriesListener = (coupleId: string) => {
    if (memoriesUnsubscribe.current) {
      memoriesUnsubscribe.current();
    }

    try {
      const memoriesQuery = query(
        collection(db, "couples", coupleId, "memories"),
        orderBy("timestamp", "desc")
      );

      memoriesUnsubscribe.current = onSnapshot(memoriesQuery, (snapshot) => {
        const memoriesData: Memory[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          memoriesData.push({
            id: doc.id,
            text: data.text,
            imageUrl: data.imageUrl,
            timestamp: data.timestamp,
            userId: data.userId,
            userName: data.userName
          });
        });
        setMemories(memoriesData);
      }, (error) => {
        console.error("Error listening to memories:", error);
        setError("Failed to load memories.");
      });
    } catch (error) {
      console.error("Error setting up memories listener:", error);
    }
  };

  // Handle adding a new memory
  const handleAddMemory = async () => {
    if (!newMemory.trim() || !user || !coupleId) return;

    setLoading(true);
    setError(null);

    try {
      const memoryData = {
        text: newMemory,
        userId: user.uid,
        userName: userName,
        timestamp: serverTimestamp(),
        imageUrl: imagePreview || null
      };

      await addDoc(collection(db, "couples", coupleId, "memories"), memoryData);

      setNewMemory("");
      setImagePreview(null);
    } catch (err) {
      console.error("Error adding memory:", err);
      setError("Failed to add memory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic file size check (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

    return date.toLocaleDateString();
  };

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      if (presenceUnsubscribe.current) {
        presenceUnsubscribe.current();
      }
      if (memoriesUnsubscribe.current) {
        memoriesUnsubscribe.current();
      }
      if (coupleUnsubscribe.current) {
        coupleUnsubscribe.current();
      }

      // Set user as offline
      if (user) {
        const userStatusRef = ref(rtdb, `status/${user.uid}`);
        set(userStatusRef, {
          state: "offline",
          last_changed: rtdbServerTimestamp()
        }).catch(console.error);
      }
    };
  }, [user]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (user) {
        const userStatusRef = ref(rtdb, `status/${user.uid}`);
        const state = document.hidden ? "offline" : "online";
        set(userStatusRef, {
          state,
          last_changed: rtdbServerTimestamp()
        }).catch(console.error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  if (appState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-pink-500 animate-pulse mx-auto mb-4" fill="currentColor" />
          <p className="text-pink-600">Loading your connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="text-pink-500" fill="currentColor" />
            <h1 className="text-2xl font-bold text-pink-600">CoupleConnect</h1>
          </div>
          <p className="text-sm text-pink-500">Share memories with your special someone</p>

          {/* Connection Status */}
          {appState === "paired" && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {connected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-gray-500">
                {connected ? "Connected" : "Offline"}
              </span>
            </div>
          )}
        </header>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <main>
          {appState === "welcome" && (
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome to CoupleConnect</CardTitle>
                <p className="text-muted-foreground">Connect with your partner securely</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Your Name</Label>
                  <Input
                    id="user-name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={30}
                    disabled={loading}
                  />
                </div>
                <Button 
                  className="w-full bg-pink-500 hover:bg-pink-600"
                  onClick={handleCreateCode}
                  disabled={loading || !userName.trim()}
                >
                  {loading ? "Creating..." : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Invite Code
                    </>
                  )}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setAppState("join")}
                  disabled={loading}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Join with Code
                </Button>
              </CardContent>
            </Card>
          )}

          {appState === "create" && (
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Your Invite Code</CardTitle>
                <p className="text-muted-foreground">Share this with your partner</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="bg-pink-100 rounded-xl p-6">
                    <div className="text-4xl font-bold tracking-widest text-pink-600">
                      {inviteCode}
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  This code will expire in 24 hours. Waiting for your partner to join...
                </p>
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setAppState("welcome");
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}

          {appState === "join" && (
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Join Your Partner</CardTitle>
                <p className="text-muted-foreground">Enter your name and the 6-digit invite code</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-name">Your Name</Label>
                  <Input
                    id="partner-name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={30}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value.replace(/\D/g, ''));
                      setError(null);
                    }}
                    className="text-center text-2xl tracking-widest"
                    placeholder="000000"
                    disabled={loading}
                  />
                </div>
                <Button 
                  className="w-full bg-pink-500 hover:bg-pink-600"
                  onClick={handleJoinCode}
                  disabled={loading || !userName.trim() || inputCode.length !== 6}
                >
                  {loading ? "Connecting..." : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Connect
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setAppState("welcome");
                    setError(null);
                    setInputCode("");
                  }}
                  disabled={loading}
                >
                  Back
                </Button>
              </CardContent>
            </Card>
          )}

          {appState === "paired" && (
            <div className="space-y-6">
              {/* Partner Status */}
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-pink-100 text-pink-600">
                          <Heart className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{partnerName}</p>
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${partnerStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm text-muted-foreground">
                            {partnerStatus === 'online' ? 'Online now' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Add Memory */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Memory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Share a special moment..."
                    value={newMemory}
                    onChange={(e) => setNewMemory(e.target.value)}
                    rows={3}
                    maxLength={500}
                    disabled={loading}
                  />
                  {imagePreview && (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="rounded-lg object-cover w-full h-40"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="absolute top-2 right-2 bg-white/80"
                        onClick={() => setImagePreview(null)}
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        asChild
                        disabled={loading}
                      >
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Add Photo
                        </span>
                      </Button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={loading}
                      />
                    </label>
                    <Button 
                      className="flex-1 bg-pink-500 hover:bg-pink-600"
                      onClick={handleAddMemory}
                      disabled={!newMemory.trim() || loading}
                    >
                      {loading ? "Sharing..." : "Share"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Memories List */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Shared Memories</h2>
                {memories.length === 0 ? (
                  <Card className="shadow">
                    <CardContent className="py-8 text-center">
                      <Heart className="mx-auto h-12 w-12 text-pink-300" />
                      <p className="mt-2 text-muted-foreground">
                        No memories yet. Share your first moment together!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  memories.map((memory) => (
                    <Card key={memory.id} className="shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium text-pink-600">
                            {memory.userName || (memory.userId === user?.uid ? "You" : partnerName)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(memory.timestamp)}
                          </span>
                        </div>
                        <p className="mb-3 whitespace-pre-wrap">{memory.text}</p>
                        {memory.imageUrl && (
                          <img 
                            src={memory.imageUrl} 
                            alt="Memory" 
                            className="rounded-lg object-cover w-full h-48 mb-3"
                            loading="lazy"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-muted-foreground">
          <p>Your memories are private and secure</p>
          <p className="mt-1">Connected with ❤️</p>
        </footer>
      </div>
    </div>
  );
}
