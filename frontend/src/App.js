import { useState, useEffect, useRef } from "react";
import "./App.css";
import Terms from "./Terms";
import Privacy from "./Privacy";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const HISTORY_KEY = "ef-history";
const HISTORY_DISPLAY_LIMIT = 10;

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore quota / serialization errors
  }
}

function addHistoryEntry(entry) {
  const history = loadHistory();
  history.unshift(entry);
  saveHistory(history);
}

function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

const SAMPLES = {
  cyber: {
    label: "Cybersecurity",
    jd: `Cybersecurity Intern — Summer 2026
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
- Potential for a full-time offer based on performance`,
    resume: `Alex Chen
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
Helped students complete their first programming exercises in Scratch and Python.`,
  },
  swe: {
    label: "Software Eng",
    jd: `Software Engineering Intern — Summer 2026
BrightLoop Technologies · San Francisco, CA (Hybrid)

About the role
We're hiring a software engineering intern to join our web platform team. You'll ship real features alongside senior engineers, contribute to our customer-facing dashboard, and help build internal tools that move the business forward.

Responsibilities
- Build and maintain features in our React + Node.js web application
- Design and consume REST APIs that power dashboards and integrations
- Write unit and integration tests for new and existing code
- Participate in daily standups, sprint planning, and code reviews
- Pair with senior engineers on architecture and debugging
- Contribute to internal documentation and onboarding guides

Requirements
- Currently pursuing a degree in Computer Science or related field
- Solid foundation in JavaScript and at least one other language
- Hands-on experience with React (hooks, component composition)
- Working knowledge of Node.js and REST API design
- Comfortable with Git workflows (branches, pull requests, merge conflicts)
- Familiarity with Agile/Scrum practices

Preferred qualifications
- Experience with TypeScript
- Exposure to PostgreSQL or another relational database
- Prior internship, hackathon wins, or substantial open-source contributions
- Familiarity with CI/CD and cloud platforms (AWS, GCP)

What we offer
- Paid 12-week internship with weekly mentorship
- Real production work, not throwaway projects
- Potential return offer for a full-time role`,
    resume: `Jordan Park
jordan.park@university.edu · linkedin.com/in/jordanpark · github.com/jordanpark
Seattle, WA

Education
University of Washington
B.S. Computer Science · Expected June 2027 · GPA: 3.7/4.0
Relevant coursework: Data Structures, Algorithms, Web Programming, Software Construction, Databases

Skills
Languages: Python, Java, JavaScript
Frameworks: React, Flask
Tools: Git, GitHub, VS Code, Linux command line

Projects
Recipe Finder Web App
Built a React single-page app that searches recipes by ingredient via the Spoonacular API. Implemented client-side filtering and a saved-favorites list using localStorage.

Personal Blog Engine
Wrote a Python script that converts a folder of Markdown files into a static blog with tags and an RSS feed. Hosted on GitHub Pages.

2D Tile Game (Java)
Built a small dungeon-crawler in Java with custom sprites and basic A* pathfinding for enemies. Code on GitHub with 30+ commits across two months.

Experience
Teaching Assistant — Intro to Programming, UW
January 2025 – Present
- Hold weekly office hours for an intro CS course of 80 students
- Grade weekly Python assignments and provide written feedback
- Run review sessions before midterms

Activities
Member, UW Competitive Programming Club (2024 – Present)
Solve weekly practice problems with the club; participated in one regional ICPC event.

Member, UW Hackathon Team (2025)
Built a study-group matcher app over a 36-hour hackathon; placed in top 10.`,
  },
  ds: {
    label: "Data Science",
    jd: `Data Science Intern — Summer 2026
Northwind Analytics · Boston, MA (Remote-friendly)

About the role
Northwind's data science team builds models and dashboards that drive product and marketing decisions for our SaaS platform. As an intern, you'll work on real datasets, contribute to our analytics pipeline, and present findings to non-technical stakeholders.

Responsibilities
- Explore and clean datasets to surface patterns and anomalies
- Build and evaluate baseline machine learning models (regression, classification)
- Create dashboards and visualizations to communicate findings
- Work in Jupyter notebooks for prototyping; help productionize select work
- Write SQL queries against our data warehouse to extract relevant features
- Present analyses to product, marketing, and engineering teams

Requirements
- Currently pursuing a degree in Statistics, Data Science, Computer Science, Math, or related field
- Strong Python skills (pandas, NumPy)
- Working knowledge of SQL (joins, group-by, window functions)
- Familiarity with machine learning fundamentals (train/test split, common algorithms, evaluation metrics)
- Comfort with data visualization (matplotlib, seaborn, or similar)
- Experience working in Jupyter notebooks

Preferred qualifications
- Prior coursework or projects involving scikit-learn or PyTorch
- Exposure to A/B testing or experiment design
- Familiarity with cloud data tools (BigQuery, Snowflake, or Redshift)
- Kaggle, research, or open-source data work to point to

What we offer
- Paid 12-week internship with mentorship from senior data scientists
- Direct exposure to production analytics and decision-making
- Possible return offer for full-time role`,
    resume: `Priya Shah
priya.shah@university.edu · linkedin.com/in/priyashah · github.com/priyashah
Austin, TX

Education
University of Texas at Austin
B.S. Statistics · Expected May 2027 · GPA: 3.8/4.0
Relevant coursework: Probability, Statistical Inference, Regression Analysis, Intro to Machine Learning, Linear Algebra

Skills
Languages: Python, R (intro)
Libraries: pandas, NumPy, matplotlib
Tools: Jupyter, Git, Excel

Projects
Titanic Survival Prediction (Kaggle)
Cleaned and explored the Titanic dataset using pandas; engineered features from passenger metadata and trained a logistic regression baseline. Documented findings in a Jupyter notebook with matplotlib visualizations. Submission scored in the top 40% of the public leaderboard.

Course Project: Linear Regression on Housing Prices
Built a linear regression model in Python to predict housing prices from a public dataset. Compared OLS to a basic regularized model and wrote a 10-page report with residual diagnostics.

Course Project: Probability Simulator
Wrote a Python script to simulate classic probability puzzles (Monty Hall, gambler's ruin) and visualized convergence with matplotlib.

Activities
Member, UT Statistics Society (2024 – Present)
Attend monthly speaker events on applied statistics and data science careers.

Volunteer Tutor — Local High School Math Program (2024 – Present)
Tutor 9th and 10th graders weekly in algebra and intro statistics.

Member, Women in Data Club (2025 – Present)
Participate in monthly study groups working through Kaggle micro-courses.`,
  },
};

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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <>
      {children}
      <footer className="site-footer">
        <a href="#/terms">Terms</a>
        <span className="footer-sep">·</span>
        <a href="#/privacy">Privacy</a>
        <span className="footer-sep">·</span>
        <button
          type="button"
          className="footer-link"
          onClick={() => setHistoryOpen(true)}
        >
          My Analyses
        </button>
        <span className="footer-sep">·</span>
        <button
          type="button"
          className="footer-link"
          onClick={() => setFeedbackOpen(true)}
        >
          Give Feedback
        </button>
      </footer>
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
      {historyOpen && <HistoryModal onClose={() => setHistoryOpen(false)} />}
    </>
  );
}

