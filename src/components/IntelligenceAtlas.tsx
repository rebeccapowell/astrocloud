import { useId, useState } from "react";
import "./IntelligenceAtlas.css";

const layers = [
  {
    name: "Compute and energy",
    may: "The physical substrate remains strategic.",
    now: "Compute can sit on a laptop, in customer-owned servers at a colocation site, with a specialist host or in a hyperscaler. Ownership changes who bears utilisation and financing risk.",
    evidence:
      "Dell reports growth in its AI Factory customer count; this does not establish how much public-cloud spending was displaced.",
    source: "#source-private-adoption",
  },
  {
    name: "Models",
    may: "Frontier, local, open and specialised intelligence.",
    now: "Route work across local open models, private inference and paid APIs by quality, cost and privacy. Model choice and choice of personal assistant are separate decisions.",
    evidence:
      "Qwen weights and local packages are available. That does not establish adoption rates or frontier quality on every task.",
    source: "#source-qwen-local",
  },
  {
    name: "Identity and authority",
    may: "Permissions and governance form a layer.",
    now: "Authority crosses every layer: who sponsors the agent, what it can access and which actions require approval.",
    evidence:
      "Microsoft explicitly proposes controls outside the model and authority scoped to the task.",
    source: "#source-microsoft",
  },
  {
    name: "Records and context",
    may: "Systems of record retain trusted business data.",
    now: "Records matter alongside process knowledge, exceptions, customer relationships and evidence of outcomes.",
    evidence:
      "Owning a database alone does not guarantee control of the customer interface.",
    source: "#source-may",
  },
  {
    name: "Production and verification",
    may: "Orchestration, evaluation and execution were grouped together.",
    now: "Software factories join planning, coding, testing and operation. Hosting choice and removal of human review are separate decisions; verification remains a constraint.",
    evidence:
      "The September factory paper reports scoped deployments, while October review research finds weaknesses on complex and proprietary code.",
    source: "#source-factory-review",
  },
  {
    name: "Distribution and personal agents",
    may: "Distribution and ownership of the workflow were possible sources of durable power.",
    now: "The assistant can become the customer's starting point, carrying memory and permissions across services. More model choice can coexist with dependence on one intermediary.",
    evidence:
      "Revolut starts inside a financial relationship; Grok Bot offers agents operating across apps on cloud computers. Neither establishes a winner in personal agents.",
    source: "#source-grok-agent",
  },
  {
    name: "Products and organisations",
    may: "Generated workflows and AI-operated companies.",
    now: "An emerging operating model whose economics must include review, integration, maintenance and responsibility.",
    evidence:
      "A working demonstration is evidence of capability, not proof of an autonomous firm.",
    source: "#source-harness",
  },
];

