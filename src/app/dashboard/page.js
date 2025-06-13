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

// Mock data for question stars - replace with actual data from your context/database
const mockQuestionStars = {
  'Contains Duplicate': 3,
  'Valid Anagram': 2,
  'Two Sum': 3,
  'Group Anagrams': 1,
  'Top K Frequent Elements': 2,
  'Product of Array Except Self': 0,
  'Valid Sudoku': 1,
  'Encode and Decode Strings': 0,
  'Longest Consecutive Sequence': 0,
  'Valid Palindrome': 3,
  'Two Sum II - Input Array Sorted': 2,
  '3Sum': 1,
  'Container With Most Water': 2,
  'Trapping Rain Water': 0,
  'Valid Parentheses': 3,
  'Min Stack': 2,
  'Evaluate Reverse Polish Notation': 1,
  'Generate Parentheses': 0,
  'Daily Temperatures': 1,
  'Car Fleet': 0,
  'Largest Rectangle in Histogram': 0,
  'Best Time to Buy and Sell Stock': 3,
  'Longest Substring Without Repeating Characters': 2,
  'Longest Repeating Character Replacement': 1,
  'Permutation in String': 0,
  'Minimum Window Substring': 0,
  'Sliding Window Maximum': 0,
  'Binary Search': 3,
  'Search a 2D Matrix': 2,
  'Koko Eating Bananas': 1,
  'Search in Rotated Sorted Array': 0,
  'Find Minimum in Rotated Sorted Array': 1,
  'Time Based Key-Value Store': 0,
  'Median of Two Sorted Arrays': 0,
  'Reverse Linked List': 3,
  'Merge Two Sorted Lists': 2,
  'Reorder List': 1,
  'Remove Nth Node From End of List': 2,
  'Copy List with Random Pointer': 0,
  'Add Two Numbers': 1,
  'Linked List Cycle': 2,
  'Find the Duplicate Number': 0,
  'LRU Cache': 0,
  'Merge k Sorted Lists': 0,
  'Reverse Nodes in k-Group': 0
};

