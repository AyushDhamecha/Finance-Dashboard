import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

const SYSTEM_PROMPT = `You are a receipt/invoice parser. Analyze the uploaded image or PDF of a bill/invoice and extract transaction details.

Return ONLY a valid JSON object with these exact fields:
{
  "date": "YYYY-MM-DD",
  "description": "Brief description of the purchase",
  "category": "one of: salary, food, transport, entertainment, utilities, other",
  "amount": 0.00,
  "type": "expense"
}

Rules:
- For the category, map the purchase to the closest match: grocery/restaurant/cafe → "food", gas/taxi/bus/train/parking → "transport", movies/games/streaming → "entertainment", electric/water/internet/phone bill → "utilities", salary/wages/freelance → "salary", anything else → "other"
- If the date is not clearly visible, use today's date
- The amount should be the total/grand total, not individual line items
- Most receipts are expenses unless clearly marked as income
- Return ONLY the JSON object, no markdown, no code blocks, no explanation`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileData, mimeType } = body;

    if (!fileData || !mimeType) {
      return NextResponse.json(
        { error: 'File data and MIME type are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Add GEMINI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: fileData,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to analyze the receipt. Please check your API key and try again.' },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();
    const textResponse = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return NextResponse.json(
        { error: 'No response from Gemini API' },
        { status: 502 }
      );
    }

    // Clean and parse the JSON response
    const cleanedText = textResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Validate and sanitize the response
    const validCategories = ['salary', 'food', 'transport', 'entertainment', 'utilities', 'other'];
    const result = {
      date: typeof parsed.date === 'string' ? parsed.date : new Date().toISOString().split('T')[0],
      description: typeof parsed.description === 'string' ? parsed.description.slice(0, 100) : '',
      category: validCategories.includes(parsed.category) ? parsed.category : 'other',
      amount: typeof parsed.amount === 'number' && parsed.amount > 0 ? parsed.amount : 0,
      type: parsed.type === 'income' ? 'income' : 'expense',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Parse receipt error:', error);
    return NextResponse.json(
      { error: 'Failed to parse the receipt. Please try again or enter details manually.' },
      { status: 500 }
    );
  }
}
