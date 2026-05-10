import { useState, useEffect, useRef } from "react";
import "./App.css";
import Terms from "./Terms";
import Privacy from "./Privacy";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const SAMPLE_JD = `Cybersecurity Intern — Summer 2026
Acme Security Inc. · Remote (US)

About the role
We're looking for a cybersecurity intern to join our blue team for the summer. You'll work alongside our SOC analysts and security engineers on real production systems, helping detect, investigate, and respond to security incidents.

Responsibilities
- Triage alerts in our SIEM (Splunk) and escalate true positives
- Write detection rules and Sigma signatures for emerging threats
- Assist with vulnerability scans using Nessus and Qualys
- Help author and maintain runbooks for incident response
- Participate in tabletop exercises with the wider security team
- Contribute to internal Python tooling for log parsing and enrichment

Requirements
- Currently pursuing a degree in Computer Science, Cybersecurity, or related field
- Working knowledge of TCP/IP, DNS, HTTP, and common attack techniques
- Familiarity with at least one scripting language (Python preferred)
- Experience with Linux command line and basic networking tools (nmap, wireshark)
- Understanding of the MITRE ATT&CK framework
- Strong written communication; ability to document findings clearly

Preferred qualifications
- Prior CTF experience (HackTheBox, TryHackMe, picoCTF)
- Familiarity with cloud security on AWS or GCP
- Security+, Network+, or equivalent certification
- Coursework or projects involving SIEM, EDR, or threat hunting

What we offer
- Paid 12-week internship with mentorship from senior security engineers
- Potential for a full-time offer based on performance`;

const SAMPLE_RESUME = `Alex Chen
alex.chen@university.edu · linkedin.com/in/alexchen · github.com/alexchen
San Jose, CA

Education
University of California, Davis
B.S. Computer Science · Expected June 2027 · GPA: 3.6/4.0
Relevant coursework: Data Structures, Operating Systems, Computer Networks, Discrete Math, Intro to Databases

Skills
Languages: Python, Java, JavaScript, C
Tools: Git, VS Code, Docker (basic), Linux command line
Web: HTML, CSS, React (intro), Node.js (intro)

Projects
Personal Portfolio Website
Built a responsive portfolio site using React and Tailwind. Deployed to Vercel with a custom domain. Implemented dark mode and animated transitions.

Weather Dashboard
Created a Python Flask app that pulls forecasts from the OpenWeather API and displays a 5-day outlook. Added basic caching to reduce API calls.

Lecture Notes Organizer
Wrote a Python script that parses Markdown lecture notes and generates a searchable static HTML site. Used by a few classmates.

Experience
Computer Science Tutor — UC Davis Tutoring Center
September 2024 – Present
- Tutor undergraduate students in introductory programming and data structures
- Run weekly review sessions of 6-10 students before midterms
- Help debug student code in Python, Java, and C

Sales Associate — Local Bookstore
Summer 2023, Summer 2024
- Operated point-of-sale system and processed customer transactions
- Reorganized inventory tracking spreadsheet, reducing weekly stocktake time
- Trained two new hires on register procedures and shelf layout

Activities
Member, UC Davis Cybersecurity Club (2024 – Present)
Attended weekly meetings; participated in two introductory CTF events.

Volunteer, Hour of Code at Local Middle School (2023, 2024)
Helped students complete their first programming exercises in Scratch and Python.`;

export default function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (route === "#/terms") return <PageWithFooter><Terms /></PageWithFooter>;
  if (route === "#/privacy") return <PageWithFooter><Privacy /></PageWithFooter>;
  return <PageWithFooter><Home /></PageWithFooter>;
}

function PageWithFooter({ children }) {
  return (
    <>
      {children}
      <footer className="site-footer">
        <a href="#/terms">Terms</a>
        <span className="footer-sep">·</span>
        <a href="#/privacy">Privacy</a>
      </footer>
    </>
  );
}

