import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
  let bufferSize = 0;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Uploaded file is not a PDF" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    bufferSize = buffer.length;
    
    console.log("Received PDF buffer size:", buffer.length);

    const text = await new Promise<string>((resolve, reject) => {
      // 1 means extract raw text
      const pdfParser = new (PDFParser as any)(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
          const rawText = (pdfParser as any).getRawTextContent();
          const cleanText = rawText.replace(/----------------Page \(\d+\) Break----------------/g, '');
          resolve(cleanText);
      });
      
      pdfParser.parseBuffer(buffer);
    });
    
    return NextResponse.json({
      text: text,
      title: file.name.replace(".pdf", ""),
    });
  } catch (error: any) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: `Failed to parse PDF. Size: ${bufferSize} bytes. Error: ` + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
