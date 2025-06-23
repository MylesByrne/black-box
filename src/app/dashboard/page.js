'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFirestore } from '@/context/FirestoreContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
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
  { id: 't11', title: 'Graphs', questions: ['Number of Islands', 'Clone Graph', 'Max Area of Island', 'Pacific Atlantic Water Flow', 'Surrounded Regions', 'Rotting Oranges', 'Walls and Gates', 'Course Schedule', 'Course Schedule II', 'Redundant Connection', 'Number of Connected Components in an Undirected Graph', 'Graph Valid Tree', 'Word Ladder'] },
  { id: 't12', title: 'Advanced Graphs', questions: ['Min Cost to Connect All Points', 'Network Delay Time', 'Cheapest Flights Within K Stops', 'Swim in Rising Water', 'Alien Dictionary', 'Reconstruct Itinerary'] },
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
    requiredStars: 10,
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
    requiredStars: 25,
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
    requiredStars: 55,
    topics: [topicsData.find(t => t.id === 't7')], // Trees
    color: 'bg-yellow-600',
    borderColor: 'border-yellow-500'
  },
  {
    id: 5,
    title: 'Tier 5: Advanced Data Structures',
    requiredStars: 80,
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
    requiredStars: 100,
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
    requiredStars: 175,
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
    requiredStars: 275,
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
  const { user } = useAuth();
  const { getDocument } = useFirestore();
  const router = useRouter();
  // State for real data
  const [userTotalStars, setUserTotalStars] = useState(0);
  const [firestoreQuestionStars, setFirestoreQuestionStars] = useState({});
  const [loadingStars, setLoadingStars] = useState(true);
  const [highestUnlockedTier, setHighestUnlockedTier] = useState(null);
  const tierRefs = useRef({});

  // Mapping of question names to problem IDs for tier 1 (Arrays & Hashing), tier 2 (Two Pointers), and Stack questions
  const questionToProblemId = {
    
// Advanced Graphs
'Min Cost to Connect All Points': 'min-cost-to-connect-all-points',
'Network Delay Time': 'network-delay-time',
'Cheapest Flights Within K Stops': 'cheapest-flights-within-k-stops',
'Swim in Rising Water': 'swim-in-rising-water',
'Alien Dictionary': 'alien-dictionary',
'Reconstruct Itinerary': 'reconstruct-itinerary',

// 2-D Dynamic Programming
'Unique Paths': 'unique-paths',
'Longest Common Subsequence': 'longest-common-subsequence',
'Best Time to Buy and Sell Stock with Cooldown': 'best-time-to-buy-and-sell-stock-with-cooldown',
'Coin Change II': 'coin-change-ii',
'Target Sum': 'target-sum',
'Interleaving String': 'interleaving-string',
'Edit Distance': 'edit-distance',
'Burst Balloons': 'burst-balloons',
'Distinct Subsequences': 'distinct-subsequences',
'Regular Expression Matching': 'regular-expression-matching',

// Math & Geometry
'Rotate Image': 'rotate-image',
'Spiral Matrix': 'spiral-matrix',
'Set Matrix Zeroes': 'set-matrix-zeroes',
'Happy Number': 'happy-number',
'Plus One': 'plus-one',
'Pow(x, n)': 'powx-n',
'Multiply Strings': 'multiply-strings',
'Detect Squares': 'detect-squares',
    // Tier 1: Arrays & Hashing
    'Contains Duplicate': 'contains-duplicate',
    'Valid Anagram': 'valid-anagram',
    'Two Sum': 'two-sum',
    'Group Anagrams': 'group-anagrams',
    'Top K Frequent Elements': 'top-k-frequent-elements',
    'Product of Array Except Self': 'product-of-array-except-self',
    'Valid Sudoku': 'valid-sudoku',
    'Encode and Decode Strings': 'encode-and-decode-strings',
    'Longest Consecutive Sequence': 'longest-consecutive-sequence',
    // Tier 2: Two Pointers
    'Valid Palindrome': 'valid-palindrome',
    'Two Sum II - Input Array Sorted': 'two-sum-ii',
    '3Sum': '3sum',
    'Container With Most Water': 'container-with-most-water',
    'Trapping Rain Water': 'trapping-rain-water',
    // Stack Questions
    'Valid Parentheses': 'valid-parentheses',
    'Min Stack': 'min-stack',
    'Evaluate Reverse Polish Notation': 'evaluate-reverse-polish-notation',
    'Generate Parentheses': 'generate-parentheses',
    'Daily Temperatures': 'daily-temperatures',
    'Car Fleet': 'car-fleet',
    'Largest Rectangle in Histogram': 'largest-rectangle-in-histogram',
    // Binary Search, Sliding Window, Linked List 
    'Binary Search': 'binary-search',
    'Search a 2D Matrix': 'search-a-2d-matrix',
    'Koko Eating Bananas': 'koko-eating-bananas',
    'Search in Rotated Sorted Array': 'search-in-rotated-sorted-array',
    'Find Minimum in Rotated Sorted Array': 'find-minimum-in-rotated-sorted-array',
    'Time Based Key-Value Store': 'time-based-key-value-store',
    'Median of Two Sorted Arrays': 'median-of-two-sorted-arrays',
    'Reverse Linked List': 'reverse-linked-list',
    'Merge Two Sorted Lists': 'merge-two-sorted-lists',
    'Reorder List': 'reorder-list',
    'Remove Nth Node From End of List': 'remove-nth-node-from-end-of-list',
    'Copy List with Random Pointer': 'copy-list-with-random-pointer',
    'Add Two Numbers': 'add-two-numbers',
    'Linked List Cycle': 'linked-list-cycle',
    'Find the Duplicate Number': 'find-the-duplicate-number',    'LRU Cache': 'lru-cache',
    'Merge k Sorted Lists': 'merge-k-sorted-lists',
    'Reverse Nodes in k-Group': 'reverse-nodes-in-k-group',
    //sliding window
    'Best Time to Buy and Sell Stock': 'best-time-to-buy-and-sell-stock',
    'Longest Substring Without Repeating Characters': 'longest-substring-without-repeating-characters',
    'Longest Repeating Character Replacement': 'longest-repeating-character-replacement',
    'Permutation in String': 'permutation-in-string',
    'Minimum Window Substring': 'minimum-window-substring',
    'Sliding Window Maximum': 'sliding-window-maximum',
    // Tier 4: Trees
    'Invert Binary Tree': 'invert-binary-tree',
    'Maximum Depth of Binary Tree': 'maximum-depth-of-binary-tree',
    'Diameter of Binary Tree': 'diameter-of-binary-tree',
    'Balanced Binary Tree': 'balanced-binary-tree',
    'Same Tree': 'same-tree',
    'Subtree of Another Tree': 'subtree-of-another-tree',
    'Lowest Common Ancestor of a BST': 'lowest-common-ancestor-of-a-bst',
    'Binary Tree Level Order Traversal': 'binary-tree-level-order-traversal',
    'Binary Tree Right Side View': 'binary-tree-right-side-view',
    'Count Good Nodes in Binary Tree': 'count-good-nodes-in-binary-tree',
    'Validate Binary Search Tree': 'validate-binary-search-tree',
    'Kth Smallest Element in a BST': 'kth-smallest-element-in-a-bst',
    'Construct BT from Preorder and Inorder Traversal': 'construct-bt-from-preorder-and-inorder-traversal',
    'Binary Tree Maximum Path Sum': 'binary-tree-maximum-path-sum',
    'Serialize and Deserialize Binary Tree': 'serialize-and-deserialize-binary-tree',
    // Tries
    'Implement Trie (Prefix Tree)': 'implement-trie-prefix-tree',
    'Design Add and Search Words Data Structure': 'design-add-and-search-words-data-structure',
    'Word Search II': 'word-search-ii',
    // Backtracking
    'Subsets': 'subsets',
    'Combination Sum': 'combination-sum',
    'Permutations': 'permutations',
    'Subsets II': 'subsets-ii',
    'Combination Sum II': 'combination-sum-ii',
    'Word Search': 'word-search',
    'Palindrome Partitioning': 'palindrome-partitioning',
    'Letter Combinations of a Phone Number': 'letter-combinations-of-a-phone-number',
    'N-Queens': 'n-queens',
    // Heap / Priority Queue
    'Kth Largest Element in a Stream': 'kth-largest-element-in-a-stream',
    'Last Stone Weight': 'last-stone-weight',
    'K Closest Points to Origin': 'k-closest-points-to-origin',
    'Kth Largest Element in an Array': 'kth-largest-element-in-an-array',
    'Task Scheduler': 'task-scheduler',
    'Design Twitter': 'design-twitter',
    'Find Median from Data Stream': 'find-median-from-data-stream',
    // Graphs
    'Number of Islands': 'number-of-islands',
    'Clone Graph': 'clone-graph',
    'Max Area of Island': 'max-area-of-island',
    'Pacific Atlantic Water Flow': 'pacific-atlantic-water-flow',
    'Surrounded Regions': 'surrounded-regions',
    'Rotting Oranges': 'rotting-oranges',
    'Walls and Gates': 'walls-and-gates',
    'Course Schedule': 'course-schedule',
    'Course Schedule II': 'course-schedule-ii',
    'Redundant Connection': 'redundant-connection',
    'Number of Connected Components in an Undirected Graph': 'number-of-connected-components-in-an-undirected-graph',
    'Graph Valid Tree': 'graph-valid-tree',
    'Word Ladder': 'word-ladder',
    // 1-D Dynamic Programming
    'Climbing Stairs': 'climbing-stairs',
    'Min Cost Climbing Stairs': 'min-cost-climbing-stairs',
    'House Robber': 'house-robber',
    'House Robber II': 'house-robber-ii',
    'Longest Palindromic Substring': 'longest-palindromic-substring',
    'Palindromic Substrings': 'palindromic-substrings',
    'Decode Ways': 'decode-ways',
    'Coin Change': 'coin-change',
    'Maximum Product Subarray': 'maximum-product-subarray',
    'Word Break': 'word-break',
    'Longest Increasing Subsequence': 'longest-increasing-subsequence',
    'Partition Equal Subset Sum': 'partition-equal-subset-sum',
    'Insert Interval': 'insert-interval',
'Merge Intervals': 'merge-intervals',
'Non-overlapping Intervals': 'non-overlapping-intervals',
'Meeting Rooms': 'meeting-rooms',
'Meeting Rooms II': 'meeting-rooms-ii',
'Minimum Interval to Include Each Query': 'minimum-interval-to-include-each-query',

// Greedy
'Maximum Subarray': 'maximum-subarray',
'Jump Game': 'jump-game',
'Jump Game II': 'jump-game-ii',
'Gas Station': 'gas-station',
'Hand of Straights': 'hand-of-straights',
'Merge Triplets to Form Target Triplet': 'merge-triplets-to-form-target-triplet',
'Partition Labels': 'partition-labels',
'Valid Parenthesis String': 'valid-parenthesis-string',

// Bit Manipulation
'Single Number': 'single-number',
'Number of 1 Bits': 'number-of-1-bits',
'Counting Bits': 'counting-bits',
'Reverse Bits': 'reverse-bits',
'Missing Number': 'missing-number',
'Sum of Two Integers': 'sum-of-two-integers',
'Reverse Integer': 'reverse-integer',
  };

  // Mapping of question names to their difficulties
  const questionDifficulties = {
    // Advanced Graphs
'Min Cost to Connect All Points': 'Medium',
'Network Delay Time': 'Medium',
'Cheapest Flights Within K Stops': 'Medium',
'Swim in Rising Water': 'Hard',
'Alien Dictionary': 'Hard',
'Reconstruct Itinerary': 'Hard',

// 2-D Dynamic Programming
'Unique Paths': 'Medium',
'Longest Common Subsequence': 'Medium',
'Best Time to Buy and Sell Stock with Cooldown': 'Medium',
'Coin Change II': 'Medium',
'Target Sum': 'Medium',
'Interleaving String': 'Medium',
'Edit Distance': 'Hard',
'Burst Balloons': 'Hard',
'Distinct Subsequences': 'Hard',
'Regular Expression Matching': 'Hard',

// Math & Geometry
'Rotate Image': 'Medium',
'Spiral Matrix': 'Medium',
'Set Matrix Zeroes': 'Medium',
'Happy Number': 'Easy',
'Plus One': 'Easy',
'Pow(x, n)': 'Medium',
'Multiply Strings': 'Medium',
'Detect Squares': 'Medium',
    // Intervals
'Insert Interval': 'Medium',
'Merge Intervals': 'Medium',
'Non-overlapping Intervals': 'Medium',
'Meeting Rooms': 'Easy',
'Meeting Rooms II': 'Medium',
'Minimum Interval to Include Each Query': 'Hard',

// Greedy
'Maximum Subarray': 'Easy',
'Jump Game': 'Medium',
'Jump Game II': 'Medium',
'Gas Station': 'Medium',
'Hand of Straights': 'Medium',
'Merge Triplets to Form Target Triplet': 'Medium',
'Partition Labels': 'Medium',
'Valid Parenthesis String': 'Medium',

// Bit Manipulation
'Single Number': 'Easy',
'Number of 1 Bits': 'Easy',
'Counting Bits': 'Easy',
'Reverse Bits': 'Easy',
'Missing Number': 'Easy',
'Sum of Two Integers': 'Medium',
'Reverse Integer': 'Medium',
    // Arrays & Hashing
    'Contains Duplicate': 'Easy',
    'Valid Anagram': 'Easy',
    'Two Sum': 'Easy',
    'Group Anagrams': 'Medium',
    'Top K Frequent Elements': 'Medium',
    'Product of Array Except Self': 'Medium',
    'Valid Sudoku': 'Medium',
    'Encode and Decode Strings': 'Medium',
    'Longest Consecutive Sequence': 'Medium',
    // Two Pointers
    'Valid Palindrome': 'Easy',
    'Two Sum II - Input Array Sorted': 'Medium',
    '3Sum': 'Medium',
    'Container With Most Water': 'Medium',
    'Trapping Rain Water': 'Hard',
    // Stack
    'Valid Parentheses': 'Easy',
    'Min Stack': 'Medium',
    'Evaluate Reverse Polish Notation': 'Medium',
    'Generate Parentheses': 'Medium',
    'Daily Temperatures': 'Medium',
    'Car Fleet': 'Medium',
    'Largest Rectangle in Histogram': 'Hard',
    // Sliding Window
    'Best Time to Buy and Sell Stock': 'Easy',
    'Longest Substring Without Repeating Characters': 'Medium',
    'Longest Repeating Character Replacement': 'Medium',
    'Permutation in String': 'Medium',
    'Minimum Window Substring': 'Hard',
    'Sliding Window Maximum': 'Hard',
    // Binary Search
    'Binary Search': 'Easy',
    'Search a 2D Matrix': 'Medium',
    'Koko Eating Bananas': 'Medium',
    'Search in Rotated Sorted Array': 'Medium',
    'Find Minimum in Rotated Sorted Array': 'Medium',
    'Time Based Key-Value Store': 'Medium',
    'Median of Two Sorted Arrays': 'Hard',
    // Linked List
    'Reverse Linked List': 'Easy',
    'Merge Two Sorted Lists': 'Easy',
    'Reorder List': 'Medium',
    'Remove Nth Node From End of List': 'Medium',
    'Copy List with Random Pointer': 'Medium',
    'Add Two Numbers': 'Medium',
    'Linked List Cycle': 'Easy',
    'Find the Duplicate Number': 'Medium',
    'LRU Cache': 'Medium',
    'Merge k Sorted Lists': 'Hard',
    'Reverse Nodes in k-Group': 'Hard',
    // Trees
    'Invert Binary Tree': 'Easy',
    'Maximum Depth of Binary Tree': 'Easy',
    'Diameter of Binary Tree': 'Easy',
    'Balanced Binary Tree': 'Easy',
    'Same Tree': 'Easy',
    'Subtree of Another Tree': 'Easy',
    'Lowest Common Ancestor of a BST': 'Medium',
    'Binary Tree Level Order Traversal': 'Medium',
    'Binary Tree Right Side View': 'Medium',
    'Count Good Nodes in Binary Tree': 'Medium',
    'Validate Binary Search Tree': 'Medium',
    'Kth Smallest Element in a BST': 'Medium',
    'Construct BT from Preorder and Inorder Traversal': 'Medium',
    'Binary Tree Maximum Path Sum': 'Hard',
    'Serialize and Deserialize Binary Tree': 'Hard',
    // Tries
    'Implement Trie (Prefix Tree)': 'Medium',
    'Design Add and Search Words Data Structure': 'Medium',
    'Word Search II': 'Hard',
    // Backtracking
    'Subsets': 'Medium',
    'Combination Sum': 'Medium',
    'Permutations': 'Medium',
    'Subsets II': 'Medium',
    'Combination Sum II': 'Medium',
    'Word Search': 'Medium',
    'Palindrome Partitioning': 'Medium',
    'Letter Combinations of a Phone Number': 'Medium',
    'N-Queens': 'Hard',
    // Heap / Priority Queue
    'Kth Largest Element in a Stream': 'Easy',
    'Last Stone Weight': 'Easy',
    'K Closest Points to Origin': 'Medium',
    'Kth Largest Element in an Array': 'Medium',
    'Task Scheduler': 'Medium',
    'Design Twitter': 'Medium',
    'Find Median from Data Stream': 'Hard',
    // Graphs
    'Number of Islands': 'Medium',
    'Clone Graph': 'Medium',
    'Max Area of Island': 'Medium',
    'Pacific Atlantic Water Flow': 'Medium',
    'Surrounded Regions': 'Medium',
    'Rotting Oranges': 'Medium',
    'Walls and Gates': 'Medium',
    'Course Schedule': 'Medium',
    'Course Schedule II': 'Medium',
    'Redundant Connection': 'Medium',
    'Number of Connected Components in an Undirected Graph': 'Medium',
    'Graph Valid Tree': 'Medium',
    'Word Ladder': 'Hard',
    // 1-D Dynamic Programming
    'Climbing Stairs': 'Easy',
    'Min Cost Climbing Stairs': 'Easy',
    'House Robber': 'Medium',
    'House Robber II': 'Medium',
    'Longest Palindromic Substring': 'Medium',
    'Palindromic Substrings': 'Medium',
    'Decode Ways': 'Medium',
    'Coin Change': 'Medium',
    'Maximum Product Subarray': 'Medium',
    'Word Break': 'Medium',
    'Longest Increasing Subsequence': 'Medium',
    'Partition Equal Subset Sum': 'Medium',
  };

  // Helper function to get difficulty badge style (darker theme)
  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-700 text-green-100 border border-green-600';
      case 'Medium':
        return 'bg-yellow-700 text-yellow-100 border border-yellow-600';
      case 'Hard':
        return 'bg-red-700 text-red-100 border border-red-600';
      default:
        return 'bg-gray-700 text-gray-100 border border-gray-600';
    }
  };

  // Helper function to convert question name to problem ID
  const getQuestionSlug = (questionName) => {
    // First check if we have a specific mapping
    if (questionToProblemId[questionName]) {
      return questionToProblemId[questionName];
    }
    
    // Otherwise, convert to slug format
    return questionName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
  };
  // Function to calculate stars based on problem data
  const calculateStars = (problemData) => {
    if (!problemData) return 0;
    
    let stars = 0;
    if (problemData.solved) stars = 1;
    if (problemData.explanationGrade && problemData.explanationGrade.toLowerCase() === 'pass') stars = 2;
    if (problemData.questionsGrade && problemData.questionsGrade.toLowerCase() === 'pass') stars = 3;
    
    return stars;
  };
  // Stats panel state
  const [starsTimeFrame, setStarsTimeFrame] = useState('week');
  const [submissionsTimeFrame, setSubmissionsTimeFrame] = useState('week');
  const [showStatsPanel, setShowStatsPanel] = useState(true);

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
  };  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        setLoadingStars(true);
        try {          // Fetch total stars
          const userDoc = await getDocument('Users', user.uid);
          if (userDoc && userDoc['total-stars'] !== undefined) {
            setUserTotalStars(userDoc['total-stars']);
          }
            // Fetch question data for all questions with Firestore mapping
          const questionStars = {};
          const allProblemData = userDoc.problemData;
          console.log('All problem data:', allProblemData);
          
          for (const [questionName, problemId] of Object.entries(questionToProblemId)) {
            const problemData = allProblemData?.[problemId];
            const stars = calculateStars(problemData);
            questionStars[questionName] = stars;
            console.log(`${questionName} (${problemId}): ${stars} stars`, problemData);
          }
          console.log('Final questionStars:', questionStars);
          setFirestoreQuestionStars(questionStars);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoadingStars(false);
        }
      }
    };

    fetchUserData();
  }, [user?.uid, getDocument]);  // Helper function to get star count for a question
  const getQuestionStars = (questionName) => {
    // For questions with Firestore mapping, use real data
    if (questionToProblemId[questionName]) {
      const stars = firestoreQuestionStars[questionName] || 0;
      console.log(`getQuestionStars for ${questionName}: ${stars} (Firestore)`);
      return stars;
    }
    // For other questions, use mock data
    const stars = mockQuestionStars[questionName] || 0;
    console.log(`getQuestionStars for ${questionName}: ${stars} (mock)`);
    return stars;
  };// Helper function to render stars
  const renderStars = (count, isLoading = false) => {
    console.log(`renderStars called with count: ${count}, isLoading: ${isLoading}`);
    const maxStars = 3;
    
    if (isLoading) {
      return (
        <div className="flex items-center space-x-0.5">
          {[...Array(maxStars)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gray-600 animate-pulse rounded-full"
            />
          ))}
        </div>
      );
    }
    
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

  const isUnlocked = (requiredStars) => userTotalStars >= requiredStars;

  // Add this useEffect to find the highest unlocked tier and scroll to it
  useEffect(() => {
    if (!loadingStars) {
      // Find the highest tier that's unlocked
      let highestTier = null;
      
      for (let i = tiers.length - 1; i >= 0; i--) {
        if (isUnlocked(tiers[i].requiredStars)) {
          highestTier = tiers[i].id;
          break;
        }
      }
      
      setHighestUnlockedTier(highestTier);
      
      // Scroll to the highest unlocked tier
      if (highestTier && tierRefs.current[highestTier]) {
        setTimeout(() => {
          tierRefs.current[highestTier].scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 500); // Short delay to ensure everything is rendered
      }
    }
  }, [loadingStars, userTotalStars]);

  if (!user) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />

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
                  ref={el => tierRefs.current[tier.id] = el}
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
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 002 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
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
                          <ul className="space-y-2">                          {topic.questions.map((question, index) => {
                            const starCount = getQuestionStars(question);
                            const isLoadingQuestion = loadingStars && questionToProblemId[question];
                            const questionSlug = getQuestionSlug(question);
                            const difficulty = questionDifficulties[question] || 'Easy';
                            return (                              <li key={index}>
                                {isUnlocked(tier.requiredStars) ? (
                                  <Link 
                                    href={`/question/${questionSlug}`}
                                    className="flex items-center justify-between transition-all duration-200 text-gray-300 hover:text-blue-400 cursor-pointer group p-1.5 rounded-md hover:bg-gray-700 block"
                                  >
                                    <div className="flex items-center flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="truncate text-sm">
                                          {question}
                                        </span>
                                        <span className={`text-xs rounded-full px-2 py-1 flex-shrink-0 ${getDifficultyStyle(difficulty)}`}>
                                          {difficulty}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0">
                                      {renderStars(starCount, isLoadingQuestion)}
                                    </div>
                                  </Link>
                                ) : (
                                  <div className="flex items-center justify-between transition-all duration-200 text-gray-600 cursor-not-allowed p-1.5 rounded-md">
                                    <div className="flex items-center flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="truncate text-sm">{question}</span>
                                        <span className={`text-xs rounded-full px-2 py-1 flex-shrink-0 ${getDifficultyStyle(difficulty)}`}>
                                          {difficulty}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0">
                                      {renderStars(starCount, isLoadingQuestion)}
                                    </div>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>              ))}
            </div>
          </div>
        </div>

        {/* Show Stats Button when panel is hidden */}
        {!showStatsPanel && (
          <div className="fixed top-20 right-4 z-10">
            <button
              onClick={() => setShowStatsPanel(true)}
              className="bg-gray-800 border border-gray-700 text-gray-200 p-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
              aria-label="Show statistics panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        )}

        {/* Right Stats Panel */}
        {showStatsPanel && (
          <div className="w-80 border-l border-gray-700 bg-gray-800 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-100">Statistics</h2>
                <button
                  onClick={() => setShowStatsPanel(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-gray-700"
                  aria-label="Close statistics panel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            
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
                  <span className="text-gray-300">Solved "Valid Palindrome" - 3★</span>                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Unlocked Tier 3</span>
                </div>
              </div>              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}