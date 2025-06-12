import { useState } from 'react';

export const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [questionsAttempts, setQuestionsAttempts] = useState(0);
  const [showQuestionsPassAnimation, setShowQuestionsPassAnimation] = useState(false);
  const [showQuestionsFailAnimation, setShowQuestionsFailAnimation] = useState(false);

  // Function to load questions from the API
  const loadQuestions = async (userCode, problemTitle) => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch('/api/openai/generateQuestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: userCode.trim(),
          problemTitle: problemTitle || 'Problem'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setQuestions(data.questions);
      setSelectedAnswers({});
      setShowQuestionsModal(true);
      return data.questions;
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
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

  // Function to reset questions state
  const resetQuestions = () => {
    setQuestions([]);
    setSelectedAnswers({});
    setShowQuestionsModal(false);
    setQuestionsAttempts(0);
    setShowQuestionsPassAnimation(false);
    setShowQuestionsFailAnimation(false);
  };

  // Function to close questions modal
  const closeQuestionsModal = () => {
    setShowQuestionsModal(false);
    setQuestions([]);
    setSelectedAnswers({});
    setShowQuestionsPassAnimation(false);
    setShowQuestionsFailAnimation(false);
  };

  return {
    // State
    questions,
    selectedAnswers,
    isLoadingQuestions,
    showQuestionsModal,
    questionsAttempts,
    showQuestionsPassAnimation,
    showQuestionsFailAnimation,
    
    // Actions
    loadQuestions,
    handleAnswerSelect,
    resetQuestions,
    closeQuestionsModal,
    
    // Setters (for external control if needed)
    setQuestions,
    setSelectedAnswers,
    setShowQuestionsModal,
    setQuestionsAttempts,
    setShowQuestionsPassAnimation,
    setShowQuestionsFailAnimation
  };
};