function Home() {
  const [file, setFile] = useState(null);
  const [sampleResume, setSampleResume] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFile(null);
      setSampleResume(null);
      setJd("");
      setResult(null);
      setSessionExpired(true);
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    if (file || sampleResume || jd) {
      setSessionExpired(false);
      resetTimer();
    }
    return () => clearTimeout(timerRef.current);
  }, [file, sampleResume, jd]);

  const acceptFile = (f) => {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Only PDF or DOCX files are allowed.");
      return;
    }
    setFile(f);
    setSampleResume(null);
    setResult(null);
    setError("");
  };

  const loadSample = () => {
    setFile(null);
    setSampleResume(SAMPLE_RESUME);
    setJd(SAMPLE_JD);
    setResult(null);
    setError("");
  };

  const handleFileChange = (e) => acceptFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if ((!file && !sampleResume) || !jd.trim()) {
      setError("Upload your resume and paste the job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append("resume", file);
    } else {
      formData.append("resumeText", sampleResume);
    }
    formData.append("jobDescription", jd);

    try {
      const res = await fetch("https://edge-finder-ysme.onrender.com/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSampleResume(null);
    setJd("");
    setResult(null);
    setError("");
    setSessionExpired(false);
    clearTimeout(timerRef.current);
  };

  return (
    <div className="app">
      <header>
        <h1>Edge Finder</h1>
        <p className="tagline">Find exactly why you're not getting interviews. Fix it.</p>
        <p className="privacy-note">We don't store your resume or job description. Ever.</p>
      </header>

      {sessionExpired && (
        <div className="expired-banner">
          Session expired. Your data has been cleared.{" "}
          <button onClick={handleReset}>Start Over</button>
        </div>
      )}

      {!result ? (
        <div className="form">
          <div className="field">
            <label>Upload Resume</label>
            <div
              className={`dropzone${dragOver ? " dragging" : ""}${file || sampleResume ? " has-file" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                hidden
              />
              <svg
                className="upload-icon"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {file ? (
                <>
                  <p className="dropzone-main">✓ {file.name}</p>
                  <p className="dropzone-sub">Click or drop to replace</p>
                </>
              ) : sampleResume ? (
                <>
                  <p className="dropzone-main">✓ Sample resume loaded</p>
                  <p className="dropzone-sub">Click or drop to replace with your own</p>
                </>
              ) : (
                <>
                  <p className="dropzone-main">Drop your resume here or click to browse</p>
                  <p className="dropzone-sub">PDF or DOCX · max 5MB</p>
                </>
              )}
            </div>
            <button type="button" className="sample-btn" onClick={loadSample}>
              Try with sample data
            </button>
          </div>

          <div className="field">
            <label>Paste Job Description</label>
            <p className="field-note">Paste the full JD. The more detail, the better the output.</p>
            <textarea
              placeholder="Paste the full job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          {error && <p className="error">{error}</p>}

          {loading ? (
            <div className="loading-state" aria-live="polite">
              <span>Analyzing your resume</span>
              <span className="pulse-dot" />
            </div>
          ) : (
            <button className="analyze-btn" onClick={handleSubmit}>
              Find My Gaps
            </button>
          )}
        </div>
      ) : (
        <div className="results">
          <div className="gap-summary">
            <h2>Why you're getting filtered out</h2>
            <p>{result.gap_summary}</p>
          </div>

          <div className="missing-signals">
            <h2>Missing Signals</h2>
            <ul>
              {result.missing_signals.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="fixes">
            <h2>Your 3 Fixes</h2>
            {result.fixes.map((fix, i) => (
              <div className="fix-card" key={i}>
                <p className="fix-issue">⚠ {fix.issue}</p>
                <div className="fix-diff">
                  <div className="before">
                    <span className="label">Before</span>
                    <p>{fix.original}</p>
                  </div>
                  <div className="after">
                    <span className="label">After</span>
                    <p>{fix.rewrite}</p>
                    <button
                      className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(fix.rewrite)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="reset-btn" onClick={handleReset}>
            Analyze Another Resume
          </button>

          <p className="ai-disclaimer">
            Results are AI-generated suggestions. Verify before using. We are not
            responsible for hiring outcomes.
          </p>
        </div>
      )}
    </div>
  );
}
