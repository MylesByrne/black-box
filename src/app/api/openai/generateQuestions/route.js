import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse JSON data (not FormData for text-based requests)
    const { code} = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }    // Use JSON for chat completions API
    const requestBody = {
      model: 'gpt-4',
      messages: [
        {
          role: "system",
          content: "You are an expert programming instructor. Generate exactly 3 multiple choice questions based on the provided code. Each question should test understanding of the code's logic, algorithms, or implementation details. Have the questions be 7/10 in terms of difficulty. Format your response as a JSON array of objects, each with 'question', 'options' (array of 4 choices), and 'correctAnswer' (index 0-3) properties."
        },
        {
          role: "user",
          content: `Code:\n${code}\n\nGenerate 3 multiple choice questions about this code. Focus on algorithm understanding, time/space complexity, edge cases, or implementation details. Return only valid JSON.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json({ error: 'Question generation failed' }, { status: response.status });
    }const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    try {
      // Parse the JSON response from OpenAI
      const questions = JSON.parse(content);
      
      // Validate the response format
      if (!Array.isArray(questions) || questions.length !== 3) {
        throw new Error('Invalid questions format');
      }
      
      // Validate each question has required properties
      for (const q of questions) {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
            typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error('Invalid question structure');
        }
      }
      
      return NextResponse.json({ 
        questions: questions,
        code: code 
      });
    } catch (parseError) {
      console.error('Failed to parse questions:', parseError);
      return NextResponse.json({ error: 'Failed to generate valid questions' }, { status: 500 });
    }
      } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}