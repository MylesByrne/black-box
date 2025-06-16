import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFirestore } from '@/context/FirestoreContext';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const { getDocument } = useFirestore();
  const [totalStars, setTotalStars] = useState(0);

  // Fetch total stars from Firestore
  useEffect(() => {
    const fetchTotalStars = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDocument('Users', user.uid);
          if (userDoc && userDoc['total-stars'] !== undefined) {
            setTotalStars(userDoc['total-stars']);
          }
        } catch (error) {
          console.error('Error fetching total stars:', error);
        }
      }
    };

    fetchTotalStars();
  }, [user?.uid, getDocument]);

  return (
    <header className="fixed w-full bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-50">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-100 hover:text-gray-400">
              Black Box
            </Link>
          </div>
            <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-yellow-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-gray-200">{totalStars}</span>
            </div>
            <Link
              href="/settings"
              className="text-sm text-gray-300 hover:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-700"
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-300 hover:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-700"
            >
              Logout
            </button>

            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                {user?.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}