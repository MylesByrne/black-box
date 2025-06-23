'use client';
import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/context/FirestoreContext';
import { useAuth } from '@/context/AuthContext';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { submitCode } from '@/utils/judge0';
import { transcribeAudio } from '@/utils/openAI';
import Header from '@/components/Header';
import ProblemDescriptionPanel from '@/components/ProblemDescriptionPanel';
import CodeEditorPanel from '@/components/CodeEditorPanel';
import { useProblem } from '@/hooks/useProblem';
import { useQuestions } from '@/hooks/useQuestions';

export default function ProblemPage() {
  const problemId = "house-robber-ii"; // Hardcoded
  
  // Use the custom hooks
  const {
    problem,
    loading,
    error,
    testCases,
    submissions,
    setSubmissions,
    userProblemData,
    setUserProblemData,
    explanationAttempts,
    setExplanationAttempts
  } = useProblem(problemId);

  const {
    questions,
    selectedAnswers,
    isLoadingQuestions,
    showQuestionsModal,
    loadQuestions,
    handleAnswerSelect,
    resetQuestions,
    closeQuestionsModal,
  } = useQuestions();

  const [userCode, setUserCode] = useState('');
  const [activeTab, setActiveTab] = useState('testcases'); 
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [timer, setTimer] = useState(0); 
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef(null);
  const timerRef = useRef(null);
  const { getDocument, addDocument, setDocument, updateDocument } = useFirestore();
  const { user } = useAuth();
  const [explanation, setExplanation] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showFailureAnimation, setShowFailureAnimation] = useState(false);
  const [isTimerRed, setIsTimerRed] = useState(false);
  const [isTimerFlashing, setIsTimerFlashing] = useState(false);
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
      // Get function name and test logic from problem data
      const functionName = problem.functionName;
      const testCall = `from typing import List

${code}
solution = Solution()
def check_solution():
  testCases = ${JSON.stringify(testCases)}
  
  for i in range(len(testCases)):
      testCase = testCases[i]
      nums = testCase.get("nums", [])
      expected = testCase.get("expected", 0)
      
      # Call the rob function with the array of house values
      result = solution.rob(nums)
      
      # Compare result with expected output
      if result == expected:
          continue
      else:
          print(f"Test case {i+1}: Failed")
          print(f"Input nums: {nums}")
          print(f"Expected: {expected}, Got: {result}")
          return
  print("SUBMISSION_RESULT: Accepted")
        
try:
    check_solution()
except Exception as e:
    print("Error:", e)`.trim();
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
      // Get function name and test logic from problem data
      const functionName = problem.functionName || 'twoSum';
      const testCall = `from typing import List

${code}
solution = Solution()
def check_solution():
  testCases = ${JSON.stringify(testCases)}
  
  for i in range(len(testCases)):
      testCase = testCases[i]
      nums = testCase.get("nums", [])
      expected = testCase.get("expected", 0)
      
      # Call the rob function with the array of house values
      result = solution.rob(nums)
      
      # Compare result with expected output
      if result == expected:
          continue
      else:
          print(f"Test case {i+1}: Failed")
          print(f"Input nums: {nums}")
          print(f"Expected: {expected}, Got: {result}")
          return
  print("SUBMISSION_RESULT: Accepted")
        
try:
    check_solution()
except Exception as e:
    print("Error:", e)`.trim();
      
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
          const currentProblemData = userDoc?.problemData?.[problemId] || {};
          
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
          
          // Check if this is the first time solving this problem
          const isFirstTimeSolving = submissionStatus === 'Accepted' && !currentProblemData.solved;
          
          // Prepare user document update
          const userUpdateData = {
            problemData: {
              ...userDoc.problemData,
              [problemId]: updatedProblemData
            }
          };
          
          // If first time solving, increment total-stars
          if (isFirstTimeSolving) {
            userUpdateData['total-stars'] = (userDoc['total-stars'] || 0) + 1;
          }
            
          // Update the user document with the new problem data and potentially total-stars
          await updateDocument('Users', user.uid, userUpdateData);
          
          // Update local state to reflect the changes
          setUserProblemData(updatedProblemData);
          
          console.log('Submission saved to Firestore');
          
        } catch (firestoreError) {
          console.error('Error saving submission to Firestore:', firestoreError);        }
      }        
      
      // Show explanation modal if accepted and user hasn't already passed explanation
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
          try {
            await loadQuestions(userCode, problem.title);
          } catch (error) {
            console.error('Error loading questions:', error);
            alert('Failed to load questions. Please try again.');
          }
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
          const currentProblemData = userDoc?.problemData?.[problemId] || {};
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
              [problemId]: updatedProblemData
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
      }      

      // Update only the explanationGrade field
      if (data.grade === 'PASS') {        
        // Show pass animation first
        setShowPassAnimation(true);
        setIsReviewing(false);
          
        // Auto-close explanation modal and load questions after animation
        setTimeout(async () => {
          setShowPassAnimation(false);
          closeExplanationModal();
          
          try {
            // Load questions using the custom hook
            await loadQuestions(userCode, problem.title);
          } catch (error) {
            console.error('Error loading questions:', error);
            alert('Failed to load questions. Please try again.');
          }
        }, 3000);
        
        try {
          // Get current user document
          const userDoc = await getDocument('Users', user.uid);
          const currentProblemData = userDoc?.problemData?.[problemId] || {};
          
          // Check if this is the first time passing explanation
          const isFirstTimePassingExplanation = currentProblemData.explanationGrade !== 'PASS';
            
          // Update only the explanationGrade field, preserving all other data
          const updatedProblemData = {
            ...currentProblemData,
            explanationGrade: 'PASS',
            explanationAttempts: newAttemptCount
          };
          
          // Prepare user document update
          const userUpdateData = {
            problemData: {
              ...userDoc.problemData,
              [problemId]: updatedProblemData
            }
          };
          
          // If first time passing explanation, increment total-stars
          if (isFirstTimePassingExplanation) {
            userUpdateData['total-stars'] = (userDoc['total-stars'] || 0) + 1;
          }
            
          await updateDocument('Users', user.uid, userUpdateData);
          
          // Update local state to reflect the changes
          setUserProblemData(updatedProblemData);
          
          console.log('Explanation grade updated to PASS');
        } catch (updateError) {
          console.error('Error updating explanation grade:', updateError);
          alert('Explanation graded as PASS, but failed to save to database.');
        }
      } else {
        // If explanation didn't pass, show failure animation
        setShowFailureAnimation(true);
        
        // Save attempt count to Firestore
        try {
          const userDoc = await getDocument('Users', user.uid);
          const currentProblemData = userDoc?.problemData?.[problemId] || {};
          
          const updatedProblemData = {
            ...currentProblemData,
            explanationAttempts: newAttemptCount
          };
          
          await updateDocument('Users', user.uid, {
            problemData: {
              ...userDoc.problemData,
              [problemId]: updatedProblemData
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
        
        setIsReviewing(false);      
      }
    } catch (err) {
      console.error('Error:', err);
      alert(`Error: ${err.message}`);
      setIsReviewing(false);
      closeExplanationModal();
    }
  };

  // Function to submit questions
  {/**/}const submitQuestions = async () => {
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
        closeQuestionsModal();
        
        try {
          // Update questionsGrade to PASS
          const userDoc = await getDocument('Users', user.uid);
          const currentProblemData = userDoc?.problemData?.[problemId] || {};
          
          // Check if this is the first time passing questions
          const isFirstTimePassingQuestions = currentProblemData.questionsGrade !== 'PASS';
          
          const updatedProblemData = {
            ...currentProblemData,
            questionsGrade: 'PASS'
          };

          // Prepare user document update
          const userUpdateData = {
            problemData: {
              ...userDoc.problemData,
              [problemId]: updatedProblemData
            }
          };
          
          // If first time passing questions, increment total-stars
          if (isFirstTimePassingQuestions) {
            userUpdateData['total-stars'] = (userDoc['total-stars'] || 0) + 1;
          }

          await updateDocument('Users', user.uid, userUpdateData);          
          
          // Update local state
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
          closeQuestionsModal();
          resetQuestions();
        } else {
          // Close the modal first, then regenerate questions
          closeQuestionsModal();
          
          // Give a small delay to ensure modal is closed
          setTimeout(async () => {
            try {
              await loadQuestions(userCode, problem.title);
            } catch (error) {
              console.error('Error regenerating questions:', error);
              alert('Failed to load new questions. Please try again.');
            }
          }, 100);
        }
      }, 1500);
    }
  };




  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <PanelGroup direction="horizontal">
          {/* Problem Description Panel */}          <Panel defaultSize={40} minSize={30}>
            <ProblemDescriptionPanel
              problem={problem}
              userProblemData={userProblemData}
              submissions={submissions}
              timer={timer}
              isTimerRed={isTimerRed}
              formatTimer={formatTimer}
              isLoadingQuestions={isLoadingQuestions}
              showExplanationModal={showExplanationModal}
              showPassAnimation={showPassAnimation}
              showFailureAnimation={showFailureAnimation}
              isReviewing={isReviewing}
              isRecording={isRecording}
              recordingTime={recordingTime}
              formatRecordingTime={formatRecordingTime}
              startRecording={startRecording}
              stopRecording={stopRecording}
              showQuestionsModal={showQuestionsModal}
              showQuestionsPassAnimation={showQuestionsPassAnimation}
              showQuestionsFailAnimation={showQuestionsFailAnimation}
              questionsAttempts={questionsAttempts}
              questions={questions}
              selectedAnswers={selectedAnswers}
              handleAnswerSelect={handleAnswerSelect}
              submitQuestions={submitQuestions}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-700/50 hover:bg-gray-600 transition-colors duration-200">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1 h-12 rounded-full bg-gray-600/80" />
            </div>
          </PanelResizeHandle>
      {/* Code Editor Panel */}          <Panel defaultSize={60} minSize={40}>
            <CodeEditorPanel
              isLocked={isLocked}
              setIsLocked={setIsLocked}
              isPanelVisible={isPanelVisible}
              setIsPanelVisible={setIsPanelVisible}
              userCode={userCode}
              setUserCode={setUserCode}
              showExplanationModal={showExplanationModal}
              showQuestionsModal={showQuestionsModal}
              problem={problem}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              testCases={testCases}
              isRunning={isRunning}
              output={output}
              handleRun={handleRun}
              handleSubmit={handleSubmit}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
