import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse JSON data (not FormData for text-based requests)
    const { code, explanation } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }
    if (!explanation) {
      return NextResponse.json({ error: 'No explanation provided' }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Use JSON for chat completions API
    const requestBody = {
      model: 'gpt-4',
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer. You grade a user's explanation of their own code as PASS or FAIL based on correctness, clarity, and alignment with the actual code logic."
        },
        {
          role: "user",
          content: `Code:\n${code}\n\nExplanation:\n${explanation}\n\nDoes the explanation correctly and clearly describe the code's logic and purpose? Reply with PASS or FAIL only.`
        }
      ],
      temperature: 0,
      max_tokens: 10
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json({ error: 'Grading failed' }, { status: response.status });
    }

    const data = await response.json();
    const grade = data.choices[0]?.message?.content?.trim();
    
    return NextResponse.json({ 
      grade: grade,
      explanation: explanation,
      code: code 
    });
    
  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}