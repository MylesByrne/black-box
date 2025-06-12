import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import ProblemStars from '@/components/ProblemStars';

export default function ProblemDescriptionPanel({
  problem,
  userProblemData,
  submissions,
  timer,
  isTimerRed,
  formatTimer,
  isLoadingQuestions,
  showExplanationModal,
  showPassAnimation,
  showFailureAnimation,
  isReviewing,
  isRecording,
  recordingTime,
  formatRecordingTime,
  startRecording,
  stopRecording,
  showQuestionsModal,
  showQuestionsPassAnimation,
  showQuestionsFailAnimation,
  questionsAttempts,
  questions,
  selectedAnswers,
  handleAnswerSelect,
  submitQuestions
}) {
  const [leftActiveTab, setLeftActiveTab] = useState('description');

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg m-2 shadow-lg overflow-hidden relative">
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
      )}

      {/* Audio Explanation Modal */}
      {showExplanationModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur bg-black bg-opacity-10">
          <div className={`w-full max-w-md rounded-lg p-6 mx-4 ${showFailureAnimation ? 'animate-shake' : ''}`}>
            {showPassAnimation ? (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="animate-fade-in-up delay-100">
                    <svg className="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
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
      )}

      {/* Questions Modal */}
      {showQuestionsModal && (
        <div className="absolute inset-0 z-50 flex flex-col backdrop-blur bg-black bg-opacity-10">
          <div className={`flex-1 flex flex-col p-4 overflow-hidden ${showQuestionsFailAnimation ? 'animate-shake' : ''}`}>
            {showQuestionsPassAnimation ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="animate-fade-in-up delay-100">
                      <svg className="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : showQuestionsFailAnimation ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="animate-fade-in-up delay-100">
                      <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
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
      
      {/* Tabs */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 z-10 px-2">
        <div className="flex">
          <button
            onClick={() => setLeftActiveTab('description')}
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 relative ${
              leftActiveTab === 'description'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Description
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
          >
            Submissions
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
                  <ProblemStars userProblemData={userProblemData} />
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
  );
}