// Mock data for topics and questions
const topicsData = [
  { id: 't1', title: 'Arrays & Hashing', questions: ['Contains Duplicate', 'Valid Anagram', 'Two Sum', 'Group Anagrams', 'Top K Frequent Elements', 'Product of Array Except Self', 'Valid Sudoku', 'Encode and Decode Strings', 'Longest Consecutive Sequence'] },
  { id: 't2', title: 'Two Pointers', questions: ['Valid Palindrome', 'Two Sum II - Input Array Sorted', '3Sum', 'Container With Most Water', 'Trapping Rain Water'] },
  { id: 't3', title: 'Sliding Window', questions: ['Best Time to Buy and Sell Stock', 'Longest Substring Without Repeating Characters', 'Longest Repeating Character Replacement', 'Permutation in String', 'Minimum Window Substring', 'Sliding Window Maximum'] },
  { id: 't4', title: 'Stack', questions: ['Valid Parentheses', 'Min Stack', 'Evaluate Reverse Polish Notation', 'Generate Parentheses', 'Daily Temperatures', 'Car Fleet', 'Largest Rectangle in Histogram'] },
  { id: 't5', title: 'Binary Search', questions: ['Binary Search', 'Search a 2D Matrix', 'Koko Eating Bananas', 'Search in Rotated Sorted Array', 'Find Minimum in Rotated Sorted Array', 'Time Based Key-Value Store', 'Median of Two Sorted Arrays'] },
  { id: 't6', title: 'Linked List', questions: ['Reverse Linked List', 'Merge Two Sorted Lists', 'Reorder List', 'Remove Nth Node From End of List', 'Copy List with Random Pointer', 'Add Two Numbers', 'Linked List Cycle', 'Find the Duplicate Number', 'LRU Cache', 'Merge k Sorted Lists', 'Reverse Nodes in k-Group'] },
  { id: 't7', title: 'Trees', questions: ['Invert Binary Tree', 'Maximum Depth of Binary Tree', 'Diameter of Binary Tree', 'Balanced Binary Tree', 'Same Tree', 'Subtree of Another Tree', 'Lowest Common Ancestor of a BST', 'Binary Tree Level Order Traversal', 'Binary Tree Right Side View', 'Count Good Nodes in Binary Tree', 'Validate Binary Search Tree', 'Kth Smallest Element in a BST', 'Construct BT from Preorder and Inorder Traversal', 'Binary Tree Maximum Path Sum', 'Serialize and Deserialize Binary Tree'] },
  { id: 't8', title: 'Tries', questions: ['Implement Trie (Prefix Tree)', 'Design Add and Search Words Data Structure', 'Word Search II'] },
  { id: 't9', title: 'Heap / Priority Queue', questions: ['Kth Largest Element in a Stream', 'Last Stone Weight', 'K Closest Points to Origin', 'Kth Largest Element in an Array', 'Task Scheduler', 'Design Twitter', 'Find Median from Data Stream'] },
  { id: 't10', title: 'Backtracking', questions: ['Subsets', 'Combination Sum', 'Permutations', 'Subsets II', 'Combination Sum II', 'Word Search', 'Palindrome Partitioning', 'Letter Combinations of a Phone Number', 'N-Queens'] },
  { id: 't11', title: 'Graphs', questions: ['Number of Islands', 'Clone Graph', 'Max Area of Island', 'Pacific Atlantic Water Flow', 'Surrounded Regions', 'Rotting Oranges', 'Walls and Gates', 'Course Schedule', 'Course Schedule II', 'Redundant Connection', 'Number of Connected Components in an Undirected Graph', 'Graph Valid Tree', 'Word Ladder', 'Reconstruct Itinerary', 'Min Cost to Connect All Points', 'Network Delay Time', 'Cheapest Flights Within K Stops', 'Swim in Rising Water', 'Alien Dictionary'] },
  { id: 't12', title: 'Advanced Graphs', questions: ['Min Cost to Connect All Points', 'Network Delay Time', 'Cheapest Flights Within K Stops', 'Swim in Rising Water', 'Alien Dictionary'] },
  { id: 't13', title: '1-D Dynamic Programming', questions: ['Climbing Stairs', 'Min Cost Climbing Stairs', 'House Robber', 'House Robber II', 'Longest Palindromic Substring', 'Palindromic Substrings', 'Decode Ways', 'Coin Change', 'Maximum Product Subarray', 'Word Break', 'Longest Increasing Subsequence', 'Partition Equal Subset Sum'] },
  { id: 't14', title: '2-D Dynamic Programming', questions: ['Unique Paths', 'Longest Common Subsequence', 'Best Time to Buy and Sell Stock with Cooldown', 'Coin Change II', 'Target Sum', 'Interleaving String', 'Edit Distance', 'Burst Balloons', 'Distinct Subsequences', 'Regular Expression Matching'] },
  { id: 't15', title: 'Greedy', questions: ['Maximum Subarray', 'Jump Game', 'Jump Game II', 'Gas Station', 'Hand of Straights', 'Merge Triplets to Form Target Triplet', 'Partition Labels', 'Valid Parenthesis String'] },
  { id: 't16', title: 'Intervals', questions: ['Insert Interval', 'Merge Intervals', 'Non-overlapping Intervals', 'Meeting Rooms', 'Meeting Rooms II', 'Minimum Interval to Include Each Query'] },
  { id: 't17', title: 'Bit Manipulation', questions: ['Single Number', 'Number of 1 Bits', 'Counting Bits', 'Reverse Bits', 'Missing Number', 'Sum of Two Integers', 'Reverse Integer'] },
  { id: 't18', title: 'Math & Geometry', questions: ['Rotate Image', 'Spiral Matrix', 'Set Matrix Zeroes', 'Happy Number', 'Plus One', 'Pow(x, n)', 'Multiply Strings', 'Detect Squares'] }
];

