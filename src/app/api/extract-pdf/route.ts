import { NextRequest, NextResponse } from "next/server";

// Points to the Python FastAPI service
// Locally: http://localhost:8000
// On Render (production): set PDF_SERVICE_URL env var in Vercel dashboard
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isTxt = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

    if (!isPdf && !isTxt) {
      return NextResponse.json(
        { error: "Only PDF and TXT files are supported." },
        { status: 415 }
      );
    }

    // Forward the file to the Python service
    const forwardForm = new FormData();
    forwardForm.append("file", file);

    const pyRes = await fetch(`${PDF_SERVICE_URL}/extract`, {
      method: "POST",
      body: forwardForm,
    });

    const data = await pyRes.json();

    if (!pyRes.ok) {
      return NextResponse.json(
        { error: data.detail ?? "PDF service error" },
        { status: pyRes.status }
      );
    }

    return NextResponse.json({ text: data.text, name: data.name });
  } catch (err) {
    console.error("extract-pdf route error:", err);
    return NextResponse.json(
      { error: "Could not reach the PDF service. Is it running?" },
      { status: 502 }
    );
  }
}
