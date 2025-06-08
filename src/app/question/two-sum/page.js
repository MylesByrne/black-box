'use client';
import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/context/FirestoreContext';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from "@monaco-editor/react";
import { submitCode } from '@/utils/judge0';
import { collection } from '@firebase/firestore';

export default function ProblemPage() {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [testCases, setTestCases] = useState([]);
  const [activeTab, setActiveTab] = useState('testcases'); // Options: 'testcases', 'console'
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [timer, setTimer] = useState(0); // seconds remaining
  const timerRef = useRef(null);
  const profileRef = useRef(null);
  const { getDocument, addDocument } = useFirestore();
  const { user, logout } = useAuth();

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

  // Format timer as MM:SS
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  }, [getDocument]);
  
  
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
{/* remove repetitive work have it so that the test cases/user code are only submitted once instead of being submitted for every test case */}
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
  print("All test cases passed!")
        

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

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      {/* Header */}
      <header className="fixed w-full bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-50">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-100 hover:text-orange-400">
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
          {/* Problem Description Panel */}
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col bg-gray-800 border-r border-gray-700">
              {/* Tabs - Fixed at top */}
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 z-10">
                <div className="flex">
                </div>
              </div>
                      <div className="flex-1 overflow-y-auto">
                      <div className="p-6">
                        { (
                        <>
                          <h1 className="text-2xl font-bold text-gray-100 mb-4 flex justify-between items-center">
                          {problem.title}              
                          <span className="text-gray-400 text-lg font-mono ml-auto">
                            {formatTimer(timer)}
                          </span>
                          </h1>
                          <div className="flex items-center space-x-4 mb-4">
                          </div>
                          <div className="prose max-w-none mb-8 text-gray-300">
                          <p className="whitespace-pre-wrap">
                            {problem.description}
                          </p>
                          </div>
                        </>
                        ) }
                      </div>
                      </div>
                    </div>
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-gray-700 hover:bg-gray-600 transition-colors duration-150">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-0.5 h-8 bg-gray-600" />
                    </div>
                    </PanelResizeHandle>
      {/* Code Editor Panel */}
          <Panel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col bg-gray-800 relative">
              {/* Overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-50 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                  <div className="text-2xl text-white mb-6 font-bold">Ready to start?</div>
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg transition"
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
                      <div className="w-full h-full rounded-lg overflow-hidden">
                        <Editor
                          height="100%"
                          defaultLanguage="python"
                          value={userCode}
                          onChange={isLocked ? undefined : (value) => setUserCode(value)}
                          theme="vs-dark"
                          options={{ ...editorOptions, readOnly: isLocked }}
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
                    <PanelResizeHandle className="h-2 bg-gray-700 hover:bg-gray-600 transition-colors duration-150">
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="h-0.5 w-8 bg-gray-600" />
                      </div>
                    </PanelResizeHandle>

                    <Panel defaultSize={30} minSize={20}>
                      <div className="h-full flex flex-col bg-gray-800">
                        {/* Tab Buttons */}
                        <div className="flex border-b border-gray-700">
                          <button
                            onClick={() => !isLocked && setActiveTab('testcases')}
                            className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                              activeTab === 'testcases'
                                ? 'text-orange-400 border-b-2 border-orange-400'
                                : 'text-gray-400 hover:text-orange-300'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLocked}
                          >
                            Test Cases
                          </button>
                          <button
                            onClick={() => !isLocked && setActiveTab('output')}
                            className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                              activeTab === 'output'
                                ? 'text-orange-400 border-b-2 border-orange-400'
                                : 'text-gray-400 hover:text-orange-300'
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
              </PanelGroup>

              {/* Controls Bar - Always visible at bottom */}
              <div className="bg-gray-800 border-t border-gray-700">
                <div className="flex items-center px-2 h-12">
                  {/* Toggle Button */}
                  <div className="flex items-center">
                    <button
                      onClick={() => !isLocked && setIsPanelVisible(!isPanelVisible)}
                      className={`p-2 text-gray-400 hover:text-orange-400 transition-colors duration-150 flex items-center gap-2 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <div className="ml-auto flex space-x-2">
                    <button
                      className="bg-transparent border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-4 py-1.5 rounded transition-colors duration-150 font-semibold text-sm shadow-sm"
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
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}