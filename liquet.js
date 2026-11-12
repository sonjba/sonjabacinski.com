/* =========================================
   LIQUET INTERACTIVE EXPLORER
   Stage navigation and evidence presentation
   ========================================= */

(() => {
  "use strict";

  const root = document.getElementById("liquet-explorer");

  // Safe to do nothing on pages that do not contain the explorer.
  if (!root) return;

  const stages = [
    {
      title: "The records arrive.",
      subtitle: "INGESTION AND VALIDATION",
      date: "Before matching",
      status: "INPUT · Records received",
      bank: "Bank statement",
      book: "Firm cash entries",
      connection: "SOURCE RECORDS",
      caption: "Two sources. One reconciliation process.",
      description:
        "A bank statement and the firm's financial records arrive in their original formats. Liquet preserves the received files and fingerprints them so the original evidence can be traced.",
      detail:
        "Each source is converted once into Liquet's canonical format. Validation checks record structure, dates, totals and running balances where available. Original files remain preserved; downstream processing uses the canonical data.",
      events: [
        "Preserve original files",
        "Convert each source into canonical format",
        "Validate records and available balances"
      ],
      principle: "Preserve the evidence before interpreting it.",
      connectionActive: false
    },
    {
      title: "Rules match the records.",
      subtitle: "DETERMINISTIC RECONCILIATION",
      date: "Matching run",
      status: "RULES · Matching and findings",
      bank: "Bank line",
      book: "Cash entry",
      connection: "MATCHED_TO",
      caption: "A match is supported by an explicit rule.",
      description:
        "Liquet applies deterministic rules to reconcile financial records. Exact reference, amount and date matches are one case; a single bank line can also match several book entries when their combined amount agrees.",
      detail:
        "R1 checks exact matches. R3 handles group matching. R2a can raise a withholding-tax finding, and R5 can flag a trade settling after month-end. A finding is an exception to investigate, not a confirmed match.",
      events: [
        "R1 — Exact match",
        "R3 — Group match",
        "R2a / R5 — Create exception findings"
      ],
      principle: "Rules establish matches; exceptions remain explicit.",
      connectionActive: true
    },
    {
      title: "Exceptions stay open.",
      subtitle: "EVIDENCE BEFORE ASSUMPTIONS",
      date: "Open items",
      status: "OPEN · Further evidence required",
      bank: "NAIR P · £5,000",
      book: "Priya Nair · £5,000",
      connection: "CANDIDATE CHECK",
      caption: "Equal amounts do not prove identical transactions.",
      description:
        "Consider two £5,000 entries: Priya Nair's top-up and a separate Hart Family Trust cash entry. The bank line matches Priya's top-up. The Hart entry must not be matched to that same line just because the amounts agree.",
      detail:
        "In this illustrative case, R4 uses the bank text naming Nair to resolve the candidate. The competing Hart candidate is recorded as a rejected alternative with its reason. Open items remain open unless evidence resolves them.",
      events: [
        "Match the bank line to Priya's entry",
        "Reject the competing Hart candidate",
        "Preserve the outcome and its reason"
      ],
      principle: "A rejected candidate is not a reconciliation match.",
      connectionActive: false
    },
    {
      title: "The agent investigates.",
      subtitle: "A PROPOSAL GROUNDED IN EVIDENCE",
      date: "Investigation",
      status: "PROPOSAL · Awaiting validation and review",
      bank: "Open item + relevant bank evidence",
      book: "Related entries + prior rule outcomes",
      connection: "EVIDENCE EXAMINED",
      caption: "The agent proposes; validation checks.",
      description:
        "The agent receives the facts about an open item, relevant records on the other side and group totals. It proposes an explanation based on the supplied evidence rather than treating a plausible story as proof.",
      detail:
        "Possible explanations include IN TRANSITU for timing differences, OMISSUM for an expected item missing from the other side, and ERRATUM for a recording error. If evidence is insufficient, the agent can return NON LIQUET. Code checks the proposal, allowed types and any proposed adjustment before review.",
      events: [
        "Gather facts about the open item",
        "Propose an explanation and adjustment",
        "Validate the proposal before review"
      ],
      principle: "The agent proposes; deterministic checks enforce constraints.",
      connectionActive: false
    },
    {
      title: "A person decides.",
      subtitle: "HUMAN APPROVAL AND AUDIT TRAIL",
      date: "Review",
      status: "REVIEW · Human decision required",
      bank: "Evidence + proposed finding",
      book: "Decision + reason",
      connection: "DECIDES",
      caption: "A proposal is not an authorised decision.",
      description:
        "A person reviews the proposed finding or adjustment and chooses to approve or reject it. The system keeps the agent's proposal distinct from the human decision.",
      detail:
        "The decision records the reviewer, timestamp, outcome and reason. The original proposal and the decision remain part of the audit trail, rather than being silently overwritten.",
      events: [
        "Inspect the evidence and proposal",
        "Approve or reject with a reason",
        "Preserve the decision history"
      ],
      principle: "Human authority stays separate from agent output.",
      connectionActive: true
    },
    {
      title: "Close the month.",
      subtitle: "CARRY FORWARD UNRESOLVED ITEMS",
      date: "Month-end and the next run",
      status: "CLOSE · Monthly history preserved",
      bank: "July bank evidence",
      book: "June carried item",
      connection: "CLEARED_BY · PLANNED",
      caption: "A later event may resolve an earlier open item.",
      description:
        "The final run for June carries unresolved items into the next month with their reasons and history. The next run checks carried items first, so later evidence can resolve a timing difference.",
      detail:
        "For example, a trade or cash movement may settle after month-end. A cross-month CLEARED_BY relationship is part of the planned graph model; this demonstration does not claim that the full temporal graph or cross-month clearing feature is already implemented.",
      events: [
        "Mark the monthly run final",
        "Carry open items with their reasons",
        "Check carried items in the next run"
      ],
      principle: "Closing a month preserves unresolved evidence; it does not erase it.",
      connectionActive: false
    }
  ];

  const elements = {
    stepCount: root.querySelector("#liquet-step-count"),
    progress: root.querySelector("#liquet-progress"),
    progressFill: root.querySelector("#liquet-progress-fill"),
    stageButtons: [
      ...root.querySelectorAll(".liquet-stage-button")
    ],
    subtitle: root.querySelector("#liquet-subtitle"),
    title: root.querySelector("#liquet-stage-title"),
    date: root.querySelector("#liquet-stage-date"),
    bank: root.querySelector("#liquet-bank-text"),
    book: root.querySelector("#liquet-book-text"),
    connection: root.querySelector("#liquet-connection-label"),
    connectionLine: root.querySelector(
      ".liquet-diagram-connection"
    ),
    caption: root.querySelector("#liquet-diagram-caption"),
    bankNode: root.querySelector("#liquet-bank-node"),
    bookNode: root.querySelector("#liquet-book-node"),
    status: root.querySelector("#liquet-status"),
    description: root.querySelector("#liquet-description"),
    events: root.querySelector("#liquet-event-list"),
    principle: root.querySelector("#liquet-principle-text"),
    detailToggle: root.querySelector("#liquet-detail-toggle"),
    detailLabel: root.querySelector("#liquet-detail-label"),
    detailIcon: root.querySelector("#liquet-detail-icon"),
    detailContent: root.querySelector("#liquet-detail-content"),
    detailText: root.querySelector("#liquet-detail-text"),
    back: root.querySelector("#liquet-back"),
    next: root.querySelector("#liquet-next"),
    hint: root.querySelector("#liquet-control-hint")
  };

  let currentStage = 0;

  function closeDetail() {
    elements.detailContent.hidden = true;
    elements.detailToggle.setAttribute("aria-expanded", "false");
    elements.detailLabel.textContent =
      "Explore the technical detail";
    elements.detailIcon.textContent = "+";
  }

  function renderStage(index) {
    // Keep the requested stage within the available range.
    currentStage = Math.max(
      0,
      Math.min(index, stages.length - 1)
    );

    const stage = stages[currentStage];
    const stepNumber = currentStage + 1;
    const progress = (stepNumber / stages.length) * 100;

    // Update the heading and evidence diagram.
    elements.subtitle.textContent = stage.subtitle;
    elements.title.textContent = stage.title;
    elements.date.textContent = stage.date;
    elements.bank.textContent = stage.bank;
    elements.book.textContent = stage.book;
    elements.connection.textContent = stage.connection;
    elements.caption.textContent = stage.caption;
    elements.status.textContent = stage.status;
    elements.description.textContent = stage.description;
    elements.detailText.textContent = stage.detail;
    elements.principle.textContent = stage.principle;

    // Visually distinguish an established match from other evidence.
    elements.bankNode.classList.toggle(
      "is-highlighted",
      stage.connectionActive
    );
    elements.bookNode.classList.toggle(
      "is-highlighted",
      stage.connectionActive
    );
    elements.connectionLine.classList.toggle(
      "is-connected",
      stage.connectionActive
    );

    // Update accessible progress information.
    elements.stepCount.textContent =
      `STEP ${stepNumber} OF ${stages.length}`;

    elements.progress.setAttribute(
      "aria-valuenow",
      String(stepNumber)
    );

    elements.progressFill.style.width = `${progress}%`;

    // Update the clickable stage navigation.
    elements.stageButtons.forEach((button, buttonIndex) => {
      const isCurrent = buttonIndex === currentStage;

      button.classList.toggle("is-active", isCurrent);

      if (isCurrent) {
        button.setAttribute("aria-current", "step");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    // Rebuild the checklist using text nodes, not HTML injection.
    elements.events.replaceChildren();

    stage.events.forEach((event) => {
      const item = document.createElement("li");
      item.textContent = event;
      elements.events.appendChild(item);
    });

    // Update navigation controls.
    elements.back.disabled = currentStage === 0;

    if (currentStage === stages.length - 1) {
      elements.next.textContent = "↺ Replay journey";
      elements.hint.textContent =
        "Return to the beginning to explore again.";
    } else {
      elements.next.textContent = "Next stage →";
      elements.hint.textContent =
        "Explore the journey at your own pace.";
    }

    closeDetail();
  }

  // Navigate to a specific stage by clicking its numbered tab.
  elements.stageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const requestedStage = Number(button.dataset.stage);

      if (
        Number.isInteger(requestedStage) &&
        requestedStage >= 0 &&
        requestedStage < stages.length
      ) {
        renderStage(requestedStage);
      }
    });
  });

  elements.back.addEventListener("click", () => {
    if (currentStage > 0) {
      renderStage(currentStage - 1);
    }
  });

  elements.next.addEventListener("click", () => {
    if (currentStage === stages.length - 1) {
      renderStage(0);
    } else {
      renderStage(currentStage + 1);
    }
  });

  // Expand or collapse the technical explanation.
  elements.detailToggle.addEventListener("click", () => {
    const isExpanded =
      elements.detailToggle.getAttribute("aria-expanded") === "true";

    elements.detailContent.hidden = isExpanded;

    elements.detailToggle.setAttribute(
      "aria-expanded",
      String(!isExpanded)
    );

    elements.detailLabel.textContent = isExpanded
      ? "Explore the technical detail"
      : "Hide technical detail";

    elements.detailIcon.textContent = isExpanded ? "+" : "−";
  });

  // Render the initial state.
  renderStage(0);
})();