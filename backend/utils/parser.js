const mammoth = require("mammoth");
async function parseResume(file) {
  const { mimetype, buffer } = file;
  if (mimetype === "application/pdf") {
    const pdfParse = (await import("pdf-parse-fork")).default;
    const data = await pdfParse(buffer);
    const text = typeof data.text === "string" ? data.text : String(data.text);
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
