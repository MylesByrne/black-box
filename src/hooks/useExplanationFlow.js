'use client';
import { useState, useRef } from 'react';
import { useFirestore } from '@/context/FirestoreContext';
import { useAuth } from '@/context/AuthContext';
import { transcribeAudio } from '@/utils/openAI';

export function useExplanationFlow(problemId, userCode, problem, userProblemData, setUserProblemData, explanationAttempts, setExplanationAttempts) {
  const { getDocument, updateDocument } = useFirestore();
  const { user } = useAuth();

  // Audio recording states
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  
  // Animation states
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showFailureAnimation, setShowFailureAnimation] = useState(false);
  const [showPassAnimation, setShowPassAnimation] = useState(false);

  // Refs
  const mediaRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const formatRecordingTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const mp3Blob = new Blob(audioChunks, { type: 'audio/mp3' });
        setAudioBlob(mp3Blob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());

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
  };

  const closeExplanationModal = () => {
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

  const submitExplanation = async (audio, loadQuestions) => {
    setIsReviewing(true);
    
    const newAttemptCount = explanationAttempts + 1;
    setExplanationAttempts(newAttemptCount);
    
    try {
      const transcribedText = await transcribeAudio(audio);
      setExplanation(transcribedText);
      
      const res = await fetch('/api/openai/gradeExplination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: userCode.trim(),
          explanation: transcribedText
        })
      });

      const data = await res.json();
      console.log('OpenAI response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'API call failed');
      }

      if (data.grade === 'PASS') {
        setShowPassAnimation(true);
        setIsReviewing(false);
          
        setTimeout(async () => {
          setShowPassAnimation(false);
          closeExplanationModal();
          
          try {
            await loadQuestions(userCode, problem.title);
          } catch (error) {
            console.error('Error loading questions:', error);
            alert('Failed to load questions. Please try again.');
          }
        }, 3000);
        
        try {
          const userDoc = await getDocument('Users', user.uid);
          const currentProblemData = userDoc?.problemData?.[problemId] || {};
            
          const updatedProblemData = {
            ...currentProblemData,
            explanationGrade: 'PASS',
            explanationAttempts: newAttemptCount
          };
            
          await updateDocument('Users', user.uid, {
            problemData: {
              ...userDoc.problemData,
              [problemId]: updatedProblemData
            }
          });
          
          setUserProblemData(updatedProblemData);
          console.log('Explanation grade updated to PASS');
        } catch (updateError) {
          console.error('Error updating explanation grade:', updateError);
          alert('Explanation graded as PASS, but failed to save to database.');
        }
      } else {
        setShowFailureAnimation(true);
        
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
          
          setUserProblemData(updatedProblemData);
        } catch (updateError) {
          console.error('Error updating explanation attempts:', updateError);
        }
        
        setTimeout(() => {
          if (newAttemptCount >= 3) {
            closeExplanationModal();
          } else {
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

  return {
    // States
    showExplanationModal,
    setShowExplanationModal,
    isRecording,
    audioBlob,
    audioUrl,
    recordingTime,
    explanation,
    isReviewing,
    showSuccessAnimation,
    showFailureAnimation,
    showPassAnimation,
    
    // Functions
    formatRecordingTime,
    startRecording,
    stopRecording,
    closeExplanationModal,
    submitExplanation
  };
}