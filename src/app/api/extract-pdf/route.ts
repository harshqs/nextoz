import { NextRequest, NextResponse } from "next/server";
import * as pdfParseModule from "pdf-parse";
// pdf-parse exports differently depending on module resolution
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfParse: (buf: Buffer) => Promise<{ text: string }> = (pdfParseModule as any).default ?? pdfParseModule;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      return NextResponse.json(
        { error: "Only PDF and TXT files are supported" },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";

    if (file.type === "application/pdf") {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else {
      // Plain text file
      text = buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from this file. It may be a scanned image-based PDF." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: text.trim(), name: file.name });
  } catch (err) {
    console.error("PDF extract error:", err);
    return NextResponse.json(
      { error: "Failed to parse file." },
      { status: 500 }
    );
  }
}
