import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAA6Zm6_9iPp2QxwnQ8v9fKi8GGlhUv-dA",
  authDomain: "quanticalearning.firebaseapp.com",
  projectId: "quanticalearning",
  storageBucket: "quanticalearning.firebasestorage.app",
  messagingSenderId: "585277606664",
  appId: "1:585277606664:web:a651c6249390c68d553abd",
  measurementId: "G-SK7V5YMHPD",
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);

export async function enrollInBatch({
  userId,
  batch,
}: {
  userId: string;
  batch: { id: string; name: string; image?: string; byName?: string };
}) {
  await setDoc(
    doc(firebaseDb, "users", userId, "enrollments", batch.id),
    {
      batchId: batch.id,
      batchName: batch.name,
      batchImage: batch.image ?? "",
      byName: batch.byName ?? "",
      enrolledAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getEnrolledBatchIds(userId: string): Promise<string[]> {
  await firebaseAuth.authStateReady();
  const snapshot = await getDocs(collection(firebaseDb, "users", userId, "enrollments"));
  return snapshot.docs.map((item) => item.id);
}
