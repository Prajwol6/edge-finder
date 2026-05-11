const mammoth = require("mammoth");
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || "http://localhost:5001";
async function parseResume(file) {
  const { mimetype, buffer, originalname } = file;
  if (mimetype === "application/pdf") {
    const form = new FormData();
    form.append(
      "file",
      new Blob([buffer], { type: "application/pdf" }),
      originalname || "upload.pdf"
    );
    const res = await fetch(`${PDF_SERVICE_URL}/parse`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PDF service error: ${err}`);
    }
    const { text } = await res.json();
    return text;
  }
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error("Unsupported file type. Upload a PDF or DOCX.");
}
module.exports = { parseResume };