export function MapExplorer() {
  const [view, setView] = useState<"compare" | "may" | "now">("compare");
  const [active, setActive] = useState(4);
  const id = useId();
  return (
    <section className="intelligence-atlas" aria-labelledby={`${id}-title`}>
      <header>
        <p className="atlas-kicker">04 / Who keeps the value?</p>
        <h3 id={`${id}-title`}>What moved, and what needs a second look?</h3>
        <p>
          Select a layer to compare the May thesis with this revision. These are
          editorial judgements, not measured market shares.
        </p>
      </header>
      <div className="atlas-switch" role="group" aria-label="Map view">
        {(
          [
            ["compare", "Compare"],
            ["may", "May 2026"],
            ["now", "Revised map"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => setView(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="atlas-map-grid">
        <nav aria-label="Ownership layers">
          {layers.map((layer, index) => (
            <button
              type="button"
              key={layer.name}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
              aria-controls={`${id}-detail`}
            >
              <span className="atlas-number">0{index + 1}</span>
              {layer.name}
            </button>
          ))}
        </nav>
        <div id={`${id}-detail`} aria-live="polite" aria-atomic="true">
          <h4>{layers[active].name}</h4>
          <div className="atlas-comparison">
            {view !== "now" && (
              <div>
                <p className="atlas-kicker">May thesis</p>
                <p>{layers[active].may}</p>
              </div>
            )}
            {view !== "may" && (
              <div>
                <p className="atlas-kicker">Revised judgement</p>
                <p>{layers[active].now}</p>
              </div>
            )}
          </div>
          <p className="atlas-evidence">
            {layers[active].evidence}{" "}
            <a href={layers[active].source}>Read the evidence</a>
          </p>
        </div>
      </div>
      <footer>
        Two forces cross the whole map: authority determines what may happen;
        finance determines what can continue to be funded.
      </footer>
      <details>
        <summary>Read every layer without using the controls</summary>
        {layers.map(layer => (
          <div key={layer.name}>
            <h4>{layer.name}</h4>
            <p>May: {layer.may}</p>
            <p>Revision: {layer.now}</p>
          </div>
        ))}
      </details>
    </section>
  );
}

const paths = [
  {
    title: "Useful AI, weak supplier margins",
    trigger: "Models become cheaper and customers automate more work.",
    steps: [
      [
        "Customers",
        "Lower costs can widen adoption and increase the work attempted.",
      ],
      [
        "Model suppliers",
        "Revenue depends on paid volume multiplied by the realised price, with serving and development costs deducted.",
      ],
      [
        "Infrastructure owners",
        "More usage helps only if contracts, utilisation and cash collections cover capital and operating costs.",
      ],
      [
        "Capital providers",
        "Returns still depend on actual cash generation and the terms of their claims.",
      ],
    ],
    watch:
      "Cost per accepted task, paid usage, gross margin and customer retention.",
    limit:
      "Demand could expand enough to offset lower prices. Cheaper models alone do not establish a crisis.",
  },
  {
    title: "Revenue arrives late",
    trigger:
      "Enterprise adoption grows, but cash receipts fall short of commitments.",
    steps: [
      [
        "Model suppliers",
        "Long-term capacity bills can fall due before customer revenue catches up.",
      ],
      [
        "Cloud and project companies",
        "A late payment, renegotiated lease or non-renewal can weaken expected project cash flows.",
      ],
      [
        "Lenders and guarantors",
        "Credit losses depend on collateral, guarantees, seniority and who ultimately bears the exposure.",
      ],
      [
        "Households and communities",
        "Pensions, insurance, employment and local infrastructure can become channels of harm.",
      ],
    ],
    watch:
      "Cash collections, customer concentration, lease maturities, guarantees and refinancing terms.",
    limit:
      "This is a possible transmission path. It gives neither a probability nor an estimate of losses.",
  },
  {
    title: "The buildout earns its keep",
    trigger:
      "Customers renew because measured gains exceed the full cost of adoption.",
    steps: [
      [
        "Operating businesses",
        "Reliable outcomes support repeat spending and free resources for new work.",
      ],
      [
        "Suppliers",
        "Healthy contracts fund serving costs and continued product development.",
      ],
      [
        "Infrastructure owners",
        "High utilisation and paying customers support debt service and reinvestment.",
      ],
      [
        "Market structure",
        "Value may still concentrate around distribution, records, identity and access to capital.",
      ],
    ],
    watch:
      "Renewals without promotional credits, full-cost ROI, free cash flow and returns on invested capital.",
    limit:
      "A productive boom can contain overpriced firms and failed projects. Sector growth does not validate every valuation.",
  },
];

export function ExposureExplorer() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const path = paths[selected];
  return (
    <section className="intelligence-atlas" aria-labelledby={`${id}-title`}>
      <header>
        <p className="atlas-kicker">03 / Follow the obligations</p>
        <h3 id={`${id}-title`}>One technology, several financial outcomes</h3>
        <p>
          Choose a scenario to trace its possible consequences. The paths are
          conceptual and do not represent specific contracts.
        </p>
      </header>
      <div
        className="atlas-switch"
        role="group"
        aria-label="Financial scenario"
      >
        {paths.map((p, i) => (
          <button
            type="button"
            key={p.title}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            {p.title}
          </button>
        ))}
      </div>
      <div aria-live="polite" aria-atomic="true">
        <p className="atlas-trigger">{path.trigger}</p>
        <ol className="atlas-path">
          {path.steps.map(([name, text], i) => (
            <li key={name}>
              <span className="atlas-number">0{i + 1}</span>
              <h4>{name}</h4>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="atlas-bottom">
          <p>
            <strong>Evidence to watch:</strong> {path.watch}
          </p>
          <p>{path.limit}</p>
        </div>
      </div>
      <footer>
        Inspired by the financial transmission mechanisms in{" "}
        <a href="#source-report">Brace for Impact</a>. The scenarios and their
        implications are my interpretation.
      </footer>
      <details>
        <summary>Read the alternative paths</summary>
        {paths
          .filter(p => p !== path)
          .map(p => (
            <div key={p.title}>
              <h4>{p.title}</h4>
              <p>{p.trigger}</p>
              <ol>
                {p.steps.map(([name, text]) => (
                  <li key={name}>
                    <strong>{name}:</strong> {text}
                  </li>
                ))}
              </ol>
              <p>{p.limit}</p>
            </div>
          ))}
      </details>
    </section>
  );
}

export function OutcomeCalculator() {
  const [attempts, setAttempts] = useState(100);
  const [cost, setCost] = useState(2);
  const [accepted, setAccepted] = useState(70);
  const [minutes, setMinutes] = useState(5);
  const [hourly, setHourly] = useState(50);
  const id = useId();
  const review = ((attempts * minutes) / 60) * hourly;
  const inference = attempts * cost;
  const successes = (attempts * accepted) / 100;
  const total = inference + review;
  const money = (n: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 2,
    }).format(n);
  const controls = [
    {
      label: "Attempts",
      value: attempts,
      set: setAttempts,
      min: 10,
      max: 1000,
      step: 10,
      unit: "",
    },
    {
      label: "Model and tool cost per attempt",
      value: cost,
      set: setCost,
      min: 0,
      max: 20,
      step: 0.5,
      unit: "£",
    },
    {
      label: "Accepted outcomes",
      value: accepted,
      set: setAccepted,
      min: 0,
      max: 100,
      step: 5,
      unit: "%",
    },
    {
      label: "Human review per attempt",
      value: minutes,
      set: setMinutes,
      min: 0,
      max: 60,
      step: 1,
      unit: "min",
    },
    {
      label: "Review cost per hour",
      value: hourly,
      set: setHourly,
      min: 0,
      max: 200,
      step: 5,
      unit: "£",
    },
  ];
  return (
    <section className="intelligence-atlas" aria-labelledby={`${id}-title`}>
      <header>
        <p className="atlas-kicker">02 / The economics of finished work</p>
        <h3 id={`${id}-title`}>
          Cheap tokens can still produce expensive work
        </h3>
        <p>
          An illustrative calculator. The defaults are invented assumptions, not
          market estimates. Adjust them to see the mechanism.
        </p>
      </header>
      <div className="atlas-calculator">
        <div>
          {controls.map((c, i) => (
            <label className="atlas-range" key={c.label} htmlFor={`${id}-${i}`}>
              <span>
                {c.label}
                <output htmlFor={`${id}-${i}`}>
                  {c.value} {c.unit}
                </output>
              </span>
              <input
                id={`${id}-${i}`}
                type="range"
                min={c.min}
                max={c.max}
                step={c.step}
                value={c.value}
                onChange={e => c.set(Number(e.target.value))}
              />
            </label>
          ))}
          <button
            type="button"
            onClick={() => {
              setAttempts(100);
              setCost(2);
              setAccepted(70);
              setMinutes(5);
              setHourly(50);
            }}
          >
            Reset assumptions
          </button>
        </div>
        <div className="atlas-result" aria-live="polite" aria-atomic="true">
          <p>Cost per accepted outcome</p>
          <strong>
            {successes > 0 ? money(total / successes) : "No accepted outcomes"}
          </strong>
          <dl>
            <div>
              <dt>Model and tools</dt>
              <dd>{money(inference)}</dd>
            </div>
            <div>
              <dt>Human review</dt>
              <dd>{money(review)}</dd>
            </div>
            <div>
              <dt>Total spend</dt>
              <dd>{money(total)}</dd>
            </div>
            <div>
              <dt>Expected accepted outcomes</dt>
              <dd>{Number(successes.toFixed(2))}</dd>
            </div>
          </dl>
        </div>
      </div>
      <details>
        <summary>Formula and assumptions</summary>
        <p>
          Total cost = attempts × cost per attempt + attempts × review minutes ÷
          60 × hourly review cost. Expected accepted outcomes = attempts ×
          acceptance rate. Divide total cost by expected accepted outcomes.
        </p>
        <p>
          Every attempt incurs review cost. A retry counts as another attempt.
          This simplified model excludes implementation, training,
          infrastructure, ongoing maintenance, correction after review and the
          value or severity of errors. Fractional outcomes represent
          expectations. Compare against a human baseline at the same quality
          level.
        </p>
        <p>
          A zero API bill does not make local inference free. Comparing owned
          hardware with a hosted service also requires hardware depreciation,
          power, hosting, support and utilisation. This illustration does not
          calculate those costs.
        </p>
      </details>
    </section>
  );
}
