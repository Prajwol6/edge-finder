import { useState, useEffect, useRef } from "react";
import "./App.css";
import Terms from "./Terms";
import Privacy from "./Privacy";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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
      setJd("");
      setResult(null);
      setSessionExpired(true);
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    if (file || jd) {
      setSessionExpired(false);
      resetTimer();
    }
    return () => clearTimeout(timerRef.current);
  }, [file, jd]);

  const acceptFile = (f) => {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Only PDF or DOCX files are allowed.");
      return;
    }
    setFile(f);
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
    if (!file || !jd.trim()) {
      setError("Upload your resume and paste the job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
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
              className={`dropzone${dragOver ? " dragging" : ""}${file ? " has-file" : ""}`}
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
              ) : (
                <>
                  <p className="dropzone-main">Drop your resume here or click to browse</p>
                  <p className="dropzone-sub">PDF or DOCX · max 5MB</p>
                </>
              )}
            </div>
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
