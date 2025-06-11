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

// Mock data for topics and questions (replaces graphModules)
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

// Mock data for 10 sub-panels, each with a selection of topics
const subPanels = [
  { id: 'sp1', title: 'Foundational Concepts', topics: [topicsData.find(t=>t.id==='t1'), topicsData.find(t=>t.id==='t2'), topicsData.find(t=>t.id==='t3')] },
  { id: 'sp2', title: 'Core Data Structures', topics: [topicsData.find(t=>t.id==='t4'), topicsData.find(t=>t.id==='t6'), topicsData.find(t=>t.id==='t7')] },
  { id: 'sp3', title: 'Advanced Data Structures', topics: [topicsData.find(t=>t.id==='t8'), topicsData.find(t=>t.id==='t9')] },
  { id: 'sp4', title: 'Essential Algorithms', topics: [topicsData.find(t=>t.id==='t5'), topicsData.find(t=>t.id==='t10')] },
  { id: 'sp5', title: 'Graph Algorithms', topics: [topicsData.find(t=>t.id==='t11'), topicsData.find(t=>t.id==='t12')] },
  { id: 'sp6', title: 'Dynamic Programming I', topics: [topicsData.find(t=>t.id==='t13')] },
  { id: 'sp7', title: 'Dynamic Programming II', topics: [topicsData.find(t=>t.id==='t14')] },
  { id: 'sp8', title: 'Problem Solving Strategies', topics: [topicsData.find(t=>t.id==='t15'), topicsData.find(t=>t.id==='t16')] },
  { id: 'sp9', title: 'Low-Level & Math', topics: [topicsData.find(t=>t.id==='t17'), topicsData.find(t=>t.id==='t18')] },
  { id: 'sp10', title: 'Mixed Review', topics: [topicsData.find(t=>t.id==='t1'), topicsData.find(t=>t.id==='t5'), topicsData.find(t=>t.id==='t13')] }
].filter(sp => sp.topics.every(topic => topic)); // Ensure all topics are found

export default function Dashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
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
      <div className="pt-16 flex-grow flex">
        <div className="w-[100%] p-4 overflow-y-auto">

          {/* Sub-panels: Tiered (single column) */}
          <div className="grid grid-cols-1 gap-4">
            {subPanels.map((panel) => (
              <div key={panel.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-xl hover:shadow-blue-500/20 transition-all duration-300 ease-in-out">
                
                {/* Topics within each sub-panel: Horizontal flex wrap */}
                <div className="flex flex-wrap gap-4">
                  {panel.topics.map((topic) => (
                    <div key={topic.id} className="bg-gray-750 rounded-lg p-3 border border-gray-600 shadow-md hover:border-blue-500 transition-colors flex-1 min-w-[280px]">
                      <h3 className="text-xl font-medium text-gray-200 mb-2">
                        {topic.title}
                      </h3>
                      
                      <ul className="space-y-1.5">
                        {topic.questions.map((question, index) => (
                          <li key={index} className="flex items-center text-gray-300 hover:text-blue-400 cursor-pointer group p-1.5 rounded-md hover:bg-gray-700 transition-all duration-200">
                            <svg className="w-3.5 h-3.5 mr-2 text-blue-500 group-hover:text-blue-400 flex-shrink-0 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate text-sm">{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}