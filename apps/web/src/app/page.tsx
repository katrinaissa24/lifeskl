import Link from "next/link";
import { LandingDemo } from "@/components/LandingDemo";

// Catalog copy for the marketing page. Deliberately static (aspirational
// lesson counts, instant static render) — the real course data lives in
// Supabase and drives /dashboard.
const CATALOG = [
  { slug: "personal-finance",       title: "Personal Finance",       desc: "Budgeting, saving, credit, investing & taxes.",      meta: "35 lessons" },
  { slug: "how-to-learn",           title: "How to Learn",           desc: "Study skills, focus, memory & learning anything.",   meta: "35 lessons" },
  { slug: "emotional-intelligence", title: "Emotional Intelligence", desc: "Self-awareness, empathy, self-control & conflict.",  meta: "35 lessons" },
  { slug: "health",                 title: "Health & Mind",          desc: "Stress, sleep, anxiety, habits & burnout.",          meta: "35 lessons" },
  { slug: "relationships",          title: "Relationships",          desc: "Boundaries, conflict, communication & dating.",      meta: "35 lessons" },
  { slug: "digital",                title: "Digital Life",           desc: "Privacy, scams, passwords & staying safe online.",   meta: "35 lessons" },
  { slug: "career",                 title: "Career & Work",          desc: "Resumes, interviews, negotiation & email.",          meta: "35 lessons" },
];

const TICKER_ITEMS = [
  "How to file taxes", "Read a payslip", "Negotiate a salary", "Sign a lease",
  "Set a boundary", "Build credit", "Cook a real meal", "Spot a scam",
];

function TickerRun() {
  return (
    <span>
      {TICKER_ITEMS.map((item) => (
        <span key={item}>
          {item} <i>✦</i>
        </span>
      ))}
    </span>
  );
}

