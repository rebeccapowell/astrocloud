import { useId, useState } from "react";
import "./IntelligenceAtlas.css";

const layers = [
  {
    name: "Compute and energy",
    may: "Chips, memory and energy remain essential.",
    now: "Compute can sit on a laptop, in customer-owned servers at a colocation site, with a specialist host or in a hyperscaler. Ownership changes who bears utilisation and financing risk.",
    evidence:
      "Dell reports a growing number of customers buying its AI Factory systems.",
    source: "#source-private-adoption",
  },
  {
    name: "Models",
    may: "Frontier, local, open and specialised intelligence.",
    now: "Route work across local open models, private inference and paid APIs by quality, cost and privacy. Model choice and choice of personal assistant are separate decisions.",
    evidence:
      "Qwen models can be downloaded and run with local tools such as LM Studio.",
    source: "#source-qwen-local",
  },
  {
    name: "Identity and authority",
    may: "Permissions and governance form a layer.",
    now: "Every agent needs permission: whose account is it using, what can it access and which actions need approval?",
    evidence:
      "Microsoft explicitly proposes controls outside the model and authority scoped to the task.",
    source: "#source-microsoft",
  },
  {
    name: "Records and context",
    may: "Trusted records, knowledge of the business and customer relationships matter.",
    now: "I would keep this part of May's map. A new model still needs reliable records and an understanding of how the business works.",
    evidence:
      "May already identified business knowledge and customer relationships as possible lasting advantages.",
    source: "#source-may",
  },
  {
    name: "Production and verification",
    may: "Orchestration, evaluation and execution were grouped together.",
    now: "Software factories join planning, coding, testing and operation. Hosting choice and removal of human review are separate decisions; verification remains a constraint.",
    evidence:
      "Researchers describe working software factories, but still find problems with automated review of complex company code.",
    source: "#source-factory-review",
  },
  {
    name: "Distribution and personal agents",
    may: "Distribution and ownership of the workflow were possible sources of durable power.",
    now: "The assistant can become the customer's starting point, carrying memory and permissions across services. More model choice can coexist with dependence on one intermediary.",
    evidence:
      "Revolut starts inside the banking relationship. Grok Bot works across apps from a cloud computer.",
    source: "#source-grok-agent",
  },
  {
    name: "Products and organisations",
    may: "Generated workflows and AI-operated companies.",
    now: "An emerging operating model whose economics must include review, integration, maintenance and responsibility.",
    evidence:
      "Someone still has to choose the work, check the result and support the customer.",
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
        <p className="atlas-kicker">03 / Who keeps the value?</p>
        <h3 id={`${id}-title`}>What moved, and what needs a second look?</h3>
        <p>
          Choose a layer to see what I would keep from May and what I would
          change.
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
                <p className="atlas-kicker">In May</p>
                <p>{layers[active].may}</p>
              </div>
            )}
            {view !== "may" && (
              <div>
                <p className="atlas-kicker">Where I stand now</p>
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
        <summary>Read the whole ownership map</summary>
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
        "Lower prices need enough extra paying customers to cover the cost of running and improving the models.",
      ],
      [
        "Infrastructure owners",
        "Busy machines need paying customers if their owners are to cover equipment, power and operating costs.",
      ],
      [
        "Capital providers",
        "Investors and lenders need the business to generate enough money to pay them.",
      ],
    ],
    watch:
      "The cost of finished work, repeat customers and suppliers' profit margins.",
    limit:
      "Demand could expand enough to offset lower prices. Cheaper models alone do not establish a crisis.",
  },
  {
    title: "Revenue arrives late",
    trigger:
      "Customers adopt AI, but their payments fall short of the bills coming due.",
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
        "Who loses money depends on the security behind the loans and who promised to cover missed payments.",
      ],
      [
        "Households and communities",
        "Pensions, insurance, employment and local infrastructure can become channels of harm.",
      ],
    ],
    watch:
      "Customer payments, bills coming due and the cost of borrowing again.",
    limit:
      "The outcome depends on how the projects are financed and which businesses run into trouble.",
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
        "Enough paying work keeps the machines busy and covers borrowing and new investment.",
      ],
      [
        "Market structure",
        "Value may still concentrate around distribution, records, identity and access to capital.",
      ],
    ],
    watch:
      "Customers renewing at normal prices, useful work that pays for itself and suppliers earning more than they spend.",
    limit:
      "A productive boom can contain overpriced firms and failed projects. Growing demand does not make every company a good investment.",
  },
];

export function ExposureExplorer() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const path = paths[selected];
  return (
    <section className="intelligence-atlas" aria-labelledby={`${id}-title`}>
      <header>
        <p className="atlas-kicker">02 / Follow the money</p>
        <h3 id={`${id}-title`}>One technology, several financial outcomes</h3>
        <p>
          Choose a scenario to see how the benefits, costs and risks could
          spread.
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
        Adapted from <a href="#source-report">Brace for Impact</a>. These are
        possible outcomes.
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
