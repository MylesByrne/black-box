'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFirestore } from '@/context/FirestoreContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for dashboard modules
const dashboardModules = [
  { id: 1, title: 'Total Progress', value: '68%', trend: 'up' },
  { id: 2, title: 'Completed Tasks', value: '24', trend: 'up' },
  { id: 3, title: 'Active Projects', value: '3', trend: 'neutral' },
  { id: 4, title: 'Time Spent', value: '12h', trend: 'down' },
];

// Mock data for graphs
const graphModules = [
  {
    id: 1,
    title: 'Weekly Activity',
    data: Array.from({ length: 7 }, (_, i) => ({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      value: Math.floor(Math.random() * 100)
    }))
  },
  {
    id: 2,
    title: 'Monthly Progress',
    data: Array.from({ length: 30 }, (_, i) => ({
      name: i + 1,
      value: Math.floor(Math.random() * 100)
    }))
  },
  {
    id: 3,
    title: 'Task Completion Rate',
    data: Array.from({ length: 12 }, (_, i) => ({
      name: i + 1,
      value: Math.floor(Math.random() * 100)
    }))
  },
  {
    id: 4,
    title: 'Performance Metrics',
    data: Array.from({ length: 7 }, (_, i) => ({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      value: Math.floor(Math.random() * 100)
    }))
  }
];

export default function Dashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProblemListOpen, setIsProblemListOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const { user, logout } = useAuth();
  const { getCollection } = useFirestore();
  const router = useRouter();
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const problemsData = await getCollection('Problems');
        setProblems(problemsData);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    fetchProblems();
  }, [getCollection]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed w-full bg-gray-50/80 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-800 hover:text-orange-700">
                Black Box
              </Link>
              
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-md hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700"
              >
                Continue
              </button>
              
              <button
                onClick={() => setIsProblemListOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Problem List
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {dashboardModules.map((module) => (
              <div
                key={module.id}
                className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-500">
                        {module.title}
                      </h3>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {module.value}
                      </p>
                    </div>
                    <div className="text-xl">
                      {module.trend === 'up' && <span className="text-green-500">↑</span>}
                      {module.trend === 'down' && <span className="text-red-500">↓</span>}
                      {module.trend === 'neutral' && <span className="text-gray-400">→</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Graphs Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {graphModules.map((graph) => (
              <div
                key={graph.id}
                className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200 p-4"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">{graph.title}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graph.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#f97316" 
                        fill="#fdba74" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Problem List Sliding Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isProblemListOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Problems</h2>
            <button
              onClick={() => setIsProblemListOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {problems.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/question/${problem.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-orange-500 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{problem.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {problem.description?.substring(0, 100)}...
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        problem.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-800'
                          : problem.difficulty === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}