// Tier-based structure with unlock requirements
const tiers = [
  {
    id: 1,
    title: 'Tier 1: Foundations',
    requiredStars: 0,
    topics: [topicsData.find(t => t.id === 't1')], // Arrays & Hashing
    color: 'bg-green-600',
    borderColor: 'border-green-500'
  },
  {
    id: 2,
    title: 'Tier 2: Basic Techniques',
    requiredStars: 15,
    topics: [
      topicsData.find(t => t.id === 't2'), // Two Pointers
      topicsData.find(t => t.id === 't4')  // Stack
    ],
    color: 'bg-blue-600',
    borderColor: 'border-blue-500'
  },
  {
    id: 3,
    title: 'Tier 3: Core Algorithms',
    requiredStars: 30,
    topics: [
      topicsData.find(t => t.id === 't5'), // Binary Search
      topicsData.find(t => t.id === 't3'), // Sliding Window
      topicsData.find(t => t.id === 't6')  // Linked List
    ],
    color: 'bg-purple-600',
    borderColor: 'border-purple-500'
  },
  {
    id: 4,
    title: 'Tier 4: Tree Structures',
    requiredStars: 50,
    topics: [topicsData.find(t => t.id === 't7')], // Trees
    color: 'bg-yellow-600',
    borderColor: 'border-yellow-500'
  },
  {
    id: 5,
    title: 'Tier 5: Advanced Data Structures',
    requiredStars: 70,
    topics: [
      topicsData.find(t => t.id === 't8'),  // Tries
      topicsData.find(t => t.id === 't10') // Backtracking
    ],
    color: 'bg-orange-600',
    borderColor: 'border-orange-500'
  },
  {
    id: 6,
    title: 'Tier 6: Complex Algorithms',
    requiredStars: 90,
    topics: [
      topicsData.find(t => t.id === 't9'),  // Heap/Priority Queue
      topicsData.find(t => t.id === 't11'), // Graphs
      topicsData.find(t => t.id === 't13') // 1-D DP
    ],
    color: 'bg-red-600',
    borderColor: 'border-red-500'
  },
  {
    id: 7,
    title: 'Tier 7: Optimization & Patterns',
    requiredStars: 120,
    topics: [
      topicsData.find(t => t.id === 't16'), // Intervals
      topicsData.find(t => t.id === 't15'), // Greedy
      topicsData.find(t => t.id === 't17') // Bit Manipulation
    ],
    color: 'bg-indigo-600',
    borderColor: 'border-indigo-500'
  },
  {
    id: 8,
    title: 'Tier 8: Mastery',
    requiredStars: 150,
    topics: [
      topicsData.find(t => t.id === 't12'), // Advanced Graphs
      topicsData.find(t => t.id === 't14'), // 2-D DP
      topicsData.find(t => t.id === 't18') // Math & Geometry
    ],
    color: 'bg-pink-600',
    borderColor: 'border-pink-500'
  }
].filter(tier => tier.topics.every(topic => topic)); // Ensure all topics are found

