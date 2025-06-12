import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

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