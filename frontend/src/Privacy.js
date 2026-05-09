export default function Privacy() {
  return (
    <div className="app static-page">
      <header>
        <h1>Privacy Policy</h1>
      </header>

      <section className="static-content">
        <p>
          We do not store your resume or the job description you paste in. Files are
          processed in memory only and are discarded as soon as the analysis is
          returned.
        </p>

        <p>
          Your in-browser session is cleared after 30 minutes of inactivity. Once
          cleared, the uploaded resume, the pasted job description, and the analysis
          result are gone.
        </p>

        <p>
          We do not sell or share your data with third parties. The text of your
          resume and job description is sent to Cloudflare AI for the analysis step.
          We do not use it for any other purpose.
        </p>

        <p>
          <a href="#/">← Back to Edge Finder</a>
        </p>
      </section>
    </div>
  );
}
