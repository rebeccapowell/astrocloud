import { useId, useState } from "react";
import {
  convergenceEvidence,
  type EvidenceStatus,
} from "@/data/convergenceEvidence";
import "./IntelligenceAtlas.css";

const statuses = ["All", "Observed", "Emerging", "Mixed"] as const;

export default function ConvergenceAudit() {
  const [filter, setFilter] = useState<(typeof statuses)[number]>("All");
  const [selected, setSelected] = useState("token-economics");
  const id = useId();
  const visible = convergenceEvidence.filter(
    p => filter === "All" || p.status === filter
  );
  const active = visible.find(p => p.id === selected) ?? visible[0];
  const counts = (status: EvidenceStatus) =>
    convergenceEvidence.filter(p => p.status === status).length;
  return (
    <section
      className="intelligence-atlas convergence-audit"
      aria-labelledby={`${id}-title`}
    >
      <header>
        <p className="atlas-kicker">01 / Revisit the convergence map</p>
        <h3 id={`${id}-title`}>Several pressures from May are now visible</h3>
        <p>
          Choose a pressure to see the original expectation, dated evidence and
          what it establishes. Assessments as at 26 October 2026.
        </p>
      </header>
      <div className="convergence-counts">
        {statuses.slice(1).map(status => (
          <div key={status}>
            <strong>{counts(status as EvidenceStatus)}</strong>
            <span>{status}</span>
          </div>
        ))}
      </div>
      <div
        className="atlas-switch"
        role="group"
        aria-label="Filter convergence evidence"
      >
        {statuses.map(status => (
          <button
            key={status}
            type="button"
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>
      <div className="convergence-grid">
        <nav aria-label="Original convergence pressures">
          {visible.map(p => (
            <button
              key={p.id}
              type="button"
              aria-pressed={active.id === p.id}
              aria-controls={`${id}-detail`}
              onClick={() => setSelected(p.id)}
            >
              <span>{p.title}</span>
              <small>{p.status}</small>
            </button>
          ))}
        </nav>
        <div
          id={`${id}-detail`}
          className="convergence-detail"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="atlas-kicker">{active.status}</p>
          <h4>{active.conclusion}</h4>
          <p>
            <strong>May's expectation:</strong> {active.may}
          </p>
          <ol className="convergence-evidence">
            {active.evidence.map(e => (
              <li key={`${e.date}-${e.source}`}>
                <time>{e.date}</time>
                <p>
                  {e.fact} <a href={e.source}>Source</a>
                </p>
              </li>
            ))}
          </ol>
          <p>
            <strong>Why it matters:</strong> {active.meaning}
          </p>
          <p className="atlas-evidence">
            <strong>What this does not establish:</strong> {active.reservation}
          </p>
        </div>
      </div>
      <footer>
        <strong>How to read the labels:</strong> Observed means May's stated
        mechanism is visible in the evidence. Emerging means related signs are
        visible but the predicted change needs more evidence. Mixed means both
        supporting evidence and limits matter. These counts are editorial
        assessments, not a crash score or a probability.
      </footer>
      <details>
        <summary>Read all eight assessments without using the controls</summary>
        {convergenceEvidence.map(p => (
          <div key={p.id}>
            <h4>
              {p.title}: {p.status}
            </h4>
            <p>{p.conclusion}</p>
            <p>May: {p.may}</p>
            <ul>
              {p.evidence.map(e => (
                <li key={`${e.date}-${e.source}`}>
                  {e.date}: {e.fact} <a href={e.source}>Source</a>
                </li>
              ))}
            </ul>
            <p>{p.meaning}</p>
            <p>{p.reservation}</p>
          </div>
        ))}
      </details>
    </section>
  );
}