export default function LandingPage() {
  return (
    <>
      <nav className="nav">
        <div className="wrap nav-inner">
          <Link className="logo" href="/">
            <span className="dot" />
            LIFE<em>SKL</em>
          </Link>
          <div className="nav-links">
            <a className="t" href="#why">Why</a>
            <a className="t" href="#catalog">Catalog</a>
            <a className="t" href="#try">Try a lesson</a>
            <Link className="t" href="/login">Log in</Link>
            <Link className="btn btn-primary btn-sm" href="/signup">
              Start free →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap hero-top">
          <div className="hero-left">
            <div className="kicker">
              <span className="ln" /> The syllabus school skipped
            </div>
            <h1>
              The <span className="accent-word">life skills</span> they never{" "}
              <span className="outline-word">graded</span> you on.
            </h1>
            <p className="hero-sub">
              Money, work, health, and the everyday admin of being a person —
              taught in five‑minute, hands‑on lessons.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary btn-lg" href="/signup">
                Start learning — free
              </Link>
              <a className="btn btn-out btn-lg" href="#catalog">
                See the catalog
              </a>
            </div>
          </div>
          <div className="hero-right">
            <div className="hr-stat">
              <span className="num"><em>7</em></span>
              <span className="desc">tracks, from taxes to mental health — the real curriculum.</span>
            </div>
            <div className="hr-stat">
              <span className="num"><em>5</em>min</span>
              <span className="desc">a lesson. Short enough to finish, dense enough to matter.</span>
            </div>
            <div className="hr-stat">
              <span className="num">120<em>k</em></span>
              <span className="desc">learners closing the gap school left wide open.</span>
            </div>
          </div>
        </div>
      </header>

      <div className="ticker">
        <div className="tk">
          <TickerRun />
          <TickerRun />
        </div>
      </div>

      {/* WHY */}
      <section className="sec why" id="why">
        <div className="wrap">
          <div className="sec-h">
            <div className="idx">01 — The gap</div>
            <h2>You aced the exam.<br />Then life set a pop quiz.</h2>
            <p className="lead">
              Thirteen years of school and not one lesson on the things
              adulthood demands weekly. We teach that.
            </p>
          </div>
          <div className="why-grid">
            <div className="why-cell">
              <div className="big">0</div>
              <h3>Lessons on money</h3>
              <p>You left school able to graph a parabola but not read a payslip or file a return.</p>
            </div>
            <div className="why-cell">
              <div className="big">68%</div>
              <h3>Feel unprepared</h3>
              <p>Most young adults say they finished school with no idea how to handle rent, taxes, or credit.</p>
            </div>
            <div className="why-cell">
              <div className="big">5m</div>
              <h3>Is all it takes</h3>
              <p>The same micro‑lesson loop that taught millions a language — pointed at real life instead.</p>
            </div>
            <div className="why-cell">
              <div className="big">∞</div>
              <h3>Times you&apos;ll use it</h3>
              <p>These aren&apos;t facts for a test. They&apos;re decisions you&apos;ll make for the rest of your life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRY */}
      <section className="sec" id="try">
        <div className="wrap">
          <div className="sec-h">
            <div className="idx">02 — Try it now</div>
            <h2>Don&apos;t take our word.<br />Take a lesson.</h2>
            <p className="lead">
              This is a real LIFESKL question. Tap an answer — that&apos;s the
              whole experience.
            </p>
          </div>
          <div className="demo-grid">
            <div className="demo-copy">
              <h2>Every lesson is a decision you&apos;ll actually face.</h2>
              <p>
                No lectures, no jargon. We put you in the moment, you make the
                call, and you learn why — in seconds.
              </p>
              <div className="note">↓ It&apos;s interactive. Go ahead.</div>
            </div>
            <LandingDemo />
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="sec" id="catalog">
        <div className="wrap">
          <div className="sec-h">
            <div className="idx">03 — The catalog</div>
            <h2>Seven tracks.<br />One real‑world degree.</h2>
            <p className="lead">
              Start anywhere. Each track is a sequence of short, interactive
              lessons that build on each other.
            </p>
          </div>
          <div>
            {CATALOG.map((c, i) => (
              <Link className="cat-row" href="/dashboard" key={c.slug}>
                <div className="ct-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="ct-title">{c.title}</div>
                <div className="ct-desc">{c.desc}</div>
                <div className="ct-meta">{c.meta} →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-h">
            <div className="idx">04 — How it works</div>
            <h2>Pick. Practice. Repeat.</h2>
            <p className="lead">A daily loop that&apos;s easy to keep and hard to quit.</p>
          </div>
          <div className="steps-wrap">
            <div className="steps">
              <div className="step">
                <div className="num">STEP 01</div>
                <h3>Pick a skill</h3>
                <p>Choose what life&apos;s asking of you right now — a new job, a first apartment, a budget that won&apos;t budge.</p>
              </div>
              <div className="step">
                <div className="num">STEP 02</div>
                <h3>Take a lesson</h3>
                <p>Five minutes, fully interactive. Real scenarios, instant feedback, zero lectures.</p>
              </div>
              <div className="step">
                <div className="num">STEP 03</div>
                <h3>Keep the streak</h3>
                <p>Come back daily, stack XP, and turn one‑off lessons into lasting, real‑life instinct.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className="sec final">
        <div className="wrap">
          <h2>Class is in session.</h2>
          <p>
            The curriculum school skipped — free to start, five minutes a day,
            finally on your side.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn-primary btn-lg" href="/signup">
              Start learning — free
            </Link>
            <a className="btn btn-out btn-lg" href="#catalog">
              Browse catalog
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-i">
          <Link className="logo" href="/" style={{ fontSize: "1.2rem" }}>
            <span className="dot" />
            LIFE<em>SKL</em>
          </Link>
          <span>The life skills school misses · LIFESKL.com</span>
          <span>© 2026 LIFESKL</span>
        </div>
      </footer>
    </>
  );
}
