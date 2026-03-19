const PDFDocument = require("pdfkit");
const fs = require("fs");

async function runTest() {
  console.log("Generating test PDF...");
  const doc = new PDFDocument();
  await new Promise((resolve) => {
    const stream = fs.createWriteStream("test.pdf");
    stream.on("finish", resolve);
    doc.pipe(stream);
    doc.font("Helvetica").fontSize(16).text("Kore wa tesuto desu. Eigo demo daijoubu desu.");
    doc.end();
  });

  console.log("Testing API route /api/pdf...");
  
  const blob = new Blob([fs.readFileSync("test.pdf")], { type: "application/pdf" });
  const formData = new FormData();
  formData.append("file", blob, "test.pdf");

  try {
    const res = await fetch("http://localhost:3000/api/pdf", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    console.log("API Response:", data);
    
    if (data.text && data.text.includes("desu")) {
      console.log("✅ PDF text extracted successfully!");
    } else {
      console.log("❌ Failed to extract PDF text properly.");
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

runTest();
