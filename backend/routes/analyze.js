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
 
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription } = req.body;
 
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required." });
    }
 
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Job description is too short. Paste the full JD." });
    }
 
    const jdClean = jobDescription.slice(0, 5000);
 
    const resumeText = await parseResume({
      mimetype: req.file.mimetype,
      buffer: req.file.buffer,
    });

    const resumeKeywords = [
      "experience",
      "education",
      "skills",
      "work",
      "university",
      "college",
      "degree",
      "intern",
      "job",
      "project",
    ];
    const lowerText = resumeText.toLowerCase();
    if (
      resumeText.trim().length < 200 ||
      !resumeKeywords.some((kw) => lowerText.includes(kw))
    ) {
      return res.status(400).json({
        error:
          "This doesn't look like a resume. Please upload your actual resume.",
      });
    }

    const result = await analyzeResume(resumeText, jdClean);
 
    // File is already gone — it was only in memory during this request
    res.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});
 
module.exports = router;
