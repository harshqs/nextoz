import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// System prompts per mode
const SYSTEM_PROMPTS: Record<string, string> = {
  termsDoc: `You are a sharp, professional legal advisor and business consultant.
Analyze Terms & Conditions, privacy policies, contracts, and legal documents with authority and precision.
Use formal language. Highlight key clauses, obligations, rights, and potential risks.
Structure responses with headings for detailed answers. Be thorough but concise.
Ground every answer in the document provided — never give generic responses.`,

  studyDoc: `You are an experienced, patient, and encouraging teacher.
Help students understand study material, textbooks, notes, and educational documents.
Explain concepts clearly using simple language, analogies, and examples.
Break down complex topics step by step. Be warm, supportive, and motivating.`,

  generalDoc: `You are a knowledgeable, versatile AI assistant.
Help users understand any type of document — contracts, study material, reports, manuals, or general text.
Adapt your tone to the document type. Be clear, accurate, and helpful.
Provide structured responses when the content warrants it.`,
};

export async function POST(req: NextRequest) {
  try {
    const { question, docText, mode } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not set. Add it to your .env.local file." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });
    const activeMode = mode && SYSTEM_PROMPTS[mode] ? mode : "generalDoc";
    const systemPrompt = SYSTEM_PROMPTS[activeMode];

    const userMessage = docText?.trim()
      ? `Here is the document content:\n\n---\n${docText.slice(0, 14000)}\n---\n\nUser question: ${question}`
      : question;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Free, fast, very capable
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const answer = completion.choices[0]?.message?.content ?? "No response from model.";
    return NextResponse.json({ answer, mode: activeMode });
  } catch (err) {
    console.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
