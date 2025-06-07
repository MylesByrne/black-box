export function TestCasesPanel({ activeTab, testCases }) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {activeTab === 'testcases' && (
        <div className="space-y-4">
          {testCases.map((testCase) => (
            <div
              key={testCase.id}
              className="p-3 bg-gray-900 rounded-lg text-sm text-gray-300"
            >
              <div className="mb-1">
                <span className="text-gray-400">Input:</span> nums = [{testCase.nums.join(', ')}],
                target = {testCase.target}
              </div>
              <div>
                <span className="text-gray-400">Expected:</span> [{testCase.output.join(', ')}]
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'output' && (
        <div className="font-mono text-sm text-gray-300">
          <div className="text-gray-400">Run code to see output</div>
        </div>
      )}
    </div>
  );
}