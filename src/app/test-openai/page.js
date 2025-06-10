'use client';
import { useState } from 'react';

export default function TestOpenAI() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's an audio file
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select an audio file');
        setSelectedFile(null);
      }
    }
  };

  const testAPI = async () => {
    if (!selectedFile) {
      setError('Please select an audio file first');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/openai/transcribe', {
        method: 'POST',
        body: formData // Don't set Content-Type header for FormData
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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test OpenAI Transcription API</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select Audio File:
        </label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>
      
      <button
        onClick={testAPI}
        disabled={loading || !selectedFile}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Transcribing...' : 'Test Transcription'}
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
    </div>
  );
}