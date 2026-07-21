import { NextRequest, NextResponse } from "next/server";

async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  // Dynamically import pdfjs-dist to avoid Next.js build issues
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Disable worker for server-side use
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const textParts: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str ?? "")
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n").trim();
}

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
        { error: "Only PDF and TXT files are supported" },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    let text = "";

    if (isPdf) {
      text = await extractTextFromPdf(arrayBuffer);
    } else {
      text = new TextDecoder("utf-8").decode(arrayBuffer);
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text. This may be a scanned/image-based PDF — try a text-based PDF." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: text.trim(), name: file.name });
  } catch (err) {
    console.error("PDF extract error:", err);
    return NextResponse.json({ error: "Failed to parse file." }, { status: 500 });
  }
}
