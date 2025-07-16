import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  const hasApiKey = !!firebaseConfig.apiKey
  const hasAuthDomain = !!firebaseConfig.authDomain
  const hasProjectId = !!firebaseConfig.projectId
  const hasStorageBucket = !!firebaseConfig.storageBucket
  const hasMessagingSenderId = !!firebaseConfig.messagingSenderId
  const hasAppId = !!firebaseConfig.appId

  // Log detailed configuration status
  console.log("🔧 Firebase Configuration Check:")
  console.log(`  ✅ API Key: ${hasApiKey ? "Present" : "MISSING"}`)
  console.log(`  ✅ Auth Domain: ${hasAuthDomain ? "Present" : "MISSING"}`)
  console.log(`  ✅ Project ID: ${hasProjectId ? "Present" : "MISSING"}`)
  console.log(`  ✅ Storage Bucket: ${hasStorageBucket ? "Present" : "MISSING"}`)
  console.log(`  ✅ Messaging Sender ID: ${hasMessagingSenderId ? "Present" : "MISSING"}`)
  console.log(`  ✅ App ID: ${hasAppId ? "Present" : "MISSING"}`)

  const isConfigured = hasApiKey && hasAuthDomain && hasProjectId && hasStorageBucket && hasMessagingSenderId && hasAppId
  
  if (!isConfigured) {
    console.warn("❌ Firebase Configuration Issues:")
    if (!hasApiKey) console.warn("   - NEXT_PUBLIC_FIREBASE_API_KEY is missing or empty")
    if (!hasAuthDomain) console.warn("   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing or empty")
    if (!hasProjectId) console.warn("   - NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing or empty")
    if (!hasStorageBucket) console.warn("   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is missing or empty")
    if (!hasMessagingSenderId) console.warn("   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is missing or empty")
    if (!hasAppId) console.warn("   - NEXT_PUBLIC_FIREBASE_APP_ID is missing or empty")
  }

  return isConfigured
}

// Initialize Firebase only if properly configured
let app: any = null
let db: any = null

if (isFirebaseConfigured()) {
  try {
    console.log("🚀 Initializing Firebase...")
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getFirestore(app)
    console.log("✅ Firebase initialized successfully")
    console.log(`   📍 Project: ${firebaseConfig.projectId}`)
    console.log(`   🔗 Auth Domain: ${firebaseConfig.authDomain}`)
  } catch (error) {
    console.error("❌ Firebase initialization error:", error)
    console.error("   This could be due to:")
    console.error("   - Invalid configuration values")
    console.error("   - Network connectivity issues")
    console.error("   - Firebase project not properly set up")
    console.error("   - Firestore not enabled in your Firebase project")
  }
} else {
  console.warn("⚠️ Firebase not configured - using mock data")
  console.warn("   To fix this, set all required environment variables in .env.local")
}

export { db }
export default app

// Types for our data structures
export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  category: string
}

export interface Order {
  id: string
  trackingId: string
  items: OrderItem[]
  deliveryAddress: string
  totalPrice: number
  status: "En préparation" | "En cours de livraison" | "Livré" | "Annulé"
  estimatedTime?: string
  createdAt: Date
  updatedAt: Date
  customerName?: string
  customerPhone?: string
  customerNotes?: string
  deliveryFee?: number
  serviceFees?: number
}

export interface OrderCreate {
  items: OrderItem[]
  deliveryAddress: string
  totalPrice: number
  status?: Order["status"]
  customerName?: string
  customerPhone?: string
  customerNotes?: string
  deliveryFee?: number
  serviceFees?: number
}

// Utility function to ensure dates are properly converted
export const ensureDate = (date: any): Date => {
  if (date instanceof Date) {
    return date
  }
  if (typeof date === "string" || typeof date === "number") {
    return new Date(date)
  }
  if (date && typeof date.toDate === "function") {
    return date.toDate()
  }
  return new Date()
}

// Category helpers
export async function getCategories() {
  if (!db) return []
  const snapshot = await getDocs(query(collection(db, "categories"), orderBy("name")))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function addCategory({ name, slug }: { name: string; slug: string }) {
  if (!db) return null
  const docRef = await addDoc(collection(db, "categories"), { name, slug })
  return { id: docRef.id, name, slug }
}

export async function deleteCategory(id: string) {
  if (!db) return
  await deleteDoc(doc(db, "categories", id))
}

export async function updateCategory(id: string, data: { name?: string; slug?: string }) {
  if (!db) return
  await updateDoc(doc(db, "categories", id), data)
}

// Product helpers
export async function getProducts() {
  if (!db) return []
  const snapshot = await getDocs(collection(db, "products"))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function addProduct(product: any) {
  if (!db) return null
  const docRef = await addDoc(collection(db, "products"), product)
  return { id: docRef.id, ...product }
}

export async function deleteProduct(id: string) {
  if (!db) return
  await deleteDoc(doc(db, "products", id))
}

export async function updateProduct(id: string, data: any) {
  if (!db) return
  await updateDoc(doc(db, "products", id), data)
}

export async function getProductsByCategory(categoryId: string) {
  if (!db) return []
  const snapshot = await getDocs(query(collection(db, "products"), where("categoryId", "==", categoryId)))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
  status?: 'new' | 'promotion' | null
  discountPrice?: number
  isAvailable: boolean
}
