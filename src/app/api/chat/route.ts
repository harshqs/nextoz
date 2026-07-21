import { NextRequest, NextResponse } from "next/server";

// System prompts per mode
const SYSTEM_PROMPTS: Record<string, string> = {
  termsDoc: `You are a sharp, professional legal advisor and business consultant. 
Your role is to analyze Terms & Conditions, privacy policies, contracts, and legal documents. 
Speak with authority and precision. Use formal language. 
Highlight key clauses, obligations, rights, and potential risks clearly. 
Structure your responses with headings when the answer is detailed. 
Always be thorough but concise. Never give generic answers — ground everything in the document provided.`,

  studyDoc: `You are an experienced, patient, and encouraging teacher. 
Your role is to help students understand study material, textbooks, notes, and educational documents. 
Explain concepts clearly with simple language, analogies, and examples. 
Break down complex topics step by step. 
If a student seems confused, offer alternative explanations. 
Be warm, supportive, and motivating in your tone.`,

  generalDoc: `You are a knowledgeable, versatile AI assistant. 
Your role is to help users understand any type of document — whether it's a contract, study material, report, manual, or general text. 
Adapt your tone to match the nature of the document. 
Be clear, accurate, and helpful. Provide structured responses when needed.`,
};

export async function POST(req: NextRequest) {
  try {
    const { question, docText, mode } = await req.json();

    if (!question || !docText) {
      return NextResponse.json(
        { error: "question and docText are required" },
        { status: 400 }
      );
    }

    const activeMode = mode && SYSTEM_PROMPTS[mode] ? mode : "generalDoc";
    const systemPrompt = SYSTEM_PROMPTS[activeMode];

    const userMessage = `Here is the document content:\n\n---\n${docText.slice(0, 12000)}\n---\n\nUser question: ${question}`;

    // Call local Ollama instance
    const ollamaRes = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",   // change to any model you have pulled e.g. mistral, llama3, phi3
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      console.error("Ollama error:", errText);
      return NextResponse.json(
        {
          error:
            "Could not reach Ollama. Make sure Ollama is running locally (`ollama serve`) and you have a model pulled (`ollama pull llama3.2`).",
        },
        { status: 502 }
      );
    }

    const data = await ollamaRes.json();
    const answer = data?.message?.content ?? "No response from model.";

    return NextResponse.json({ answer, mode: activeMode });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Internal server error. Is Ollama running?" },
      { status: 500 }
    );
  }
}
