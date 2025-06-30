import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from "@monaco-editor/react";

export default function CodeEditorPanel({
  isLocked,
  setIsLocked,
  isPanelVisible,
  setIsPanelVisible,
  userCode,
  setUserCode,
  showExplanationModal,
  showQuestionsModal,
  problem,
  activeTab,
  setActiveTab,
  testCases,
  isRunning,
  output,
  handleRun,
  handleSubmit
}) {
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

  // Reset code to original template
  const handleResetCode = () => {
    const defaultCode = problem.codeTemplate || `class Solution:
    def hasDuplicate(self, nums: List[int]) -> bool:
        `;
    setUserCode(defaultCode);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 relative">
      {/* Lock overlay */}
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
            <div className="flex-1 p-4 relative">
              {/* Reset Button - Top Right of Editor */}
              <button
                onClick={handleResetCode}
                disabled={isLocked || showExplanationModal || showQuestionsModal}
                className={`absolute top-6 right-6 z-10 p-2 rounded-md transition-all duration-200 ${
                  isLocked || showExplanationModal || showQuestionsModal
                    ? 'opacity-30 cursor-not-allowed text-gray-500' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
                title="Reset code to original template"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </button>
              
              <div className="w-full h-full rounded-lg overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  value={userCode}
                  onChange={
                    isLocked || showExplanationModal || showQuestionsModal
                      ? undefined
                      : (value) => setUserCode(value)
                  }
                  theme="vs-dark"
                  options={{ ...editorOptions, readOnly: isLocked || showExplanationModal || showQuestionsModal }}
                  className="rounded-lg"
                  defaultValue={problem.codeTemplate || `class Solution:
    def hasDuplicate(self, nums: List[int]) -> bool:
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
            </PanelResizeHandle>
            
            <Panel defaultSize={30} minSize={20}>
              <div className="h-full flex flex-col bg-gray-900 rounded-lg m-2 shadow-lg overflow-hidden">
                {/* Tab Buttons */}
                <div className="flex border-b border-gray-700">
                  <button
                    onClick={() => !isLocked && setActiveTab('testcases')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                      activeTab === 'testcases'
                        ? 'text-gray-400 border-b-2 border-gray-400'
                        : 'text-gray-400 hover:text-gray-300'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLocked}
                  >
                    Test Cases
                  </button>
                  <button
                    onClick={() => !isLocked && setActiveTab('output')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
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
                                                <span className="text-gray-400">Input: </span> 
                                                {problem.testCaseArgsJs.map((arg, index) => {
                                                  let displayValue;
                                                  const value = testCase[arg];
                                                  
                                                  // Helper function to format nested arrays
                                                  const formatNestedArray = (arr) => {
                                                    if (!Array.isArray(arr)) {
                                                      if (typeof arr === 'string') {
                                                        return `"${arr}"`;
                                                      } else if (typeof arr === 'boolean') {
                                                        return arr.toString();
                                                      }
                                                      return arr;
                                                    }
                                                
                                                    return `[${arr.map(item => {
                                                      if (Array.isArray(item)) {
                                                        return formatNestedArray(item);
                                                      } else if (typeof item === 'string') {
                                                        return `"${item}"`;
                                                      } else if (typeof item === 'boolean') {
                                                        return item.toString();
                                                      }
                                                      return item;
                                                    }).join(', ')}]`;
                                                  };
                                                
                                                  if (Array.isArray(value)) {
                                                    displayValue = formatNestedArray(value);
                                                  } else if (typeof value === 'boolean') {
                                                    displayValue = value.toString();
                                                  } else if (typeof value === 'string') {
                                                    displayValue = `"${value}"`;
                                                  } else {
                                                    displayValue = JSON.stringify(value);
                                                  }

                                                  return (
                                                    <span key={index}>
                                                      {index > 0 && ', '}
                                                      {arg} = {displayValue}
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                              <div>
                                                <span className="text-gray-400">Expected:</span> {
                                                  (() => {
                                                    const expected = testCase.expected;
                                                
                                                    // Helper function to format nested arrays for expected output
                                                    const formatNestedArray = (arr) => {
                                                      if (!Array.isArray(arr)) {
                                                        if (typeof arr === 'string') {
                                                          return `"${arr}"`;
                                                        } else if (typeof arr === 'boolean') {
                                                          return arr.toString();
                                                        }
                                                        return arr;
                                                      }
                                                
                                                      return `[${arr.map(item => {
                                                        if (Array.isArray(item)) {
                                                          return formatNestedArray(item);
                                                        } else if (typeof item === 'string') {
                                                          return `"${item}"`;
                                                        } else if (typeof item === 'boolean') {
                                                          return item.toString();
                                                        }
                                                        return item;
                                                      }).join(', ')}]`;
                                                    };
                                                
                                                    if (expected instanceof Map) {
                                                      return `[${Array.from(expected.values()).join(', ')}]`;
                                                    } else if (Array.isArray(expected)) {
                                                      return formatNestedArray(expected);
                                                    } else if (typeof expected === 'boolean') {
                                                      return expected.toString();
                                                    } else if (typeof expected === 'string') {
                                                      return `"${expected}"`;
                                                    } else if (typeof expected === 'object' && expected !== null) {
                                                      return JSON.stringify(expected);
                                                    } else {
                                                      return expected;
                                                    }
                                                  })()
                                                }
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
                                                  <span className={output.status.description === "Accepted" ? 'text-green-400' : 'text-red-400'}>
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
          <div className="ml-auto flex space-x-2">
            <button
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
  );
}