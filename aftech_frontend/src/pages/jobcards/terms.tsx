// src/pages/jobcards/terms.tsx — Professional minimal design (wording unchanged)
import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Terms() {
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const initial = useMemo(
    () =>
      pathname.toLowerCase().includes("privacy") || hash === "#privacy"
        ? "privacy"
        : "terms",
    [pathname, hash]
  );

  useEffect(() => {
    const id = initial === "privacy" ? "privacy" : "terms";
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initial]);

  return (
    <div className="container py-4">
      {/* Minimal, professional helpers */}
      <style>{`
        :root {
          --aftech-accent: #ff4500; /* orangered */
          --aftech-accent-600: #e33e00;
          --aftech-border: rgba(0,0,0,.08);
          --aftech-soft: rgba(0,0,0,.06);
          --aftech-muted: #6c757d;
        }
        html { scroll-behavior: smooth; }
        .scroll-mt { scroll-margin-top: 88px; }

        /* Header */
        .topbar {
          position: sticky; top: 0; z-index: 20;
          background: #fff; border-bottom: 1px solid var(--aftech-border);
          backdrop-filter: saturate(1.1) blur(4px);
        }
        .topbar .brand { font-size: .8rem; letter-spacing: .06em; color: var(--aftech-muted); text-transform: uppercase; }
        .btn-accent {
          border-color: var(--aftech-accent);
          color: var(--aftech-accent);
        }
        .btn-accent:hover { background: var(--aftech-accent); color: #fff; }
        .btn-slim { padding: .42rem .72rem; }

        /* Content cards */
        .pro-card {
          background: #fff; border: 1px solid var(--aftech-border); border-radius: 12px;
        }
        .pro-body { padding: 1.25rem; }
        @media (min-width: 768px) { .pro-body { padding: 1.75rem; } }
        .pro-accent {
          border-left: 4px solid var(--aftech-accent);
          border-top-left-radius: 12px; border-bottom-left-radius: 12px;
        }

        .hr-soft { border: 0; height: 1px; background: var(--aftech-border); }
        .list-clean > li { margin-bottom: .42rem; }
        .link-muted { text-decoration: none; border-bottom: 1px dotted rgba(0,0,0,.35); }
        .link-muted:hover { border-bottom-style: solid; }
        .section-title { font-weight: 600; }
      `}</style>

      {/* Sticky header (minimal) */}
      <header className="topbar mb-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
          <div>
            <div className="brand mb-1 px-2">AFTECH SOLUTION PORTAL</div>
            <div className="d-flex align-items-baseline gap-2 px-2">
              <h1 className="h5 fw-semibold mb-0">Terms &amp; Conditions and Privacy</h1>
              <small className="text-secondary">Effective date: <strong>2025-12-01</strong></small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 px-2">
            <a href="#terms" className="btn btn-outline-dark btn-sm btn-slim btn-accent">Terms &amp; Conditions</a>
            <a href="#privacy" className="btn btn-outline-dark btn-sm btn-slim">Privacy</a>
            <button className="btn btn-secondary btn-sm btn-slim" onClick={() => navigate("/login")}>
              ← Back to Login
            </button>
          </div>
        </div>
      </header>

      {/* Terms */}
      <section id="terms" className="scroll-mt mb-4">
        <div className="pro-card pro-accent">
          <div className="pro-body">
            <div className="alert alert-warning small mb-3">
              <strong>Internal Use Only.</strong> The API/Portal are provided solely for AFTECH business operations.
              By accessing, you agree to these Terms and all referenced policies.
            </div>

            <h2 className="h5 section-title mb-3">Terms of Use</h2>

            <h6 className="mt-3">1) Eligibility & Accounts</h6>
            <ul className="list-clean mb-3">
              <li>Active AFTECH account (SSO/MFA where configured) and role authorization required.</li>
              <li>Safeguard credentials and API keys; do not share.</li>
            </ul>

            <h6>2) Acceptable Use</h6>
            <ul className="list-clean mb-3">
              <li>Use only for job duties (job cards, inventory, support, reporting); minimize personal data.</li>
              <li>No security bypassing, scraping, spam, or service degradation.</li>
            </ul>

            <h6>3) Authentication & Authorization</h6>
            <p className="mb-2">Use approved auth (OAuth/JWT/SSO). Apply least privilege; request only authorized resources.</p>
            <p className="mb-3">You’ll only see what your role allows. Don’t try to access data you don’t need for your job.</p>

            <h6>4) API Keys, Tokens, and Clients</h6>
            <p className="mb-3">Keep secrets secure; never commit them. Third-party clients require IT/Security approval.</p>

            <h6>5) Rate Limits & Fair Use</h6>
            <p className="mb-3">Respect limits; AFTECH may throttle or revoke access for abuse.</p>

            <h6>6) Data Scope & Handling</h6>
            <p className="mb-3">Treat all API/portal data as Confidential; share internally on a need-to-know basis; encrypt and minimize storage.</p>

            <h6>7) Logging, Monitoring & Audit</h6>
            <p className="mb-3">Usage may be logged and audited for security, compliance, and performance.</p>

            <h6>8) Versioning, Changes & Deprecation</h6>
            <p className="mb-3">AFTECH may version/deprecate endpoints; migrate before sunset dates. We’ll give notice and a timeline; you must move to the new version before the old one shuts off.</p>

            <h6>9) Availability & Maintenance</h6>
            <p className="mb-3">Maintenance windows and outages may occur; features may change.</p>

            <h6>10) Security & Incidents</h6>
            <p className="mb-3">Keep your work devices updated and protected; report incidents to <a className="link-muted" href="mailto:glodie@aftech.africa">glodie@aftech.africa</a>.</p>

            <h6>11) Intellectual Property</h6>
            <p className="mb-3">The API, software, and docs are AFTECH property; work product is assigned to AFTECH.</p>

            <h6>12) Third-Party Services</h6>
            <p className="mb-2">
              <strong> Users are not permitted</strong> to connect any third-party services, automation tools, cloud drives,
              data extractors, or middleware to <em>upload</em> or <em>pull</em> data from the software <strong>without prior
              written permission</strong> from <strong>Jordan (AFTECH)</strong> at
              <a className="link-muted" href="mailto:jordan@aftech.africa"> jordan@aftech.africa</a>.
            </p>
            <ul className="list-clean mb-3">
              <li>Requests must include purpose, data fields, retention, security controls, and sunset date.</li>
              <li>Approved tools must be scoped to least privilege and logged; access is reviewed regularly.</li>
              <li>AFTECH may revoke any approval immediately for security, compliance, or operational reasons.</li>
            </ul>

            <h6>13) Suspension & Termination</h6>
            <p className="mb-3">Access may be suspended/terminated for violations, role changes, or security concerns.</p>

            <h6>14) Retention & Data Protection</h6>
            <p className="mb-0">Data is protected and kept only as long as needed details below.</p>
          </div>
        </div>
      </section>

      <hr className="hr-soft my-4" />

      {/* Privacy */}
      <section id="privacy" className="scroll-mt">
        <div className="pro-card pro-accent">
          <div className="pro-body">
            <h2 className="h5 section-title mb-3">Privacy Notice</h2>

            <h6 className="mt-3">1) What We Collect</h6>
            <ul className="list-clean mb-2">
              <li>Basic identity: your name/username/email/role.</li>
              <li>Security info: sign-in date/time, IP address,</li>
              <li>Usage info: which pages and API endpoints you use, performance & error logs.</li>
              <li>Support content: what you enter into job cards (SUPPORT NAME, INSTALL TYPE, CUSTOMER NAME, REG, IMEI, TECHNICIAN).</li>
            </ul>
            <p className="mb-3"><strong>Tip: </strong>Only put work-relevant info in job cards. Don’t include unnecessary personal details about customers or colleagues.</p>

            <h6>2) Purposes</h6>
            <p className="mb-3">Operate and secure the portal/API, fulfill support workflows, audit/compliance, troubleshooting, performance.</p>

            <h6>3) Sharing</h6>
            <ul className="list-clean mb-3">
              <li>
                <strong>Internal access only (need-to-know):</strong> Within AFTECH, information is accessible solely to
                personnel who require it to perform their job duties (e.g., your team, designated administrators).
              </li>
              <li>
                <strong>No credential sharing:</strong> You are <u>prohibited</u> from sharing your login credentials,
                tokens, or API keys with <u>any non-AFTECH individual</u> (or any person not specifically authorized by AFTECH).
                You are responsible for safeguarding your access at all times.
              </li>
              <li>
                <strong>AFTECH ownership & confidentiality:</strong> All data, content, documentation, and outputs on or from
                this platform are <u>confidential and the property of AFTECH</u>. Sharing, publishing, or transferring such
                information to any non-AFTECH party without prior written authorization from AFTECH is strictly prohibited and
                may constitute a breach of confidentiality, contractual obligations, and/or infringement of AFTECH’s intellectual
                property rights.
              </li>
            </ul>

            <h6>5) Rights & Contacts</h6>
            <p className="mb-4">
              Depending on jurisdiction, you may request access/correction/deletion via{" "}
              <a className="link-muted" href="mailto:jordan@aftech.africa">jordan@aftech.africa</a>. Security incidents:{" "}
              <a className="link-muted" href="mailto:glodie@aftech.africa">glodie@aftech.africa</a>.
            </p>

            <div className="d-flex align-items-center gap-2">
              <a href="#terms" className="btn btn-outline-dark btn-sm btn-slim">↑ Back to Terms</a>
              <Link to="/login" className="btn btn-secondary btn-sm btn-slim">← Back to Login</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
