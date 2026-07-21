import { NextRequest, NextResponse } from "next/server";

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
    const isTxt = file.type === "text/plain" || name.endsWith(".txt");

    if (!isPdf && !isTxt) {
      return NextResponse.json(
        { error: "Only PDF and TXT files are supported." },
        { status: 415 }
      );
    }

    const forwardForm = new FormData();
    forwardForm.append("file", file);

    // Use the streaming endpoint — proxy the SSE stream directly to the browser
    const pyRes = await fetch(`${PDF_SERVICE_URL}/extract-stream`, {
      method: "POST",
      body: forwardForm,
    });

    if (!pyRes.ok || !pyRes.body) {
      const errData = await pyRes.json().catch(() => ({ detail: "PDF service error" }));
      return NextResponse.json(
        { error: errData.detail ?? "PDF service error" },
        { status: pyRes.status }
      );
    }

    // Proxy the SSE stream through to the client
    return new NextResponse(pyRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("extract-pdf route error:", err);
    return NextResponse.json(
      { error: "Could not reach the PDF service. Is it running on port 8000?" },
      { status: 502 }
    );
  }
}
