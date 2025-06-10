'use client';
import { useState } from 'react';

export default function TestOpenAI() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');

  const testAPI = async () => {
    if (!code.trim()) {
      setError('Please enter some code');
      return;
    }
    if (!explanation.trim()) {
      setError('Please enter an explanation');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/openai/gradeExplination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          explanation: explanation
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'API call failed');
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sample code and explanations for quick testing
  const loadSample = (type) => {
    if (type === 'good') {
      setCode(`def two_sum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []`);
      setExplanation('This function solves the two sum problem using a hash map. It iterates through the array once, and for each number, it calculates the complement needed to reach the target. If the complement exists in the hash map, it returns the indices. Otherwise, it stores the current number and its index in the hash map.');
    } else {
      setCode(`def two_sum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []`);
      setExplanation('This function sorts the array and then uses binary search to find pairs.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test OpenAI Explanation Grading API</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Code:
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code here..."
            className="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-sm resize-vertical"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Explanation:
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Enter your explanation here..."
            className="w-full h-48 p-3 border border-gray-300 rounded-md text-sm resize-vertical"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => loadSample('good')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Load Good Example
        </button>
        <button
          onClick={() => loadSample('bad')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Load Bad Example
        </button>
        <button
          onClick={() => {
            setCode('');
            setExplanation('');
            setResponse('');
            setError('');
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
      
      <button
        onClick={testAPI}
        disabled={loading || !code.trim() || !explanation.trim()}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Grading...' : 'Grade Explanation'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Response:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-black">
            {response}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-bold text-blue-800 mb-2">How to test:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Use "Load Good Example" for a correct explanation that should get PASS</li>
          <li>• Use "Load Bad Example" for an incorrect explanation that should get FAIL</li>
          <li>• Try your own code and explanations</li>
          <li>• The API should respond with PASS or FAIL based on explanation quality</li>
        </ul>
      </div>
    </div>
  );
}