function FeedbackModal({ onClose }) {
  const [helpful, setHelpful] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("https://formspree.io/f/xjglprrn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ helpful, comment }),
      });
    } catch {
      // swallow — still show thanks so user isn't blocked
    }
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Feedback"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {submitted ? (
          <p className="modal-thanks">Thanks for your feedback!</p>
        ) : (
          <>
            <h3 className="modal-title">Was this helpful?</h3>
            <div className="modal-rating">
              <button
                type="button"
                className={`rating-btn${helpful === true ? " selected" : ""}`}
                onClick={() => setHelpful(true)}
                aria-label="Thumbs up"
              >
                👍
              </button>
              <button
                type="button"
                className={`rating-btn${helpful === false ? " selected" : ""}`}
                onClick={() => setHelpful(false)}
                aria-label="Thumbs down"
              >
                👎
              </button>
            </div>
            <textarea
              className="modal-textarea"
              placeholder="What could be better? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              type="button"
              className="modal-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Submit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function HistoryModal({ onClose }) {
  const [history, setHistory] = useState(() => loadHistory());

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  const entries = history.slice(0, HISTORY_DISPLAY_LIMIT);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card history-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="My Analyses"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="modal-title">My Analyses</h3>
        {entries.length === 0 ? (
          <p className="history-empty">
            No analyses yet. Your last 10 runs will appear here.
          </p>
        ) : (
          <>
            <ul className="history-list">
              {entries.map((entry) => {
                const fixes = Array.isArray(entry.fixes_copied)
                  ? entry.fixes_copied
                  : [];
                const heading = [entry.company, entry.role]
                  .filter(Boolean)
                  .join(" — ");
                return (
                  <li className="history-item" key={entry.id}>
                    <div className="history-row">
                      <span className="history-title">
                        {heading || "(untitled)"}
                      </span>
                      <span className="history-date">{entry.date}</span>
                    </div>
                    {fixes.length > 0 ? (
                      <ul className="history-fixes">
                        {fixes.map((text, i) => (
                          <li key={i}>{text}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="history-no-fixes">No fixes copied</p>
                    )}
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className="history-clear"
              onClick={handleClear}
            >
              Clear History
            </button>
          </>
        )}
      </div>
    </div>
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
  const [copiedRewrites, setCopiedRewrites] = useState([]);
  const [saveCompany, setSaveCompany] = useState("");
  const [saveRole, setSaveRole] = useState("");
  const [saved, setSaved] = useState(false);
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

  const loadSample = (key) => {
    const sample = SAMPLES[key];
    if (!sample) return;
    setFile(null);
    setSampleResume(sample.resume);
    setJd(sample.jd);
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
      setCopiedRewrites([]);
      setSaveCompany("");
      setSaveRole("");
      setSaved(false);
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
    setCopiedRewrites([]);
    setSaveCompany("");
    setSaveRole("");
    setSaved(false);
    clearTimeout(timerRef.current);
  };

  const handleSave = () => {
    const company = saveCompany.trim();
    const role = saveRole.trim();
    if (!company && !role) return;
    addHistoryEntry({
      id: Date.now(),
      date: new Date().toLocaleString(),
      company,
      role,
      fixes_copied: copiedRewrites,
    });
    setSaved(true);
  };

  return (
    <div className="app home">
      <header className="hero">
        <span className="brand">Edge Finder</span>
        {!result && (
          <>
            <h1 className="hero-headline">
              Stop guessing why you're not getting interviews.
            </h1>
            <p className="hero-sub">
              Paste your resume and job description. Get specific fixes in 30 seconds.
            </p>
            <div className="trust-bar">
              <span className="trust-stat">Free to use</span>
              <span className="trust-sep" aria-hidden="true">·</span>
              <span className="trust-stat">No signup required</span>
              <span className="trust-sep" aria-hidden="true">·</span>
              <span className="trust-stat">Data never stored</span>
            </div>
          </>
        )}
      </header>

      {!result && (
        <>
          <div className="section-divider" aria-hidden="true" />
          <section className="how-it-works">
            <h2 className="section-label">How it works</h2>
            <ol className="steps">
              <li className="step">
                <span className="step-num">1</span>
                <span className="step-text">Upload Resume</span>
              </li>
              <li className="step">
                <span className="step-num">2</span>
                <span className="step-text">Paste Job Description</span>
              </li>
              <li className="step">
                <span className="step-num">3</span>
                <span className="step-text">Get Copy-Paste Fixes</span>
              </li>
            </ol>
          </section>
          <div className="section-divider" aria-hidden="true" />
        </>
      )}

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
            <div className="sample-btn-row">
              <span className="sample-btn-label">Try sample:</span>
              {Object.entries(SAMPLES).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  className="sample-btn"
                  onClick={() => loadSample(key)}
                >
                  {label}
                </button>
              ))}
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
                      onClick={() => {
                        navigator.clipboard.writeText(fix.rewrite);
                        setCopiedRewrites((prev) =>
                          prev.includes(fix.rewrite) ? prev : [...prev, fix.rewrite]
                        );
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {saved ? (
            <p className="save-prompt-done">✓ Saved to My Analyses</p>
          ) : (
            <div className="save-prompt">
              <p className="save-prompt-title">Save this analysis?</p>
              <div className="save-prompt-row">
                <input
                  type="text"
                  className="save-prompt-input"
                  placeholder="Company name"
                  value={saveCompany}
                  onChange={(e) => setSaveCompany(e.target.value)}
                />
                <input
                  type="text"
                  className="save-prompt-input"
                  placeholder="Role title"
                  value={saveRole}
                  onChange={(e) => setSaveRole(e.target.value)}
                />
                <button
                  type="button"
                  className="save-prompt-btn"
                  onClick={handleSave}
                  disabled={!saveCompany.trim() && !saveRole.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          )}

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
