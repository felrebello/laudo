// Serviço para operações do Firestore
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Clinic, ClinicSpecialistPrice, ExamTypeMapping } from '../lib/firestore.types';

// Nomes das collections
const COLLECTIONS = {
  CLINICS: 'clinics',
  SPECIALIST_PRICES: 'clinic_specialist_prices',
  EXAM_MAPPINGS: 'exam_type_mappings',
};

// Converter timestamp do Firestore para Date
function convertTimestamp(data: DocumentData): any {
  const converted = { ...data };
  if (data.created_at instanceof Timestamp) {
    converted.created_at = data.created_at.toDate();
  }
  if (data.updated_at instanceof Timestamp) {
    converted.updated_at = data.updated_at.toDate();
  }
  return converted;
}

// Converter snapshot para objeto com ID
function snapshotToData<T>(snapshot: QueryDocumentSnapshot): T & { id: string } {
  return {
    id: snapshot.id,
    ...convertTimestamp(snapshot.data()),
  } as T & { id: string };
}

// ==================== CLÍNICAS ====================

export async function getAllClinics(): Promise<Clinic[]> {
  const q = query(collection(db, COLLECTIONS.CLINICS), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => snapshotToData<Clinic>(doc));
}

export async function getClinicById(id: string): Promise<Clinic | null> {
  const docRef = doc(db, COLLECTIONS.CLINICS, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return snapshotToData<Clinic>(docSnap as QueryDocumentSnapshot);
  }
  return null;
}

export async function createClinic(clinic: Omit<Clinic, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const now = new Date();
  const docRef = await addDoc(collection(db, COLLECTIONS.CLINICS), {
    ...clinic,
    created_at: now,
    updated_at: now,
  });
  return docRef.id;
}

export async function updateClinic(id: string, clinic: Partial<Clinic>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CLINICS, id);
  await updateDoc(docRef, {
    ...clinic,
    updated_at: new Date(),
  });
}

export async function deleteClinic(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CLINICS, id);
  await deleteDoc(docRef);
}

// ==================== PREÇOS DE ESPECIALISTAS ====================

export async function getAllSpecialistPrices(): Promise<ClinicSpecialistPrice[]> {
  const q = query(
    collection(db, COLLECTIONS.SPECIALIST_PRICES),
    orderBy('clinic_name'),
    orderBy('specialist_name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => snapshotToData<ClinicSpecialistPrice>(doc));
}

export async function getSpecialistPricesByClinic(clinicName: string): Promise<ClinicSpecialistPrice[]> {
  const q = query(
    collection(db, COLLECTIONS.SPECIALIST_PRICES),
    where('clinic_name', '==', clinicName),
    orderBy('specialist_name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => snapshotToData<ClinicSpecialistPrice>(doc));
}

export async function createSpecialistPrice(
  price: Omit<ClinicSpecialistPrice, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const now = new Date();
  const docRef = await addDoc(collection(db, COLLECTIONS.SPECIALIST_PRICES), {
    ...price,
    created_at: now,
    updated_at: now,
  });
  return docRef.id;
}

export async function updateSpecialistPrice(
  id: string,
  price: Partial<ClinicSpecialistPrice>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SPECIALIST_PRICES, id);
  await updateDoc(docRef, {
    ...price,
    updated_at: new Date(),
  });
}

export async function deleteSpecialistPrice(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SPECIALIST_PRICES, id);
  await deleteDoc(docRef);
}

// ==================== MAPEAMENTOS DE EXAMES ====================

export async function getAllExamMappings(): Promise<ExamTypeMapping[]> {
  const q = query(collection(db, COLLECTIONS.EXAM_MAPPINGS), orderBy('original_name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => snapshotToData<ExamTypeMapping>(doc));
}

export async function createExamMapping(
  mapping: Omit<ExamTypeMapping, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const now = new Date();
  const docRef = await addDoc(collection(db, COLLECTIONS.EXAM_MAPPINGS), {
    ...mapping,
    created_at: now,
    updated_at: now,
  });
  return docRef.id;
}

export async function createMultipleExamMappings(
  mappings: Omit<ExamTypeMapping, 'id' | 'created_at' | 'updated_at'>[]
): Promise<void> {
  const now = new Date();
  const promises = mappings.map(mapping =>
    addDoc(collection(db, COLLECTIONS.EXAM_MAPPINGS), {
      ...mapping,
      created_at: now,
      updated_at: now,
    })
  );
  await Promise.all(promises);
}

export async function deleteExamMapping(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EXAM_MAPPINGS, id);
  await deleteDoc(docRef);
}
