const JUDGE0_API_URL = 'https://judge0-ce.p.sulu.sh';
const PYTHON_LANGUAGE_ID = 71;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));



export const submitCode = async (sourceCode) => {
  try {
    const submission = await fetch(`${JUDGE0_API_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language_id: PYTHON_LANGUAGE_ID,
        source_code: sourceCode,
        expected_output: "All test cases passed!" 
      })
    });

    const submissionData = await submission.json();
    if (!submissionData.token) {
      throw new Error('No submission token received');
    }

    // Poll for results
    let maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const result = await fetch(`${JUDGE0_API_URL}/submissions/${submissionData.token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await result.json();

      // Check if processing is complete
      if (response.status?.id > 2) {
        response.stdout = response.stdout;
        response.stderr = response.stderr;
        response.compile_output = response.compile_output;
        return response;
      }

      // Wait before next attempt
      await delay(1000);
      attempts++;
    }

    throw new Error('Submission timed out');
  } catch (error) {
    console.error('Full error:', error);
    throw new Error(`Judge0 API Error: ${error.message}`);
  }
};