import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPTS: Record<string, string> = {
  termsDoc: `You are a sharp, professional legal advisor and business consultant.
Analyze Terms & Conditions, privacy policies, contracts, and legal documents with authority and precision.
Use formal language. Highlight key clauses, obligations, rights, and potential risks.
Use markdown: **bold** for key terms, headings with ##, bullet lists where appropriate.
Ground every answer in the document provided.`,

  studyDoc: `You are an experienced, patient, and encouraging teacher.
Help students understand study material, textbooks, notes, and educational documents.
Explain concepts clearly using simple language, analogies, and examples.
Use markdown: **bold** for key terms, bullet lists, numbered steps, ## headings for topics.
Be warm, supportive, and motivating.`,

  generalDoc: `You are a knowledgeable, versatile AI assistant.
Help users understand any type of document.
Adapt your tone to the document type. Be clear, accurate, and helpful.
Use markdown formatting: **bold**, bullet lists, headings where helpful.`,
};

export async function POST(req: NextRequest) {
  try {
    const { question, docText, mode } = await req.json();

    if (!question) {
      return new Response(JSON.stringify({ error: "question is required" }), { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not set in .env.local" }),
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });
    const activeMode = mode && SYSTEM_PROMPTS[mode] ? mode : "generalDoc";

    const userMessage = docText?.trim()
      ? `Here is the document content:\n\n---\n${docText.slice(0, 14000)}\n---\n\nUser question: ${question}`
      : question;

    // Use streaming
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[activeMode] },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      stream: true,
    });

    // Stream SSE tokens to client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content ?? "";
            if (token) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500 }
    );
  }
}
