'use client';
import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/context/FirestoreContext';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from "@monaco-editor/react";
import { submitCode } from '@/utils/judge0';
import { transcribeAudio } from '@/utils/openAI';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';


export default function ProblemPage() {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [testCases, setTestCases] = useState([]);
  const [activeTab, setActiveTab] = useState('testcases'); 
  const [isPanelVisible, setIsPanelVisible] = useState(false);  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [timer, setTimer] = useState(0); 
  const [leftActiveTab, setLeftActiveTab] = useState('description');
  const [submissions, setSubmissions] = useState([]);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef(null);
  const timerRef = useRef(null);
  const profileRef = useRef(null);  const { getDocument, addDocument, setDocument, updateDocument } = useFirestore();  const { user, logout } = useAuth();  const [explanation, setExplanation] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [userProblemData, setUserProblemData] = useState(null);  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showFailureAnimation, setShowFailureAnimation] = useState(false);  const [explanationAttempts, setExplanationAttempts] = useState(0);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isTimerRed, setIsTimerRed] = useState(false);  const [isTimerFlashing, setIsTimerFlashing] = useState(false);
  const flashCountRef = useRef(0);

  // State for explanation pass animation
  const [showPassAnimation, setShowPassAnimation] = useState(false);
  
  // State for questions modal animations and attempts
  const [questionsAttempts, setQuestionsAttempts] = useState(0);
  const [showQuestionsPassAnimation, setShowQuestionsPassAnimation] = useState(false);
  const [showQuestionsFailAnimation, setShowQuestionsFailAnimation] = useState(false);

  const formatRecordingTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    theme: 'vs-dark',
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: true,
    occurrencesHighlight: true,
    cursorBlinking: 'blink',
    tabSize: 2,
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      alwaysConsumeMouseWheel: true  
    }
  };

  // Set timer based on difficulty when problem loads   
  useEffect(() => {
    if (problem && isLocked) {
      let minutes = 35;
      if (problem.difficulty === 'medium') minutes = 45;
      if (problem.difficulty === 'hard') minutes = 55;
      setTimer(minutes * 60);
    }
  }, [problem, isLocked]);

  // Countdown effect
  useEffect(() => {
    if (!isLocked && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev > 0 ? prev - 1 : 0);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isLocked, timer]);

  // Timer warning effect
  useEffect(() => {
    // Check if timer is below 10 minutes (600 seconds) and not already flashing
    if (timer <= 600 && timer > 0 && !isTimerFlashing && !isTimerRed) {
      setIsTimerFlashing(true);
      flashCountRef.current = 0;
      
      const flashTimer = () => {
        // Toggle red state
        setIsTimerRed(prev => !prev);
        flashCountRef.current += 1;
        
        // After 6 state changes (3 complete flashes), keep it red permanently
        if (flashCountRef.current >= 6) {
          setIsTimerRed(true);
          setIsTimerFlashing(false);
          return;
        }
        
        // Continue flashing
        setTimeout(flashTimer, 500);
      };
      
      // Start flashing sequence
      flashTimer();
    }
  }, [timer, isTimerFlashing]);

  // Format timer as MM:SS
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  // Function to render stars based on user progress
  const renderStars = () => {
    const stars = [];
    const isSolved = userProblemData?.solved || false;
    const hasPassedExplanation = userProblemData?.explanationGrade === 'PASS';
    const hasPassedQuestions = userProblemData?.questionsGrade === 'PASS';
    
    // Star 1: Problem solved
    stars.push(
      <svg 
        key="star1" 
        className={`w-5 h-5 ${isSolved ? 'text-yellow-400' : 'text-gray-400'}`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );

    // Star 2: Explanation passed
    stars.push(
      <svg 
        key="star2" 
        className={`w-5 h-5 ${hasPassedExplanation ? 'text-yellow-400' : 'text-gray-400'}`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );

    // Star 3: Questions passed
    stars.push(
      <svg 
        key="star3" 
        className={`w-5 h-5 ${hasPassedQuestions ? 'text-yellow-400' : 'text-gray-400'}`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );

    return (
      <div className="flex items-center space-x-1 ml-3">
        {stars}
      </div>
    );
  };



  useEffect(() => {
    const fetchProblemAndTestCases = async () => {
      try {
        // Fetch problem data
        const problemData = await getDocument('Problems', 'two-sum');
        setProblem(problemData || null);
        
        if (!problemData) {
          setError('Problem not found in database');
          return;
        }
        const userDoc = await getDocument('Users', `${user.uid}`);
        console.log(userDoc);
        if (!userDoc.problemData['two-sum']) {
          // If user hasn't attempted this problem, create a new document
          await updateDocument(`Users`, `${user.uid}`, {
            problemData: {
              'two-sum': {
                submissions: {},
                explanationGrade: null,
                questionsGrade: null,
              }
            }
          })        } else {
          // Load existing submissions from Firestore
          const problemData = userDoc.problemData['two-sum'];
          setUserProblemData(problemData); // Set the user problem data
          
          // Load explanation attempts count
          setExplanationAttempts(problemData.explanationAttempts || 0);
          
          if (problemData.submissions) {
            // Convert submissions object to array and sort by timestamp (newest first)
            const submissionsArray = Object.entries(problemData.submissions)
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
          // Convert the test cases object into an array
          const testCasesArray = Object.entries(testCasesData).map(([id, data]) => ({
            id,
            nums: Object.values(data.nums),
            target: data.target,
            expected: Object.values(data.expected)
          }));
          setTestCases(testCasesArray);
        }
      } catch (error) {
        setError(`Error loading problem: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemAndTestCases();
  }, [getDocument, user?.uid]);
  
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading problem...</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">{error || 'Problem not found'}</div>
      </div>
    );
  }
  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab('output');
    setIsPanelVisible(true)
    setOutput(null);
    const code = userCode.trim();
    try {
      const testCall = `
from typing import List

${code}
solution = Solution()
def check_solution():
  testCases = ${JSON.stringify(testCases)}
  
  for i in range(len(testCases)):
      testCase = testCases[i]
      result = solution.twoSum(testCase['nums'], testCase['target'])
      if result == testCase['expected']:
        continue
      else:
        print(f"Test case {i+1}: Failed | Input: nums={testCase['nums']}, target={testCase['target']} | Expected: {testCase['expected']}, Got: {result}")
        return
  print("SUBMISSION_RESULT: Accepted")
        

try:
    check_solution()
except Exception as e:
    print("Error:", e)
      `.trim();
      const response = await submitCode(testCall);
      setOutput(response);
      console.log('Judge0 response:', response);
    } catch (error) {
      setOutput({
        stderr: error.message,
        status: 'Error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!userCode.trim()) return;
    setIsRunning(true);
    setActiveTab('output');
    setIsPanelVisible(true);
    setOutput(null);

    const code = userCode.trim();
    try {
      const testCall = `
from typing import List

${code}
solution = Solution()
def check_solution():
  testCases = ${JSON.stringify(testCases)}
  passed = 0
  total = len(testCases)
  
  for i in range(len(testCases)):
      testCase = testCases[i]
      result = solution.twoSum(testCase['nums'], testCase['target'])
      if result == testCase['expected']:
        passed += 1
      else:
        print(f"Test case {i+1}: Failed | Input: nums={testCase['nums']}, target={testCase['target']} | Expected: {testCase['expected']}, Got: {result}")
  
  if passed == total:
    return True
  else:
    print(f"{passed}/{total} test cases passed")
    return False
        

try:
    result = check_solution();
    print("SUBMISSION_RESULT:", "Accepted" if result else "Wrong Answer")
except Exception as e:
    print("Error:", e)
    print("SUBMISSION_RESULT:", "Runtime Error")
      `.trim();
      
      const response = await submitCode(testCall);
      setOutput(response);

      // Parse submission result
      let submissionStatus = 'Runtime Error';
      let errorMessage = null;

      if (response.stdout) {
        if (response.stdout.includes('SUBMISSION_RESULT: Accepted')) {
          submissionStatus = 'Accepted';
        } else if (response.stdout.includes('SUBMISSION_RESULT: Wrong Answer')) {
          submissionStatus = 'Wrong Answer';
        }
      }

      if (response.stderr) {
        errorMessage = response.stderr;
      }

      // Add submission to submissions list
      const newSubmission = {
        status: submissionStatus,
        timestamp: new Date().toISOString(),
        runtime: response.time ? `${response.time}s` : null,
        memory: response.memory ? `${response.memory}KB` : null,
        error: errorMessage,
        code: code
      };

      setSubmissions(prev => [newSubmission, ...prev]);

      // Save submission to Firestore
      if (user?.uid) {
        try {
          // Get current user document
          const userDoc = await getDocument('Users', user.uid);
          
          // Check if problemData exists for this problem
          const currentProblemData = userDoc?.problemData?.['two-sum'] || {};
          
          // Update the problemData for this specific problem
          const updatedProblemData = {
            ...currentProblemData,
            totalAttempts: (currentProblemData.totalAttempts || 0) + 1,
            lastAttempt: new Date().toISOString(),
            solved: submissionStatus === 'Accepted' ? true : (currentProblemData.solved || false),
            submissions: {
              ...currentProblemData.submissions,
              [Date.now()]: newSubmission // Use timestamp as key
            }
          };
          
          // If first attempt, add firstAttempt timestamp
          if (!currentProblemData.firstAttempt) {
            updatedProblemData.firstAttempt = new Date().toISOString();
          }
          
          // Update best submission if this one is better
          if (submissionStatus === 'Accepted' && 
              (!currentProblemData.bestSubmission || 
               !currentProblemData.bestSubmission.runtime || 
               (response.time && parseFloat(response.time) < parseFloat(currentProblemData.bestSubmission.runtime.replace('s', ''))))) {
            updatedProblemData.bestSubmission = newSubmission;
          }
            // Update the user document with the new problem data
          await updateDocument('Users', user.uid, {
            problemData: {
              ...userDoc.problemData,
              'two-sum': updatedProblemData
            }
          });
          
          // Update local state to reflect the changes
          setUserProblemData(updatedProblemData);
          
          console.log('Submission saved to Firestore');
          
        } catch (firestoreError) {
          console.error('Error saving submission to Firestore:', firestoreError);        }
      }        // Show explanation modal if accepted and user hasn't already passed explanation
      if (submissionStatus === 'Accepted') {
        // Stop the timer when submission is accepted
        clearInterval(timerRef.current);
          // Show explanation modal if accepted and user hasn't already passed explanation
        // Check both the current userProblemData and the updatedProblemData
        const currentGrade = userProblemData?.explanationGrade;
        const hasPassedExplanation = currentGrade === 'PASS';
        const hasPassedQuestions = userProblemData?.questionsGrade === 'PASS';
        
        if (!hasPassedExplanation) {
          setShowExplanationModal(true);
        } else if (!hasPassedQuestions) {
          // If explanation is already passed but questions are not, go directly to questions
          await loadQuestions();
        }
      }

    } catch (error) {
      setOutput({
        stderr: error.message,
        status: 'Error'
      });
      const failedSubmission = {
        status: 'Runtime Error',
        timestamp: new Date().toISOString(),
        runtime: null,
        memory: null,
        error: error.message,
        code: code
      };
      setSubmissions(prev => [failedSubmission, ...prev]);
      // Save failed submission to Firestore
      if (user?.uid) {
        try {
          const userDoc = await getDocument('Users', user.uid);
          const currentProblemData = userDoc?.problemData?.['two-sum'] || {};
          const updatedProblemData = {
            ...currentProblemData,
            totalAttempts: (currentProblemData.totalAttempts || 0) + 1,
            lastAttempt: new Date().toISOString(),
            submissions: {
              ...currentProblemData.submissions,
              [Date.now()]: failedSubmission
            }
          };
          if (!currentProblemData.firstAttempt) {
            updatedProblemData.firstAttempt = new Date().toISOString();
          }
          await updateDocument('Users', user.uid, {
            problemData: {
              ...userDoc.problemData,
              'two-sum': updatedProblemData
            }
          });
        } catch (firestoreError) {
          console.error('Error saving failed submission to Firestore:', firestoreError);
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream, {
        mimeType: 'audio/webm' // Keep this for recording
      });
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Convert to MP3-compatible format for submission
        const mp3Blob = new Blob(audioChunks, { type: 'audio/mp3' });
        setAudioBlob(mp3Blob); // Still useful if needed elsewhere, or for retry logic
        
        // Create the URL for playback (though not directly used in UI anymore, might be useful for debugging/future)
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());

        // Automatically submit the explanation
        if (mp3Blob) {
          await submitExplanation(mp3Blob);
        }
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // Stop recording at 2 minutes (120 seconds)
          if (newTime >= 120) {
            stopRecording();
            return 120;
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };  const closeExplanationModal = () => {
    // Clean up the object URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setShowExplanationModal(false);
    setAudioBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsReviewing(false);
    setShowSuccessAnimation(false);
    setShowFailureAnimation(false);
    setShowPassAnimation(false);
    setExplanationAttempts(0);
    clearInterval(recordingTimerRef.current);
  };
  const submitExplanation = async (audio) => {
    setIsReviewing(true);
    
    // Increment attempt count
    const newAttemptCount = explanationAttempts + 1;
    setExplanationAttempts(newAttemptCount);
    
    try {
      // First transcribe the audio
      const transcribedText = await transcribeAudio(audio);
      setExplanation(transcribedText);
      
      // Then use the transcribed text for grading
      const res = await fetch('/api/openai/gradeExplination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: userCode.trim(),
          explanation: transcribedText // Use the transcribed text directly
        })
      });

      const data = await res.json();
      console.log('OpenAI response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'API call failed');
      }      // Update only the explanationGrade field
      if (data.grade === 'PASS') {        // Show pass animation first
        setShowPassAnimation(true);
        setIsReviewing(false);
          // Auto-close explanation modal and load questions after animation
        setTimeout(async () => {
          setShowPassAnimation(false);
          closeExplanationModal();
          
          try {
            // Load questions 
            await loadQuestions();
          } catch (error) {
            console.error('Error loading questions:', error);
            alert('Failed to load questions. Please try again.');
          }
        }, 3000);
        
        try {
          // Get current user document
          const userDoc = await getDocument('Users', user.uid);
          const currentProblemData = userDoc?.problemData?.['two-sum'] || {};
            // Update only the explanationGrade field, preserving all other data
          const updatedProblemData = {
            ...currentProblemData,
            explanationGrade: 'PASS',
            explanationAttempts: newAttemptCount
          };
            await updateDocument('Users', user.uid, {
            problemData: {
              ...userDoc.problemData,
              'two-sum': updatedProblemData
            }
          });
          
          // Update local state to reflect the changes
          setUserProblemData(updatedProblemData);
          
          console.log('Explanation grade updated to PASS');
        } catch (updateError) {
          console.error('Error updating explanation grade:', updateError);
          alert('Explanation graded as PASS, but failed to save to database.');
        }} else {
        // If explanation didn't pass, show failure animation
        setShowFailureAnimation(true);
        
        // Save attempt count to Firestore
        try {
          const userDoc = await getDocument('Users', user.uid);
          const currentProblemData = userDoc?.problemData?.['two-sum'] || {};
          
          const updatedProblemData = {
            ...currentProblemData,
            explanationAttempts: newAttemptCount
          };
          
          await updateDocument('Users', user.uid, {
            problemData: {
              ...userDoc.problemData,
              'two-sum': updatedProblemData
            }
          });
          
          // Update local state
          setUserProblemData(updatedProblemData);
        } catch (updateError) {
          console.error('Error updating explanation attempts:', updateError);
        }
        
        // Auto-close modal after animation (or reset for retry if under 3 attempts)
        setTimeout(() => {
          if (newAttemptCount >= 3) {
            closeExplanationModal();
          } else {
            // Reset for another attempt
            setShowFailureAnimation(false);
            setIsReviewing(false);
            setAudioBlob(null);
            if (audioUrl) {
              URL.revokeObjectURL(audioUrl);
              setAudioUrl(null);
            }
          }
        }, 3000);
        
        setIsReviewing(false);      }} catch (err) {
      console.error('Error:', err);
      alert(`Error: ${err.message}`);
      setIsReviewing(false);
      closeExplanationModal();
    }
  };

  // Function to load questions from the API
  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch('/api/openai/generateQuestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: userCode.trim(),
          problemTitle: 'Two Sum'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setQuestions(data.questions);
      setSelectedAnswers({});
      setShowQuestionsModal(true);
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Failed to load questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Function to handle answer selection
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };
  // Function to submit questions
  const submitQuestions = async () => {
    // Check if all questions are answered
    const allAnswered = questions.every((_, index) => selectedAnswers[index] !== undefined);
    
    if (!allAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Increment attempt count
    const newAttemptCount = questionsAttempts + 1;
    setQuestionsAttempts(newAttemptCount);

    // Check if all answers are correct
    const allCorrect = questions.every((question, index) => 
      selectedAnswers[index] === question.correctAnswer
    );

    if (allCorrect) {
      // Show pass animation first
      setShowQuestionsPassAnimation(true);
      
      // Auto-close questions modal after animation
      setTimeout(async () => {
        setShowQuestionsPassAnimation(false);
        setShowQuestionsModal(false);
        
        try {
          // Update questionsGrade to PASS
          const userDoc = await getDocument('Users', user.uid);
          const currentProblemData = userDoc?.problemData?.['two-sum'] || {};
          
          const updatedProblemData = {
            ...currentProblemData,
            questionsGrade: 'PASS'
          };

          await updateDocument('Users', user.uid, {
            problemData: {
              ...userDoc.problemData,
              'two-sum': updatedProblemData
            }
          });          // Update local state
          setUserProblemData(updatedProblemData);
          

          
        } catch (error) {
          console.error('Error updating questions grade:', error);
          alert('Questions completed successfully, but failed to save to database.');
        }
      }, 3000);
      
    } else {
      // Show fail animation
      setShowQuestionsFailAnimation(true);
      
      setTimeout(async () => {
        setShowQuestionsFailAnimation(false);
        
        if (newAttemptCount >= 2) {
          // Max attempts reached, close modal
          alert('Maximum attempts reached. Please try again later.');
          setShowQuestionsModal(false);
          setQuestionsAttempts(0);
          setQuestions([]);
          setSelectedAnswers({});
        } else {
          // Regenerate questions for another attempt
          try {
            await loadQuestions();
          } catch (error) {
            console.error('Error regenerating questions:', error);
            alert('Failed to load new questions. Please try again.');
          }
        }
      }, 1500);
    }
  };
  // Function to close questions modal
  const closeQuestionsModal = () => {
    setShowQuestionsModal(false);
    setQuestions([]);
    setSelectedAnswers({});
    setQuestionsAttempts(0);
    setShowQuestionsPassAnimation(false);
    setShowQuestionsFailAnimation(false);
  };



  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      {/* Header */}
      <header className="fixed w-full bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-50">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-100 hover:text-gray-400">
                Black Box
              </Link>
            </div>
            {/* Timer on the far right */}
            <div className="ml-auto flex items-center space-x-4">
              {/* Settings and Logout buttons */}
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

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <PanelGroup direction="horizontal">
          {/* Problem Description Panel */}          <Panel defaultSize={40} minSize={30}>            <div className="h-full flex flex-col bg-gray-900 rounded-lg m-2 shadow-lg overflow-hidden relative">
              
              {/* Questions Loading Overlay */}
              {isLoadingQuestions && (
                <div className="absolute inset-0 z-40 bg-gray-900 bg-opacity-90 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-100 text-center">
                      <p className="text-xl font-medium">Loading Questions...</p>
                      <p className="text-sm text-gray-400 mt-1">Generating personalized questions for your solution</p>
                    </div>
                  </div>
                </div>
              )}              {/* Audio Explanation Modal - overlay only over left panel */}
              {showExplanationModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur bg-black bg-opacity-10">
                  <div className={`w-full max-w-md rounded-lg p-6 mx-4 ${showFailureAnimation ? 'animate-shake' : ''}`}>
                    {showPassAnimation ? (                      // Pass Animation
                      <div className="text-center py-12">
                        <div className="relative">
                          {/* Gold Star */}
                          <div className="animate-fade-in-up delay-100">
                            <svg className="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>

                        </div>
                      </div>
                    ) : (
                      // Regular Modal Content
                      <>
                        <p className="text-white text-center mb-6">Give a brief explanation of your solution</p>
                        
                        {isReviewing ? (
                          <div className="text-center">
                            <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-white">Submitting and analyzing your explanation...</p>
                            <p className="text-gray-400 text-sm mt-1">Please wait a moment.</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <button
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center transition-colors ${isRecording ? 'bg-red-700 hover:bg-red-800 animate-pulse' : 'bg-red-500 hover:bg-red-600'}`}
                            >
                              {isRecording ? (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 6h12v12H6z" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                  <line x1="12" y1="19" x2="12" y2="23"></line>
                                  <line x1="8" y1="23" x2="16" y2="23"></line>
                                </svg>
                              )}
                            </button>
                            {isRecording ? (
                              <p className="text-red-400 text-sm">
                                Recording... ({formatRecordingTime(recordingTime)} / 02:00)
                              </p>
                            ) : (
                              <p className="text-gray-300 text-sm">Click icon to start recording</p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}              {/* Questions Modal - overlay only over left panel */}              {showQuestionsModal && (
                <div className="absolute inset-0 z-50 flex flex-col backdrop-blur bg-black bg-opacity-10">
                  <div className={`flex-1 flex flex-col p-4 overflow-hidden ${showQuestionsFailAnimation ? 'animate-shake' : ''}`}>
                    {showQuestionsPassAnimation ? (
                      // Pass Animation
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center py-12">
                          <div className="relative">
                            {/* Gold Star */}
                            <div className="animate-fade-in-up delay-100">
                              <svg className="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : showQuestionsFailAnimation ? (
                      // Fail Animation
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center py-12">
                          <div className="relative">
                            {/* Red X */}
                            <div className="animate-fade-in-up delay-100">
                              <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            {/* Fail Text */}
                            <div className="animate-fade-in-up delay-200 mt-4">
                              <p className="text-white text-lg font-medium">Some answers were incorrect</p>
                              <p className="text-gray-400 text-sm mt-1">
                                {questionsAttempts >= 2 ? 'Maximum attempts reached' : 'Generating new questions...'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Regular Modal Content
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center space-x-2">
                            <h2 className="text-white text-lg font-medium">Concept Questions</h2>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                              Attempt {questionsAttempts + 1} of 2
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <div className="space-y-4">
                            {questions.map((question, questionIndex) => (
                              <div key={questionIndex} className="p-3">
                                <h3 className="text-sm font-medium text-white mb-3">
                                  Question {questionIndex + 1}: {question.question}
                                </h3>
                                <div className="space-y-2">
                                  {question.options.map((option, optionIndex) => (
                                    <label
                                      key={optionIndex}
                                      className={`flex items-center p-2 rounded cursor-pointer transition-colors duration-200 ${
                                        selectedAnswers[questionIndex] === optionIndex
                                          ? 'bg-gray-400/30 text-gray-300'
                                          : 'text-white hover:bg-white/10'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${questionIndex}`}
                                        value={optionIndex}
                                        checked={selectedAnswers[questionIndex] === optionIndex}
                                        onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                                        className="sr-only"
                                      />
                                      <div className={`w-3 h-3 rounded-full border-2 mr-2 flex items-center justify-center ${
                                        selectedAnswers[questionIndex] === optionIndex
                                          ? 'border-gray-400 bg-gray-400'
                                          : 'border-gray-400'
                                      }`}>
                                        {selectedAnswers[questionIndex] === optionIndex && (
                                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        )}
                                      </div>
                                      <span className="text-xs">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-600">
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-400">
                              {Object.keys(selectedAnswers).length} of {questions.length} questions answered
                            </p>
                            <button
                              onClick={submitQuestions}
                              disabled={Object.keys(selectedAnswers).length !== questions.length}
                              className={`px-4 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                                Object.keys(selectedAnswers).length === questions.length
                                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              Submit Answers
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Tabs - Fixed at top */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 z-10 px-2">
                <div className="flex">
                  <button
                    onClick={() => setLeftActiveTab('description')}
                    className={`px-4 py-3 text-sm font-medium transition-colors duration-200 relative ${
                      leftActiveTab === 'description'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >                    Description
                    {leftActiveTab === 'description' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400 rounded-full"></span>
                    )}
                  </button>
                  <button
                    onClick={() => setLeftActiveTab('submissions')}
                    className={`px-4 py-3 text-sm font-medium transition-colors duration-200 relative ${
                      leftActiveTab === 'submissions'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >                    Submissions
                    {leftActiveTab === 'submissions' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400 rounded-full"></span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6">
                  {leftActiveTab === 'description' && (
                    <>
                      <h1 className="text-2xl font-bold text-white mb-4 flex justify-between items-center">
                        <div className="flex items-center">
                          {problem.title}              
                          {renderStars()}
                        </div>
                        <span 
                          className={`text-lg font-mono ml-auto px-3 py-1 rounded-md border transition-colors duration-200 ${
                            isTimerRed 
                              ? 'bg-red-900/30 text-red-300 border-red-500' 
                              : 'bg-gray-800 text-gray-300 border-gray-700'
                          }`}
                        >
                          {formatTimer(timer)}
                        </span>
                      </h1>
                      <div className="flex items-center space-x-4 mb-6">
                        <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                          problem.difficulty === 'easy' ? 'bg-green-900/40 text-green-300' :
                          problem.difficulty === 'medium' ? 'bg-yellow-900/40 text-yellow-300' :
                          'bg-red-900/40 text-red-300'
                        }`}>
                          {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                        </span>
                      </div>
                      <div className="prose prose-invert max-w-none mb-8 text-gray-200">
                        <div className="markdown-body bg-transparent">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, [rehypeHighlight, { theme: 'github-dark', ignoreMissing: true }]]}
                            components={{
                              code({node, inline, className, children, ...props}) {
                                // Extract language but don't use className directly on elements
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';
                                
                                return !inline && match ? (
                                  <div className="overflow-auto rounded-md border border-gray-700 bg-gray-900/50 my-4">
                                    <pre className="p-4 text-sm" {...props}>
                                      <code className={`language-${language}`}>
                                        {children}
                                      </code>
                                    </pre>
                                  </div>
                                ) : (
                                  <code className="rounded bg-gray-800 px-1.5 py-0.5 text-sm">
                                    {children}
                                  </code>
                                );
                              },
                              pre({children}) {
                                return children;
                              },
                              a({node, children, href, ...props}) {
                                return (
                                  <a href={href} className="text-blue-400 hover:text-blue-300 underline" {...props}>
                                    {children}
                                  </a>
                                );
                              },
                              table({children}) {
                                return (
                                  <div className="overflow-x-auto my-4">
                                    <table className="border-collapse w-full text-sm border border-gray-700">
                                      {children}
                                    </table>
                                  </div>
                                );
                              },
                              th({children}) {
                                return (
                                  <th className="border border-gray-700 bg-gray-800 px-4 py-2 text-left font-semibold">
                                    {children}
                                  </th>
                                );
                              },
                              td({children}) {
                                return (
                                  <td className="border border-gray-700 px-4 py-2">
                                    {children}
                                  </td>
                                );
                              }
                            }}
                          >
                            {problem.description}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </>
                  )}

                  {leftActiveTab === 'submissions' && (
                    <>
                      <h1 className="text-2xl font-bold text-white mb-6">Submissions</h1>
                      {submissions.length === 0 ? (
                        <div className="text-gray-400 text-center mt-8 bg-gray-800/50 p-8 rounded-xl">
                          <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p>No submissions yet</p>
                          <p className="text-sm text-gray-500 mt-2">Submit your solution to see it here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {submissions.map((submission, index) => (
                            <div
                              key={index}
                              className="p-5 bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  submission.status === 'Accepted' ? 'bg-green-900/60 text-green-300' :
                                  submission.status === 'Wrong Answer' ? 'bg-red-900/60 text-red-300' :
                                  'bg-yellow-900/60 text-yellow-300'
                                }`}>
                                  {submission.status}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {new Date(submission.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-gray-300 text-sm">
                                <div className="mb-1">
                                  <span className="text-gray-400">Runtime:</span> {submission.runtime || 'N/A'}
                                </div>
                                <div className="mb-2">
                                  <span className="text-gray-400">Memory:</span> {submission.memory || 'N/A'}
                                </div>
                                {submission.status !== 'Accepted' && submission.error && (
                                  <div className="mt-2 p-3 bg-red-900/20 rounded-lg text-red-300 text-xs font-mono">
                                    {submission.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>   
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-700/50 hover:bg-gray-600 transition-colors duration-200">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1 h-12 rounded-full bg-gray-600/80" />
            </div>
          </PanelResizeHandle>
      {/* Code Editor Panel */}          <Panel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col bg-gray-800 relative">
              {/* Existing lock overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-50 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                  <div className="text-2xl text-white mb-6 font-bold">Ready to start?</div>
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg transition"
                    onClick={() => setIsLocked(false)}
                  >
                    Start
                  </button>
                </div>
              )}
              
              <PanelGroup direction="vertical">
                {/* Code Editor Panel */}
                <Panel defaultSize={isPanelVisible ? 70 : 100} minSize={40}>
                  <div className="h-full flex flex-col bg-gray-800 border-l border-gray-700">
                    <div className="flex-1 p-4">
                      <div className="w-full h-full rounded-lg overflow-hidden">                        <Editor
                          height="100%"
                          defaultLanguage="python"
                          value={userCode}                          onChange={
                            isLocked || showExplanationModal || showQuestionsModal
                              ? undefined
                              : (value) => setUserCode(value)
                          }
                          theme="vs-dark"
                          options={{ ...editorOptions, readOnly: isLocked || showExplanationModal || showQuestionsModal }}
                          className="rounded-lg"
                          defaultValue={`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        `}
                        />
                      </div>
                    </div>
                  </div>
                </Panel>

                {/* Test Cases/Output Panel */}
                {isPanelVisible && (
                  <>
                    <PanelResizeHandle className="h-2 bg-gray-700/50 hover:bg-gray-600 transition-colors duration-150">
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="h-0.5 w-8 bg-gray-600" />
                      </div>
                    </PanelResizeHandle>                    <Panel defaultSize={30} minSize={20}>
                      <div className="h-full flex flex-col bg-gray-900 rounded-lg m-2 shadow-lg overflow-hidden">
                        {/* Tab Buttons */}
                        <div className="flex border-b border-gray-700">
                          <button
                            onClick={() => !isLocked && setActiveTab('testcases')}                            className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                              activeTab === 'testcases'
                                ? 'text-gray-400 border-b-2 border-gray-400'
                                : 'text-gray-400 hover:text-gray-300'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLocked}
                          >
                            Test Cases
                          </button>
                          <button
                            onClick={() => !isLocked && setActiveTab('output')}                            className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                              activeTab === 'output'
                                ? 'text-gray-400 border-b-2 border-gray-400'
                                : 'text-gray-400 hover:text-gray-300'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLocked}
                          >
                            Output
                          </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                          {isLocked ? (
                            <div className="text-gray-400 text-center mt-8">Unlock to view content</div>
                          ) : (
                            <>
                              {activeTab === 'testcases' && (
                                <div className="space-y-4">
                                  {testCases.slice(0,3).map((testCase) => (
                                    <div
                                      key={testCase.id}
                                      className="p-3 bg-gray-900 rounded-lg text-sm text-gray-300"
                                    >
                                      <div className="mb-1">
                                        <span className="text-gray-400">Input:</span> nums = [{testCase.nums.join(', ')}],
                                        target = {testCase.target}
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Expected:</span> [{testCase.expected.join(', ')}]
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {activeTab === 'output' && (
                                <div className="font-mono text-sm text-gray-300">
                                  {isRunning ? (
                                    <div className="text-gray-400">Running code...</div>
                                  ) : !output ? (
                                    <div className="text-gray-400">Run code to see output</div>
                                  ) : (
                                    <div className="space-y-4">
                                      {output.status.description && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-400">Status:</span>
                                          <span className={output.status.description === 'Accepted' ? 'text-green-400' : 'text-red-400'}>
                                            {output.status.description}
                                          </span>
                                        </div>
                                      )}
                                      {output.stdout && (
                                        <div>
                                          <div className="text-gray-400 mb-1">Output:</div>
                                          <pre className="whitespace-pre-wrap bg-gray-900 p-3 rounded-lg">
                                            {output.stdout}
                                          </pre>
                                        </div>
                                      )}
                                      {output.stderr && (
                                        <div>
                                          <div className="text-red-400 mb-1">Error:</div>
                                          <pre className="whitespace-pre-wrap bg-gray-900 p-3 rounded-lg text-red-400">
                                            {output.stderr}
                                          </pre>
                                        </div>
                                      )}
                                      {(output.time || output.memory) && (
                                        <div className="text-gray-400 text-xs">
                                          {output.time && <span>Time: {output.time}s </span>}
                                          {output.memory && <span>Memory: {output.memory}KB</span>}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Panel>
                  </>
                )}
              </PanelGroup>              {/* Controls Bar - Always visible at bottom */}
              <div className="bg-gray-900 rounded-lg m-2 shadow-lg border-t border-gray-700">
                <div className="flex items-center px-2 h-12">
                  {/* Toggle Button */}
                  <div className="flex items-center">
                    <button
                      onClick={() => !isLocked && setIsPanelVisible(!isPanelVisible)}
                      className={`p-2 text-gray-400 hover:text-gray-300 transition-colors duration-150 flex items-center gap-2 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isLocked}
                    >
                      {isPanelVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <span className="text-gray-400 text-sm">Console</span>
                  </div>

                  {/* Run/Submit Buttons */}
                  <div className="ml-auto flex space-x-2">                    <button
                      className="bg-transparent border border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white px-4 py-1.5 rounded transition-colors duration-150 font-semibold text-sm shadow-sm"
                      type="button"
                      onClick={isLocked ? undefined : handleRun}
                      disabled={isLocked || isRunning}
                    >
                      {isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-4 py-1.5 rounded transition-colors duration-150 font-semibold text-sm shadow-sm"
                      type="button"
                      disabled={isLocked}
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Panel>        </PanelGroup>
      </div>
    </div>
  )
}
