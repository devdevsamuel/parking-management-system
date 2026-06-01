import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { FIREBASE_COLLECTIONS } from '@/config/constants'
import type { AppUser } from '@/types/user'

export async function signIn(email: string, password: string): Promise<void> {
  console.log('Attempting to sign in with email:', email)
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export function onAuthChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

export async function loadUserRole(uid: string): Promise<AppUser | null> {
  const userSnap = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, uid))

  if (!userSnap.exists()) return null

  const data = userSnap.data() as Omit<AppUser, 'uid'>

  if (!data.isActive) return null

  return { uid, ...data }
}
