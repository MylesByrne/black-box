'use client';
import { createContext, useContext } from 'react';
import { 
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where 
} from 'firebase/firestore';
import { db } from '@/firebase/config';

const FirestoreContext = createContext({});

export const useFirestore = () => useContext(FirestoreContext);

export const FirestoreProvider = ({ children }) => {
  // Add a document to a collection
  const addDocument = async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      throw new Error(`Error adding document: ${error.message}`);
    }
  };
  // Set a document with a specific ID
  const setDocument = async (collectionName, id, data) => { 
    try {
      const docRef = await setDoc(doc(db, collectionName, id), data);
      return docRef.id;
    } catch (error) {
      throw new Error(`Error setting document: ${error.message}`);
    }
  };
  // Get a document by ID with optional subcollection
  const getDocument = async (collectionName, id, subcollection = null) => {
    try {
      console.log(`Attempting to fetch document: ${collectionName}/${id}${subcollection ? '/' + subcollection : ''}`);
      
      if (subcollection) {
        // Handle subcollection fetch
        const subcollectionRef = collection(db, collectionName, id, subcollection);
        const subcollectionSnap = await getDocs(subcollectionRef);
        
        if (!subcollectionSnap.empty) {
          const testCases = {};
          subcollectionSnap.forEach((doc) => {
            testCases[doc.id] = doc.data();
          });
          console.log('Subcollection data:', testCases);
          return testCases;
        }
        return null;
      } else {
        // Handle regular document fetch
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        
        console.log('Document exists:', docSnap.exists());
        if (docSnap.exists()) {
          console.log('Document data:', docSnap.data());
        }
        
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      }
    } catch (error) {
      console.error('Detailed Firestore error:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  // Get all documents in a collection
  const getCollection = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error getting collection: ${error.message}`);
    }
  };

  // Update a document
  const updateDocument = async (collectionName, id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  };

  // Delete a document
  const deleteDocument = async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  };

  // Query documents
  const queryDocuments = async (collectionName, field, operator, value) => {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error querying documents: ${error.message}`);
    }
  };

  return (
    <FirestoreContext.Provider value={{
      addDocument,
      getDocument,
      getCollection,
      updateDocument,
      deleteDocument,
      queryDocuments,
      setDocument
    }}>
      {children}
    </FirestoreContext.Provider>
  );
};