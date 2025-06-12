import { useState, useEffect } from 'react';
import { useFirestore } from '@/context/FirestoreContext';
import { useAuth } from '@/context/AuthContext';

export const useProblem = (problemId) => {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [userProblemData, setUserProblemData] = useState(null);
  const [explanationAttempts, setExplanationAttempts] = useState(0);

  const { getDocument, updateDocument } = useFirestore();
  const { user } = useAuth();

  const fetchProblemAndTestCases = async () => {
    try {
      if (!problemId) {
        setError('No problem ID provided');
        setLoading(false);
        return;
      }

      // Fetch problem data
      const problemData = await getDocument('Problems', problemId);
      setProblem(problemData || null);
      
      if (!problemData) {
        setError('Problem not found in database');
        return;
      }

      const userDoc = await getDocument('Users', `${user.uid}`);
      
      if (!userDoc.problemData[problemId]) {
        // If user hasn't attempted this problem, create a new document
        await updateDocument(`Users`, `${user.uid}`, {
          problemData: {
            ...userDoc.problemData,
            [problemId]: {
              submissions: {},
              explanationGrade: null,
              questionsGrade: null,
            }
          }
        });
      } else {
        // Load existing submissions from Firestore
        const problemDataFromUser = userDoc.problemData[problemId];
        setUserProblemData(problemDataFromUser);
        
        // Load explanation attempts count
        setExplanationAttempts(problemDataFromUser.explanationAttempts || 0);
        
        if (problemDataFromUser.submissions) {
          // Convert submissions object to array and sort by timestamp (newest first)
          const submissionsArray = Object.entries(problemDataFromUser.submissions)
            .map(([timestamp, submission]) => ({
              ...submission,
              timestamp: submission.timestamp || new Date(parseInt(timestamp)).toISOString()
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setSubmissions(submissionsArray);
        }
      }

      // Fetch test cases
      const testCasesData = problemData.testCases;
      if (testCasesData) {
        const testCasesArray = Object.entries(testCasesData).map(([id, data]) => {
          const testCase = {
            id
          };
          
          // Helper function to convert nested maps to nested arrays
          const convertNestedMapsToArrays = (value) => {
            if (Array.isArray(value)) {
              // If it's already an array, recursively convert its elements
              return value.map(convertNestedMapsToArrays);
            } else if (typeof value === 'object' && value !== null) {
              // If it's an object, convert to array and recursively convert nested objects
              return Object.values(value).map(convertNestedMapsToArrays);
            } else {
              // For primitive values, return as is
              return value;
            }
          };
          
          // Handle expected field with different data structures
          if (data.expected !== undefined) {
            if (typeof data.expected === 'object' && data.expected !== null) {
              testCase.expected = convertNestedMapsToArrays(data.expected);
            } else {
              // For primitive values, assign directly
              testCase.expected = data.expected;
            }
          }
          
          // Dynamically assign values based on testCaseArgsJs
          if (problemData.testCaseArgsJs) {
            problemData.testCaseArgsJs.forEach(arg => {
              if (data[arg] !== undefined) {
                // Handle different data structures
                if (typeof data[arg] === 'object' && data[arg] !== null) {
                  testCase[arg] = convertNestedMapsToArrays(data[arg]);
                } else {
                  // For primitive values, assign directly
                  testCase[arg] = data[arg];
                }
              }
            });
          }
          
          return testCase;
        });
        setTestCases(testCasesArray);
      }
    } catch (error) {
      setError(`Error loading problem: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid && problemId) {
      fetchProblemAndTestCases();
    }
  }, [user?.uid, problemId]);

  return {
    problem,
    loading,
    error,
    testCases,
    submissions,
    setSubmissions,
    userProblemData,
    setUserProblemData,
    explanationAttempts,
    setExplanationAttempts,
    refetch: fetchProblemAndTestCases
  };
};