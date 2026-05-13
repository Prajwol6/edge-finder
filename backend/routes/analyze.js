const express = require("express");
const multer = require("multer");
const { parseResume } = require("../utils/parser");
const { analyzeResume } = require("../utils/gemini");
 
const router = express.Router();
 
// Store file in memory only — never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed."));
    }
  },
});
 
const handleUpload = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File is too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ error: err.message });
    }
    return res
      .status(400)
      .json({ error: err.message || "File upload failed." });
  });
};

router.post("/", handleUpload, async (req, res) => {
  try {
    const { jobDescription, resumeText: rawResumeText } = req.body;

    const hasFile = !!req.file;
    const hasText =
      typeof rawResumeText === "string" && rawResumeText.trim().length > 0;

    if (!hasFile && !hasText) {
      return res.status(400).json({ error: "Resume file is required." });
    }

    if (hasFile) {
      const magic = req.file.buffer.slice(0, 4);
      const isPdf = magic.toString("ascii") === "%PDF";
      const isDocx = magic[0] === 0x50 && magic[1] === 0x4b;
      const claimedPdf = req.file.mimetype === "application/pdf";
      const claimedDocx =
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if ((claimedPdf && !isPdf) || (claimedDocx && !isDocx)) {
        return res.status(400).json({
          error: "File contents don't match the declared file type.",
        });
      }
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Job description is too short. Paste the full JD." });
    }

    const jdKeywords = [
      "role",
      "responsibilities",
      "requirements",
      "experience",
      "skills",
      "team",
      "work",
      "job",
      "position",
      "qualifications",
      "candidate",
      "ability",
      "knowledge",
      "develop",
      "manage",
      "support",
      "communicate",
      "degree",
      "years",
      "preferred",
    ];
    const lowerJd = jobDescription.toLowerCase();
    const jdMatches = jdKeywords.filter((kw) =>
      new RegExp(`\\b${kw}\\b`).test(lowerJd)
    ).length;
    if (jdMatches < 3) {
      return res.status(400).json({
        error:
          "This doesn't look like a real job description. Please paste the full job posting.",
      });
    }

    const promptInjectionPhrases = [
      "ignore previous instructions",
      "prompt override",
      "new instruction",
      "repeat after me",
      "you are now",
      "bypass",
    ];
    if (promptInjectionPhrases.some((phrase) => lowerJd.includes(phrase))) {
      return res.status(400).json({
        error: "Invalid job description. Please paste an actual job posting.",
      });
    }

    const jdClean = jobDescription.slice(0, 5000);

    const resumeText = hasFile
      ? await parseResume({
          mimetype: req.file.mimetype,
          buffer: req.file.buffer,
        })
      : rawResumeText.slice(0, 20000);

    const lowerText = resumeText.toLowerCase();
    const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;

    const nonResumePhrases = [
      "account number",
      "bill",
      "invoice",
      "payment due",
      "amount due",
      "statement",
      "balance",
      "meter reading",
    ];
    const hasNonResumePhrase = nonResumePhrases.some((phrase) =>
      new RegExp(`\\b${phrase}\\b`).test(lowerText)
    );

    const resumeKeywords = [
      "experience",
      "education",
      "skills",
      "work",
      "university",
      "college",
      "degree",
      "intern",
      "project",
      "certification",
      "summary",
      "objective",
      "employment",
      "volunteer",
      "achievement",
    ];
    const resumeKeywordMatches = resumeKeywords.filter((kw) =>
      new RegExp(`\\b${kw}\\b`).test(lowerText)
    ).length;

    if (
      wordCount < 150 ||
      resumeKeywordMatches < 2 ||
      hasNonResumePhrase
    ) {
      return res.status(400).json({
        error:
          "This doesn't look like a resume. Please upload your actual resume PDF.",
      });
    }

    const sanitize = (s) =>
      s
        .replace(/<\/?(resume|jd)\b[^>]*>/gi, "")
        .replace(/<[^>]*>/g, "");

    const result = await analyzeResume(sanitize(resumeText), sanitize(jdClean));
 
    // File is already gone — it was only in memory during this request
    res.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    if (res.headersSent) return;
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});
 
module.exports = router;