export default function Dashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const profileRef = useRef(null);

  // Mock user stars - replace with actual data from your context/database
  const [userTotalStars, setUserTotalStars] = useState(52); // Mock value for demonstration

  // Stats panel state
  const [starsTimeFrame, setStarsTimeFrame] = useState('week');
  const [submissionsTimeFrame, setSubmissionsTimeFrame] = useState('week');

  // Mock stats data
  const mockStats = {
    stars: {
      week: 8,
      month: 24,
      year: 52,
      all: 52
    },
    submissions: {
      week: 15,
      month: 67,
      year: 234,
      all: 234
    }
  };

  // Helper function to get star count for a question
  const getQuestionStars = (questionName) => {
    return mockQuestionStars[questionName] || 0;
  };

  // Helper function to render stars
  const renderStars = (count) => {
    const maxStars = 3;
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(maxStars)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${i < count ? 'text-yellow-400' : 'text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

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

  const isUnlocked = (requiredStars) => userTotalStars >= requiredStars;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="fixed w-full bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-100 hover:text-gray-400 transition-colors">
                Black Box
              </Link>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              {/* Stars Display */}
              <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1.5 rounded-md">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-200">{userTotalStars} Stars</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-300 hover:text-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-medium border border-gray-600 hover:bg-gray-600 transition-colors">
                  {user?.email?.[0].toUpperCase()}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50 border border-gray-600">
                    <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
                      Signed in as <br/><span className="font-medium text-gray-100">{user.email}</span>
                    </div>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors">Settings</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="pt-16 flex-grow flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Tiers: Vertical progression */}
            <div className="grid grid-cols-1 gap-6">
              {tiers.map((tier) => (
                <div 
                  key={tier.id} 
                  className={`relative rounded-xl p-6 border shadow-xl transition-all duration-300 ease-in-out ${
                    isUnlocked(tier.requiredStars) 
                      ? `bg-gray-800 ${tier.borderColor} hover:shadow-blue-500/20` 
                      : 'bg-gray-900 border-gray-600 opacity-60'
                  }`}
                >
                  {/* Tier Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${isUnlocked(tier.requiredStars) ? tier.color : 'bg-gray-600'}`}></div>
                      <h2 className={`text-2xl font-bold ${isUnlocked(tier.requiredStars) ? 'text-gray-100' : 'text-gray-500'}`}>
                        {tier.title}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isUnlocked(tier.requiredStars) && (
                        <>
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-500">Requires {tier.requiredStars} stars</span>
                        </>
                      )}
                      {isUnlocked(tier.requiredStars) && (
                        <span className="text-sm text-green-400 font-medium">Unlocked</span>
                      )}
                    </div>
                  </div>

                  {/* Topics within tier */}
                  <div className={`flex flex-wrap gap-4 ${!isUnlocked(tier.requiredStars) ? 'pointer-events-none' : ''}`}>
                    {tier.topics.map((topic) => (
                      <div 
                        key={topic.id} 
                        className={`rounded-lg p-4 border shadow-md transition-colors flex-1 min-w-[280px] ${
                          isUnlocked(tier.requiredStars)
                            ? 'bg-gray-750 border-gray-600 hover:border-blue-500 cursor-pointer'
                            : 'bg-gray-800 border-gray-700'
                        }`}
                      >
                        <h3 className={`text-xl font-medium mb-3 ${isUnlocked(tier.requiredStars) ? 'text-gray-200' : 'text-gray-500'}`}>
                          {topic.title}
                        </h3>
                        
                        <ul className="space-y-2">
                          {topic.questions.map((question, index) => {
                            const starCount = getQuestionStars(question);
                            return (
                              <li 
                                key={index} 
                                className={`flex items-center justify-between transition-all duration-200 ${
                                  isUnlocked(tier.requiredStars)
                                    ? 'text-gray-300 hover:text-blue-400 cursor-pointer group p-1.5 rounded-md hover:bg-gray-700'
                                    : 'text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center flex-1 min-w-0">
                                  <svg className={`w-3.5 h-3.5 mr-2 flex-shrink-0 transition-colors ${
                                    isUnlocked(tier.requiredStars) 
                                      ? 'text-blue-500 group-hover:text-blue-400' 
                                      : 'text-gray-600'
                                  }`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="truncate text-sm">{question}</span>
                                </div>
                                <div className="ml-2 flex-shrink-0">
                                  {renderStars(starCount)}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Stats Panel */}
        <div className="w-80 border-l border-gray-700 bg-gray-800 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-100 mb-6">Statistics</h2>
            
            {/* Stars Earned */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-200">Stars Earned</h3>
                <select 
                  value={starsTimeFrame} 
                  onChange={(e) => setStarsTimeFrame(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-3xl font-bold text-gray-100">{mockStats.stars[starsTimeFrame]}</span>
              </div>
            </div>

            {/* Submissions */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-200">Submissions</h3>
                <select 
                  value={submissionsTimeFrame} 
                  onChange={(e) => setSubmissionsTimeFrame(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span className="text-3xl font-bold text-gray-100">{mockStats.submissions[submissionsTimeFrame]}</span>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completion Rate</span>
                  <span className="text-gray-200 font-medium">68%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Streak</span>
                  <span className="text-gray-200 font-medium">5 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg. Stars/Problem</span>
                  <span className="text-gray-200 font-medium">2.1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Unlocked Tiers</span>
                  <span className="text-gray-200 font-medium">4/8</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Solved "Two Sum" - 3★</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-300">Attempted "3Sum" - 1★</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Solved "Valid Palindrome" - 3★</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Unlocked Tier 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}