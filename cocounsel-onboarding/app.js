/* Interactive tutorial. Logic matches src/lib/tutorial-state.ts and the onboarding steps. */
(function () {
  const CC = window.CC;
  const KEY = "cocounsel-onboarding-html-v1";
  const app = document.getElementById("app");

  const ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    skills: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 14l.7 1.8L21.5 16.5 19.7 17.2 19 19l-.7-1.8-1.8-.7 1.8-.7L19 14z"/></svg>',
    documents: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    sources: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  };

  function freshState() {
    return {
      step: 0,
      role: null,
      acknowledgedTrust: false,
      matterName: CC.chrome.defaults.matterName,
      practice: "",
      jurisdiction: CC.chrome.defaults.jurisdiction,
      documentIds: [],
      visitedZones: [],
      question: "",
      reportType: null,
      researchRan: false,
      planAdjusted: false,
      maxStep: 0,
      openedSources: [],
      selectedArguments: [],
      playbookStatus: null,
      playbookFix: null,
      openedCells: [],
      removedPlanSteps: [],
      verdicts: {},
      verifySubmitted: false,
      habitIds: [],
    };
  }

  function freshUi() {
    return {
      confirmReset: false,
      docId: null,
      tourZone: "chat",
      researchZone: "chat",
      planShown: 0,
      planRunning: false,
      readingSource: null,
      reportView: null,
      onlyReview: false,
      openCell: null,
      note: null,
    };
  }

  let state = freshState();
  let ui = freshUi();
  let planTimer = null;

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fill(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, function (_, key) {
      const value = vars[key];
      return value == null ? "" : String(value);
    });
  }

  function pad(index) {
    return String(index + 1).padStart(2, "0");
  }

  function allowed(list, ids) {
    const set = new Set(ids);
    return (Array.isArray(list) ? list : []).filter((item) => typeof item === "string" && set.has(item));
  }

  function sanitize(raw) {
    const base = freshState();
    if (!raw || typeof raw !== "object") return base;
    const step = typeof raw.step === "number" && raw.step >= 0 && raw.step < CC.steps.length ? Math.floor(raw.step) : 0;
    const role = CC.roles.some((item) => item.id === raw.role) ? raw.role : null;
    const practice = CC.practices.includes(raw.practice) ? raw.practice : "";
    const jurisdiction = CC.jurisdictions.includes(raw.jurisdiction) ? raw.jurisdiction : CC.chrome.defaults.jurisdiction;
    const reportType = raw.reportType === "concise" || raw.reportType === "expanded" ? raw.reportType : null;
    const verdicts = {};
    if (raw.verdicts && typeof raw.verdicts === "object") {
      CC.assertions.forEach((item) => {
        const verdict = raw.verdicts[item.id];
        if (verdict === "supports" || verdict === "does-not" || verdict === "treatment") verdicts[item.id] = verdict;
      });
    }
    const maxStep =
      typeof raw.maxStep === "number" && raw.maxStep >= 0 && raw.maxStep < CC.steps.length
        ? Math.max(Math.floor(raw.maxStep), step)
        : step;
    return {
      ...base,
      step,
      role,
      acknowledgedTrust: raw.acknowledgedTrust === true,
      matterName: typeof raw.matterName === "string" && raw.matterName.trim() ? raw.matterName.slice(0, 120) : base.matterName,
      practice,
      jurisdiction,
      documentIds: allowed(raw.documentIds, CC.documents.map((doc) => doc.id)),
      visitedZones: allowed(raw.visitedZones, CC.zones.map((zone) => zone.id)),
      question: typeof raw.question === "string" ? raw.question.slice(0, 800) : "",
      reportType,
      researchRan: raw.researchRan === true,
      planAdjusted: raw.planAdjusted === true,
      maxStep,
      openedSources: allowed(raw.openedSources, CC.sources.map((source) => source.id)),
      selectedArguments: allowed(raw.selectedArguments, CC.briefArguments.map((item) => item.id)),
      playbookStatus: raw.playbookStatus === "compliant" || raw.playbookStatus === "noncompliant" ? raw.playbookStatus : null,
      playbookFix: raw.playbookFix === "mutual" || raw.playbookFix === "delete-law" ? raw.playbookFix : null,
      openedCells: allowed(raw.openedCells, Object.keys(CC.tableCells)),
      removedPlanSteps: allowed(raw.removedPlanSteps, CC.researchPlanItems.map((item) => item.id)),
      verdicts,
      verifySubmitted: raw.verifySubmitted === true,
      habitIds: allowed(raw.habitIds, CC.habits.map((habit) => habit.id)),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { state: freshState(), error: null };
      return { state: sanitize(JSON.parse(raw)), error: null };
    } catch {
      return { state: freshState(), error: CC.chrome.loadError };
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      ui.note = CC.chrome.saveError;
    }
  }

  function promptChecks(current) {
    const question = current.question.trim();
    const persona = /you are a|act as|highly experienced|junior attorney|junior associate/i.test(question);
    const sentences = question.split(/[.?!]/).filter((part) => part.trim().length > 0);
    const hasFact = /late|deliver|waiver|terminat|profit|breach|cure/i.test(question);
    const named = current.jurisdiction.length > 0 && question.toLowerCase().includes(current.jurisdiction.toLowerCase());
    const short = question.length >= 40 && question.length <= 340 && sentences.length > 0 && sentences.length <= 2;
    const asks = question.includes("?") && (question.match(/\?/g) || []).length === 1;
    const copy = CC.prompt.checks;
    return [
      {
        id: "jurisdiction",
        ok: current.jurisdiction.length > 0,
        label: copy.jurisdiction.label,
        detail: copy.jurisdiction.detail,
      },
      {
        id: "named",
        ok: named,
        label: copy.named.label,
        detail: current.jurisdiction
          ? fill(copy.named.detailNamed, { jurisdiction: current.jurisdiction })
          : copy.named.detailMissing,
      },
      {
        id: "short",
        ok: short && asks,
        label: copy.short.label,
        detail: asks ? copy.short.detailAsks : copy.short.detailNoAsk,
      },
      {
        id: "fact",
        ok: hasFact,
        label: copy.fact.label,
        detail: copy.fact.detail,
      },
      {
        id: "persona",
        ok: question.length > 0 && !persona,
        label: copy.persona.label,
        detail: copy.persona.detail,
      },
      {
        id: "report",
        ok: current.reportType !== null,
        label: copy.report.label,
        detail: current.reportType === "expanded" ? copy.report.detailExpanded : copy.report.detailConcise,
      },
    ];
  }

  function skillExerciseComplete(current) {
    if (current.role === "litigator") {
      const wanted = CC.briefArguments.filter((item) => item.keep).map((item) => item.id).sort();
      const selected = current.selectedArguments.slice().sort();
      return wanted.length === selected.length && wanted.every((id, index) => id === selected[index]);
    }
    if (current.role === "transactional") return current.playbookStatus === "noncompliant" && current.playbookFix === "mutual";
    if (current.role === "inhouse") return current.openedCells.some((id) => CC.tableCells[id] && CC.tableCells[id].review);
    if (current.role === "researcher") return current.removedPlanSteps.includes("predict");
    return false;
  }

  function skillReady() {
    return true;
  }

  function verifyCorrect(current) {
    return CC.assertions.every((item) => current.verdicts[item.id] === item.answer);
  }

  function verifyReady() {
    return true;
  }

  function canContinue(current) {
    switch (current.step) {
      case 0:
        return current.role !== null;
      case 1:
        return current.acknowledgedTrust;
      case 2:
        return (
          current.matterName.trim().length > 0 &&
          current.practice.length > 0 &&
          current.jurisdiction.length > 0 &&
          CC.documents.every((doc) => current.documentIds.includes(doc.id))
        );
      case 3:
        return CC.zones.every((zone) => current.visitedZones.includes(zone.id));
      case 4:
        return promptChecks(current).every((check) => check.ok);
      case 5:
        return current.researchRan;
      case 6:
        return skillReady(current);
      case 7:
        return verifyReady(current);
      default:
        return true;
    }
  }

  function continueHint(current) {
    if (canContinue(current)) return null;
    const step = CC.steps[current.step];
    return step && step.continueHint ? step.continueHint : null;
  }

  function stopPlan() {
    ui.planRunning = false;
    if (planTimer) {
      clearTimeout(planTimer);
      planTimer = null;
    }
  }

  function leaveStep(step) {
    if (step === 5) stopPlan();
  }

  function enterStep(step) {
    if (step === 3) ui.tourZone = state.visitedZones[0] || "chat";
    if (step === 5) {
      ui.researchZone = "chat";
      ui.reportView = null;
      ui.planRunning = false;
      ui.planShown = state.researchRan ? CC.planSteps.length : 0;
      ui.readingSource = null;
    }
    if (step === 6) {
      ui.onlyReview = false;
      ui.openCell = null;
    }
    if (step === 7) ui.readingSource = null;
  }

  function goTo(index) {
    if (index < 0 || index > state.maxStep || index === state.step) return;
    leaveStep(state.step);
    state.step = index;
    enterStep(index);
    save();
    render({ focusLesson: true });
  }

  function advancePlan() {
    if (planTimer) clearTimeout(planTimer);
    planTimer = setTimeout(function () {
      if (!ui.planRunning) return;
      ui.planShown += 1;
      if (ui.planShown >= CC.planSteps.length) {
        ui.planRunning = false;
        state.planAdjusted = true;
        state.researchRan = true;
        save();
      }
      if (state.step === 5) render({ preserveScroll: true });
      if (ui.planRunning) advancePlan();
    }, 420);
  }

  function runResearch() {
    stopPlan();
    ui.planShown = 0;
    ui.planRunning = true;
    state.planAdjusted = false;
    state.researchRan = false;
    save();
    render({ preserveScroll: true });
    advancePlan();
  }

  function closeModals() {
    ui.confirmReset = false;
    ui.docId = null;
    ui.readingSource = null;
    ui.openCell = null;
    render({ preserveScroll: true });
  }

  function restart() {
    stopPlan();
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    state = freshState();
    const note = ui.note;
    ui = freshUi();
    ui.note = note && note.indexOf("could not") !== -1 ? note : null;
    render({ focusLesson: true });
  }

  function btn(label, action, extra) {
    const opts = extra || {};
    const classes = ["btn", opts.variant ? "btn-" + opts.variant : "", opts.block ? "btn-block" : "", opts.sm ? "btn-sm" : ""]
      .filter(Boolean)
      .join(" ");
    const attrs = [
      'type="button"',
      'class="' + classes + '"',
      'data-action="' + action + '"',
      opts.id ? 'data-id="' + esc(opts.id) + '"' : "",
      opts.value ? 'data-value="' + esc(opts.value) + '"' : "",
      opts.verdict ? 'data-verdict="' + esc(opts.verdict) + '"' : "",
      opts.test ? 'data-testid="' + esc(opts.test) + '"' : "",
      opts.pressed != null ? 'aria-pressed="' + (opts.pressed ? "true" : "false") + '"' : "",
      opts.disabled ? "disabled" : "",
      opts.force ? 'data-force-close="1"' : "",
    ]
      .filter(Boolean)
      .join(" ");
    return "<button " + attrs + ">" + label + "</button>";
  }

  function lessonHead(kicker, title, lede) {
    return (
      '<header><p class="kicker">' +
      esc(kicker) +
      '</p><h1 id="lesson-title" tabindex="-1">' +
      esc(title) +
      '</h1><p class="lede">' +
      esc(lede) +
      "</p></header>"
    );
  }

  function frame(active, selectable, inner) {
    const zones = CC.zones
      .map(function (zone) {
        const pressed = active === zone.id;
        const action = selectable ? ' data-action="select-zone" data-id="' + zone.id + '"' : "";
        return (
          '<button type="button" class="zone-btn" aria-pressed="' +
          pressed +
          '" data-testid="zone-' +
          zone.id +
          '"' +
          action +
          ">" +
          ICONS[zone.id] +
          esc(zone.label) +
          "</button>"
        );
      })
      .join("");
    return (
      '<div class="frame"><div class="frame-bar"><div class="frame-title"><span class="live-dot"></span><span class="brand-name" style="font-size:1rem">' +
      esc(CC.chrome.brand) +
      '</span><span class="sim-tag sim-tag-light">' +
      esc(CC.chrome.simulation) +
      '</span></div><p class="matter-name" data-matter>' +
      esc(state.matterName) +
      '</p></div><div class="frame-body"><nav class="zone-nav" aria-label="' +
      esc(CC.chrome.zonesLabel) +
      '">' +
      zones +
      '</nav><div class="frame-main">' +
      inner +
      "</div></div></div>"
    );
  }

  function checksHtml() {
    return promptChecks(state)
      .map(function (check) {
        return (
          '<li class="check' +
          (check.ok ? " is-ok" : "") +
          '"><span class="font">' +
          esc(check.ok ? CC.prompt.checks.ready : CC.prompt.checks.stillOpen) +
          esc(CC.prompt.checks.joiner) +
          esc(check.label) +
          "</span>" +
          (check.ok ? "" : '<span class="detail">' + esc(check.detail) + "</span>") +
          "</li>"
        );
      })
      .join("");
  }

  function cite(id) {
    const index = CC.sources.findIndex(function (source) {
      return source.id === id;
    });
    return (
      '<button type="button" class="cite" data-action="open-source" data-id="' +
      id +
      '" data-testid="cite-' +
      id +
      '">[' +
      (index + 1) +
      "]</button>"
    );
  }

  function reportSections(list) {
    return list
      .map(function (section) {
        const cites = section.cites
          .map(function (id) {
            return " " + cite(id);
          })
          .join("");
        return "<h3>" + esc(section.heading) + "</h3><p>" + esc(CC.report[section.field]) + cites + "</p>";
      })
      .join("");
  }

  function reportHtml() {
    const view = ui.reportView || state.reportType || "concise";
    const toggle = CC.reportTypes
      .map(function (type) {
        return btn(esc(type.label), "set-view", {
          value: type.id,
          sm: true,
          variant: view === type.id ? "" : "outline",
          pressed: view === type.id,
        });
      })
      .join("");
    const extra =
      view === "expanded"
        ? reportSections(CC.research.expandedSections)
        : '<p class="quiet">' + esc(CC.research.conciseNote) + "</p>";
    return (
      '<div class="report"><div class="spread"><h2>' +
      esc(CC.research.reportTitle) +
      '</h2><div class="wrap">' +
      toggle +
      '</div></div><p class="fine">' +
      esc(CC.research.reportDisclaimer) +
      "</p>" +
      reportSections(CC.research.sections) +
      extra +
      "</div>"
    );
  }

  function sourceList() {
    if (!CC.sources.length) return '<p class="quiet">' + esc(CC.research.noIllustrations) + "</p>";
    return (
      "<ul class=\"plan\">" +
      CC.sources
        .map(function (item, index) {
          const opened = state.openedSources.includes(item.id);
          return (
            '<li><button type="button" class="source-btn" data-action="open-source" data-id="' +
            item.id +
            '" data-testid="source-' +
            item.id +
            '"><span><span class="num">[' +
            (index + 1) +
            "] </span><span>" +
            esc(item.title) +
            '</span><span class="meta">' +
            esc(item.kind) +
            "</span></span><span class=\"" +
            (opened ? "opened" : "tiny") +
            '">' +
            esc(opened ? CC.research.opened : CC.research.unread) +
            "</span></button></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function welcome() {
    const cards = CC.roles
      .map(function (role) {
        const selected = state.role === role.id;
        return (
          '<button type="button" class="card role" data-action="select-role" data-id="' +
          role.id +
          '" data-testid="role-' +
          role.id +
          '" aria-pressed="' +
          selected +
          '"><div class="role-top"><h2>' +
          esc(role.title) +
          "</h2>" +
          (selected ? '<span class="badge">' + esc(CC.welcome.selected) + "</span>" : "") +
          '</div><p class="summary">' +
          esc(role.summary) +
          '</p><p class="practice-line">' +
          esc(fill(CC.welcome.practiceLine, { skills: role.skills.slice(0, 2).join(CC.welcome.skillJoin) })) +
          "</p></button>"
        );
      })
      .join("");
    const outline = CC.steps
      .map(function (step, index) {
        return '<li><span class="num">' + pad(index) + "</span>" + esc(step.label) + "</li>";
      })
      .join("");
    return (
      lessonHead(CC.welcome.kicker, CC.welcome.title, CC.welcome.lede) +
      '<p class="prose">' +
      esc(CC.welcome.intro) +
      '</p><div class="grid-2">' +
      cards +
      '</div><ol class="steps-ol">' +
      outline +
      "</ol>"
    );
  }

  function trust() {
    const principles = CC.trust.principles
      .map(function (item) {
        return '<section class="card"><h2>' + esc(item.title) + '</h2><p>' + esc(item.body) + "</p></section>";
      })
      .join("");
    const limits = CC.limits
      .map(function (limit) {
        return '<li><span class="dot"></span><span>' + esc(limit) + "</span></li>";
      })
      .join("");
    return (
      lessonHead(CC.trust.kicker, CC.trust.title, CC.trust.lede) +
      '<div class="grid-3">' +
      principles +
      '</div><section class="panel"><h2>' +
      esc(CC.trust.limitsTitle) +
      '</h2><p class="sub">' +
      esc(CC.trust.limitsIntro) +
      '</p><ul class="limits">' +
      limits +
      '</ul></section><label class="check-row"><input type="checkbox" data-action="ack-trust"' +
      (state.acknowledgedTrust ? " checked" : "") +
      "><span>" +
      esc(CC.trust.acknowledge.before) +
      '<span class="tip"><button type="button" class="tip-trigger">' +
      esc(CC.trust.acknowledge.term) +
      '</button><span class="tip-bubble" role="tooltip">' +
      esc(CC.trust.acknowledge.tip) +
      "</span></span>" +
      esc(CC.trust.acknowledge.after) +
      "</span></label>"
    );
  }

  function choiceButtons(values, current, action) {
    return values
      .map(function (value) {
        const on = current === value;
        return btn(esc(value), action, { value: value, variant: on ? "" : "outline", pressed: on, sm: true });
      })
      .join("");
  }

  function workspace() {
    const files = CC.documents
      .map(function (doc) {
        const added = state.documentIds.includes(doc.id);
        return (
          '<li class="file' +
          (added ? " is-on" : "") +
          '"><div class="check-row" style="box-shadow:none;padding:0;background:transparent"><input type="checkbox" data-action="toggle-doc" data-id="' +
          doc.id +
          '" aria-label="' +
          esc(fill(CC.workspace.addLabel, { title: doc.title })) +
          '"' +
          (added ? " checked" : "") +
          '><div class="file-body"><div class="wrap"><p style="margin:0;font-weight:600">' +
          esc(doc.title) +
          '</p><span class="badge badge-outline">' +
          esc(doc.kind) +
          '</span></div><p class="meta">' +
          esc(doc.length) +
          '</p><button type="button" class="btn-link" data-action="open-doc" data-id="' +
          doc.id +
          '">' +
          esc(CC.workspace.readExcerpt) +
          "</button></div></div></li>"
        );
      })
      .join("");
    return (
      lessonHead(CC.workspace.kicker, CC.workspace.title, CC.workspace.lede) +
      '<div class="split"><div class="stack"><div class="field"><label for="matter-name">' +
      esc(CC.workspace.matterLabel) +
      '</label><input id="matter-name" type="text" data-field="matterName" value="' +
      esc(state.matterName) +
      '" aria-invalid="' +
      (state.matterName.trim().length === 0) +
      '"><p id="matter-alert" class="alert"' +
      (state.matterName.trim() ? " hidden" : "") +
      ">" +
      esc(CC.workspace.matterError) +
      '</p></div><fieldset class="field"><legend>' +
      esc(CC.workspace.practiceLabel) +
      '</legend><div class="wrap">' +
      choiceButtons(CC.practices, state.practice, "set-practice") +
      '</div></fieldset><fieldset class="field"><legend>' +
      esc(CC.workspace.jurisdictionLabel) +
      '</legend><div class="wrap">' +
      choiceButtons(CC.jurisdictions, state.jurisdiction, "set-jurisdiction") +
      '</div></fieldset></div><div class="card"><div class="spread"><h2>' +
      esc(CC.workspace.filesTitle) +
      '</h2><p class="tiny">' +
      esc(fill(CC.workspace.filesCount, { added: state.documentIds.length, total: CC.documents.length })) +
      "</p></div>" +
      (state.documentIds.length === 0 ? '<p class="quiet">' + esc(CC.workspace.emptyFiles) + "</p>" : "") +
      '<ul class="plan" style="margin-top:0.75rem">' +
      files +
      "</ul></div></div>"
    );
  }

  function tour() {
    const zone = CC.zones.find(function (item) {
      return item.id === ui.tourZone;
    }) || CC.zones[0];
    const badges = CC.zones
      .map(function (item) {
        const opened = state.visitedZones.includes(item.id);
        return (
          '<span class="badge' +
          (opened ? "" : " badge-outline") +
          '">' +
          esc(fill(CC.tour.badge, { status: opened ? CC.tour.opened : CC.tour.notYet, label: item.label })) +
          "</span>"
        );
      })
      .join("");
    let extra = "";
    if (zone.id === "documents") {
      if (!state.documentIds.length) extra = '<p class="quiet">' + esc(CC.tour.noFiles) + "</p>";
      else {
        extra =
          "<ul>" +
          CC.documents
            .filter(function (doc) {
              return state.documentIds.includes(doc.id);
            })
            .map(function (doc) {
              return (
                '<li style="border-top:1px solid var(--border);padding:0.5rem 0"><strong>' +
                esc(doc.title) +
                '</strong><span class="quiet">' +
                esc(CC.tour.kindJoin) +
                esc(doc.kind) +
                "</span></li>"
              );
            })
            .join("") +
          "</ul>";
      }
    }
    if (zone.id === "sources") {
      extra =
        '<p class="card" style="color:var(--muted);font-size:0.875rem">' + esc(CC.tour.sourcesEmpty) + "</p>";
    }
    return (
      lessonHead(CC.tour.kicker, CC.tour.title, CC.tour.lede) +
      frame(
        ui.tourZone,
        true,
        '<div class="stack"><div class="pills">' + badges + "</div><div><h2>" + esc(zone.label) + '</h2><p class="quiet" style="max-width:36rem">' + esc(zone.note) + "</p></div>" + extra + "</div>"
      )
    );
  }

  function prompt() {
    const placeholder = CC.exampleQuestion(state.jurisdiction || CC.chrome.defaults.jurisdiction);
    return (
      lessonHead(CC.prompt.kicker, CC.prompt.title, CC.prompt.lede) +
      '<div class="compare"><figure class="card"><figcaption class="bad-cap">' +
      esc(CC.prompt.weakCaption) +
      '</figcaption><blockquote class="quote">' +
      esc(CC.classActionWeak) +
      '</blockquote></figure><figure class="card ring-good"><figcaption class="good-cap">' +
      esc(CC.prompt.strongCaption) +
      '</figcaption><blockquote class="quote">' +
      esc(CC.classActionStrong) +
      '</blockquote></figure></div><p class="prose">' +
      esc(CC.prompt.contrast) +
      "</p>" +
      frame(
        "chat",
        false,
        '<div class="stack"><div class="wrap tiny"><span>' +
          esc(CC.prompt.engine) +
          '</span><span class="badge badge-outline">' +
          esc(state.jurisdiction || CC.prompt.noJurisdiction) +
          "</span><span>" +
          esc(CC.prompt.changeJurisdiction) +
          '</span></div><div class="wrap">' +
          choiceButtons(CC.jurisdictions, state.jurisdiction, "set-jurisdiction") +
          '</div><textarea id="question" data-field="question" aria-label="' +
          esc(CC.prompt.questionLabel) +
          '" placeholder="' +
          esc(placeholder) +
          '">' +
          esc(state.question) +
          '</textarea><div class="wrap">' +
          btn(esc(CC.prompt.insertExample), "insert-example", { variant: "outline", test: "insert-example" }) +
          '<div class="wrap">' +
          CC.reportTypes
            .map(function (type) {
              return btn(esc(type.label), "set-report", {
                value: type.id,
                variant: state.reportType === type.id ? "" : "outline",
                pressed: state.reportType === type.id,
              });
            })
            .join("") +
          '</div></div><p class="tiny">' +
          esc(CC.prompt.reportHelp) +
          "</p></div>"
      ) +
      '<ul class="checks" id="prompt-checks">' +
      checksHtml() +
      "</ul>"
    );
  }

  function research() {
    const revealed = ui.planRunning || state.researchRan || ui.planShown > 0;
    const planDone = (ui.planRunning || state.researchRan || ui.planShown >= CC.planSteps.length) && ui.planShown >= CC.planSteps.length;
    let body = "";
    if (ui.researchZone === "documents") {
      body = state.documentIds.length
        ? '<p class="quiet">' + esc(fill(CC.research.filesInWorkspace, { count: state.documentIds.length })) + "</p>"
        : '<p class="quiet">' + esc(CC.research.noDocuments) + "</p>";
    } else if (ui.researchZone === "skills") {
      body = '<p class="quiet">' + esc(CC.research.skillsNote) + "</p>";
    } else if (ui.researchZone === "sources") {
      body = state.researchRan
        ? sourceList()
        : '<p class="card" style="color:var(--muted);font-size:0.875rem">' + esc(CC.research.sourcesEmpty) + "</p>";
    } else {
      const steps = CC.planSteps
        .slice(0, revealed ? ui.planShown : 0)
        .map(function (step, index) {
          const removed = step.bad && state.planAdjusted;
          return (
            '<li class="plan-item' +
            (step.bad && !removed ? " is-bad" : "") +
            '"><span class="plan-copy' +
            (removed ? " struck" : "") +
            '"><span class="num">' +
            (index + 1) +
            "</span><span>" +
            esc(step.text) +
            (step.bad && !removed && planDone
              ? '<button type="button" class="warn" data-action="drop-predict">' + esc(CC.research.removePredict) + "</button>"
              : "") +
            "</span></span>" +
            (step.bad && planDone && !removed
              ? btn(esc(CC.research.removeStep), "drop-predict", { sm: true, test: "drop-predict" })
              : "") +
            (step.bad && removed ? '<span class="opened">' + esc(CC.research.removed) + "</span>" : "") +
            "</li>"
          );
        })
        .join("");
      const view = ui.reportView || state.reportType || "concise";
      body =
        '<p id="research-question">' +
        esc(state.question.trim() || CC.research.questionFallback) +
        '</p><div class="wrap">' +
        btn(esc(state.researchRan ? CC.research.runAgain : CC.research.run), "run-research", {
          test: "run-research",
          disabled: ui.planRunning && !planDone,
        }) +
        '<span class="badge badge-outline">' +
        esc(state.jurisdiction) +
        '</span><span class="badge badge-outline">' +
        esc(view) +
        '</span></div><p class="quiet" data-testid="research-status">' +
        esc(
          state.researchRan
            ? fill(CC.research.statusRan, { opened: state.openedSources.length })
            : CC.research.statusIdle
        ) +
        "</p>" +
        (ui.planRunning && !planDone ? '<p class="quiet">' + esc(CC.research.proposing) + "</p>" : "") +
        '<ol class="plan">' +
        steps +
        "</ol>" +
        (planDone && state.planAdjusted && !state.researchRan
          ? btn(esc(CC.research.draftReport), "draft-report", { test: "draft-report" })
          : "") +
        (state.researchRan ? reportHtml() : "");
    }
    return (
      lessonHead(CC.research.kicker, CC.research.title, CC.research.lede) +
      frame(ui.researchZone, true, '<div class="stack">' + body + "</div>") +
      '<p class="quiet">' +
      esc(
        fill(CC.research.progressNote, {
          plan: state.planAdjusted ? CC.research.planRemoved : CC.research.planPending,
          opened: state.openedSources.length,
        })
      ) +
      "</p>"
    );
  }

  function skillBody() {
    if (state.role === "litigator") {
      const items = CC.briefArguments
        .map(function (item) {
          const on = state.selectedArguments.includes(item.id);
          return (
            '<li class="arg" style="padding:0"><button type="button" class="arg" data-action="toggle-argument" data-id="' +
            item.id +
            '" aria-pressed="' +
            on +
            '"><span style="font-weight:600">' +
            esc(item.title) +
            '</span><span class="meta">' +
            esc(item.detail) +
            "</span></button>" +
            (on && !item.keep ? '<p class="alert" style="padding:0 0.75rem 0.75rem">' + esc(item.reason) + "</p>" : "") +
            "</li>"
          );
        })
        .join("");
      return (
        "<div><h2>" +
        esc(CC.skill.litigator.title) +
        '</h2><p class="quiet">' +
        esc(CC.skill.litigator.body) +
        '</p><ul class="plan" style="margin-top:1rem">' +
        items +
        "</ul>" +
        (skillExerciseComplete(state)
          ? '<p class="success">' + esc(CC.skill.litigator.developed) + "</p>"
          : "") +
        "</div>"
      );
    }
    if (state.role === "transactional") {
      return (
        "<div><h2>" +
        esc(CC.skill.transactional.title) +
        '</h2><p class="quiet">' +
        esc(CC.skill.transactional.body) +
        '</p><blockquote class="clause">' +
        esc(CC.assignmentClause) +
        "</blockquote><ul class=\"rules\">" +
        CC.playbookRules.map(function (rule) { return "<li>" + esc(rule) + "</li>"; }).join("") +
        '</ul><div class="wrap" style="margin-top:0.75rem">' +
        CC.skill.transactional.statuses
          .map(function (option) {
            return btn(esc(option.label), "playbook-status", {
              value: option.id,
              variant: state.playbookStatus === option.id ? "" : "outline",
            });
          })
          .join("") +
        "</div>" +
        (state.playbookStatus === "compliant"
          ? '<p class="alert">' + esc(CC.skill.transactional.compliantWarning) + "</p>"
          : "") +
        (state.playbookStatus === "noncompliant"
          ? '<div class="stack" style="margin-top:1rem"><p style="margin:0;font-weight:600;font-size:0.875rem">' +
            esc(CC.skill.transactional.markupPrompt) +
            "</p>" +
            CC.skill.transactional.fixes
              .map(function (option) {
                return btn(esc(option.label), "playbook-fix", {
                  value: option.id,
                  block: true,
                  variant: state.playbookFix === option.id ? "" : "outline",
                });
              })
              .join("") +
            (state.playbookFix === "delete-law"
              ? '<p class="alert">' + esc(CC.skill.transactional.wrongFix) + "</p>"
              : "") +
            "</div>"
          : "") +
        "</div>"
      );
    }
    if (state.role === "inhouse") {
      const rows = CC.tableQuestions
        .map(function (question) {
          const cells = CC.tableColumns
            .map(function (column) {
              const id = question.id + "-" + column.id;
              const data = CC.tableCells[id];
              if (ui.onlyReview && !data.review) return '<td class="quiet">' + esc(CC.skill.inhouse.emptyCell) + "</td>";
              return (
                '<td><button type="button" class="cell-btn" data-action="open-cell" data-id="' +
                id +
                '"><span style="font-weight:600">' +
                esc(data.value) +
                "</span>" +
                (data.review ? ' <span class="badge badge-outline">' + esc(CC.skill.inhouse.needsReview) + "</span>" : "") +
                "</button></td>"
              );
            })
            .join("");
          return "<tr><th scope=\"row\" style=\"font-weight:400\">" + esc(question.question) + "</th>" + cells + "</tr>";
        })
        .join("");
      return (
        "<div><h2>" +
        esc(CC.skill.inhouse.title) +
        '</h2><p class="quiet">' +
        esc(CC.skill.inhouse.body) +
        "</p>" +
        btn(esc(ui.onlyReview ? CC.skill.inhouse.showingNeedsReview : CC.skill.inhouse.showNeedsReview), "toggle-review", {
          variant: ui.onlyReview ? "" : "outline",
        }) +
        '<div class="table-wrap"><table><thead><tr><th>' +
        esc(CC.skill.inhouse.questionHeader) +
        "</th>" +
        CC.tableColumns.map(function (column) { return "<th>" + esc(column.name) + "</th>"; }).join("") +
        "</tr></thead><tbody>" +
        rows +
        "</tbody></table></div></div>"
      );
    }
    if (state.role === "researcher") {
      const items = CC.researchPlanItems
        .map(function (item) {
          const inPlan = !state.removedPlanSteps.includes(item.id);
          return (
            '<li class="check-row"><input type="checkbox" data-action="toggle-plan" data-id="' +
            item.id +
            '"' +
            (inPlan ? " checked" : "") +
            "><span>" +
            esc(item.label) +
            (item.bad && inPlan
              ? '<span class="alert" style="display:block;margin-top:0.25rem">' + esc(CC.skill.researcher.badWarning) + "</span>"
              : "") +
            "</span></li>"
          );
        })
        .join("");
      return (
        "<div><h2>" +
        esc(CC.skill.researcher.title) +
        '</h2><p class="quiet">' +
        esc(CC.skill.researcher.body) +
        '</p><ul class="plan" style="margin-top:1rem">' +
        items +
        "</ul></div>"
      );
    }
    return '<p class="quiet">' + esc(CC.skill.noRole) + "</p>";
  }

  function skill() {
    const role = CC.roles.find(function (item) {
      return item.id === state.role;
    });
    const map = CC.skillMap
      .map(function (group) {
        return (
          '<section class="map"><h2>' +
          esc(group.group) +
          "</h2><ul>" +
          group.items.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") +
          "</ul></section>"
        );
      })
      .join("");
    return (
      lessonHead(role ? role.title : CC.skill.kicker, CC.skill.title, CC.skill.lede) +
      frame("skills", false, skillBody() + (skillReady(state) ? '<p class="ready">' + esc(CC.skill.ready) + "</p>" : "")) +
      '<div class="grid-4">' +
      map +
      "</div>"
    );
  }

  function verify() {
    const items = CC.assertions
      .map(function (item, index) {
        const cited = CC.sources.find(function (source) {
          return source.id === item.sourceId;
        });
        const picked = state.verdicts[item.id];
        const right = picked === item.answer;
        const choices = CC.verdicts
          .map(function (verdict) {
            return btn(esc(verdict.label), "set-verdict", {
              id: item.id,
              verdict: verdict.id,
              block: true,
              variant: picked === verdict.id ? "" : "outline",
              pressed: picked === verdict.id,
            });
          })
          .join("");
        return (
          '<li class="card"><p class="tiny" style="font-weight:700;letter-spacing:0.04em;text-transform:uppercase">' +
          esc(fill(CC.verify.sentenceLabel, { n: index + 1 })) +
          '</p><p>' +
          esc(item.claim) +
          '</p><button type="button" class="btn-link" data-action="open-source" data-id="' +
          item.sourceId +
          '">' +
          esc(fill(CC.verify.openSource, { title: cited ? cited.title : CC.verify.missingSource })) +
          '</button><div class="wrap" style="margin-top:0.75rem">' +
          choices +
          "</div>" +
          (state.verifySubmitted
            ? '<p class="' + (right ? "ready" : "alert") + '">' + esc(right ? CC.verify.match : item.why) + "</p>"
            : "") +
          "</li>"
        );
      })
      .join("");
    const missing = CC.assertions.some(function (item) {
      return !state.verdicts[item.id];
    });
    return (
      lessonHead(CC.verify.kicker, CC.verify.title, CC.verify.lede) +
      '<ol class="plan">' +
      items +
      '</ol><div class="wrap">' +
      btn(esc(CC.verify.checkCalls), "check-calls", { test: "check-calls", disabled: missing }) +
      (verifyReady(state) ? '<p class="ready">' + esc(CC.verify.coaching) + "</p>" : "") +
      (state.verifySubmitted && verifyCorrect(state) ? '<p class="ready">' + esc(CC.verify.allHold) + "</p>" : "") +
      "</div>"
    );
  }

  function finish() {
    const role = CC.roles.find(function (item) {
      return item.id === state.role;
    });
    const files = CC.documents.filter(function (doc) {
      return state.documentIds.includes(doc.id);
    });
    const habits = CC.habits
      .map(function (habit) {
        const on = state.habitIds.includes(habit.id);
        return (
          '<li><label class="check-row"><input type="checkbox" data-action="toggle-habit" data-id="' +
          habit.id +
          '"' +
          (on ? " checked" : "") +
          "><span>" +
          esc(habit.label) +
          "</span></label></li>"
        );
      })
      .join("");
    return (
      lessonHead(CC.finish.kicker, CC.finish.title, CC.finish.lede) +
      '<section class="panel"><p class="kicker">' +
      esc(CC.finish.dayOneKicker) +
      '</p><h2 class="dayone">' +
      esc(role ? role.dayOne : CC.finish.missingDayOne) +
      '</h2><dl class="stats"><div><dt>' +
      esc(CC.finish.matterPracticed) +
      "</dt><dd>" +
      esc(state.matterName) +
      "</dd></div><div><dt>" +
      esc(CC.finish.jurisdiction) +
      "</dt><dd>" +
      esc(state.jurisdiction) +
      '</dd></div><div><dt>' +
      esc(CC.finish.filesLabel) +
      "</dt><dd>" +
      esc(files.map(function (file) { return file.title; }).join(CC.finish.fileJoin) || CC.finish.noFiles) +
      '</dd></div></dl></section><section><h2 style="font-family:var(--serif);font-weight:500;font-size:1.5rem;margin:0">' +
      esc(CC.finish.habitsTitle) +
      '</h2><ul class="habit-list">' +
      habits +
      '</ul></section><button type="button" class="btn-text" data-action="reset-ask">' +
      esc(CC.finish.restart) +
      "</button>"
    );
  }

  const lessons = [welcome, trust, workspace, tour, prompt, research, skill, verify, finish];

  function navButtons(mobile) {
    return CC.steps
      .map(function (step, index) {
        const current = index === state.step;
        const done = index <= state.maxStep && index !== state.step;
        if (mobile) {
          return (
            '<button type="button" class="chip" data-action="goto" data-step="' +
            index +
            '"' +
            (current ? ' aria-current="step"' : "") +
            (index > state.maxStep ? " disabled" : "") +
            ">" +
            esc(step.label) +
            "</button>"
          );
        }
        return (
          '<button type="button" class="side-link' +
          (done ? " is-done" : "") +
          '" data-action="goto" data-step="' +
          index +
          '"' +
          (current ? ' aria-current="step"' : "") +
          (index > state.maxStep ? " disabled" : "") +
          '><span class="side-num">' +
          pad(index) +
          "</span>" +
          esc(step.label) +
          "</button>"
        );
      })
      .join("");
  }

  function sourceDialog(source, missingCopy) {
    return (
      '<div class="modal" data-action="close-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><h2 id="dialog-title">' +
      esc(source.title) +
      '</h2><p class="sub">' +
      esc(source.kind) +
      '</p><p class="illust">' +
      esc(CC.illustration.banner) +
      "</p>" +
      (source.flag
        ? '<p class="flag">' + esc(source.flag) + "</p>"
        : '<p class="alert" role="alert">' + esc(missingCopy) + "</p>") +
      '<p class="excerpt">' +
      esc(source.excerpt) +
      '</p><div class="dialog-actions">' +
      btn(esc(CC.chrome.close), "close-modal", { variant: "outline", force: true }) +
      "</div></div></div>"
    );
  }

  function modal() {
    if (ui.confirmReset) {
      return (
        '<div class="modal" data-action="close-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><h2 id="dialog-title">' +
        esc(CC.chrome.reset.title) +
        '</h2><p class="sub">' +
        esc(CC.chrome.reset.body) +
        '</p><div class="dialog-actions">' +
        btn(esc(CC.chrome.reset.keep), "reset-cancel", { variant: "outline" }) +
        btn(esc(CC.chrome.startOver), "reset-confirm") +
        "</div></div></div>"
      );
    }
    const doc = CC.documents.find(function (item) { return item.id === ui.docId; });
    if (doc) {
      return (
        '<div class="modal" data-action="close-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><h2 id="dialog-title">' +
        esc(doc.title) +
        '</h2><p class="sub">' +
        esc(fill(CC.workspace.excerptNote, { kind: doc.kind })) +
        '</p><p class="excerpt">' +
        esc(doc.excerpt) +
        '</p><div class="dialog-actions">' +
        btn(esc(CC.chrome.close), "close-modal", { variant: "outline", force: true }) +
        "</div></div></div>"
      );
    }
    const source = CC.sources.find(function (item) { return item.id === ui.readingSource; });
    if (source) {
      const missing =
        state.step === 7 ? CC.illustration.verifyMissingFlag : CC.illustration.researchMissingFlag;
      return sourceDialog(source, missing);
    }
    if (ui.openCell && CC.tableCells[ui.openCell]) {
      const cell = CC.tableCells[ui.openCell];
      return (
        '<div class="modal" data-action="close-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><h2 id="dialog-title">' +
        esc(CC.skill.inhouse.dialogTitle) +
        '</h2><p class="sub">' +
        esc(CC.skill.inhouse.dialogDescription) +
        '</p><p class="excerpt">' +
        esc(cell.excerpt) +
        '</p><div class="dialog-actions">' +
        btn(esc(CC.chrome.close), "close-modal", { variant: "outline", force: true }) +
        "</div></div></div>"
      );
    }
    return "";
  }

  function shell() {
    const hint = continueHint(state);
    const last = state.step === CC.steps.length - 1;
    const progress = (state.step / (CC.steps.length - 1)) * 100;
    return (
      '<div class="layout"><aside class="sidebar"><div class="brand"><p class="brand-name">' +
      esc(CC.chrome.brand) +
      '</p><p class="brand-note">' +
      esc(CC.chrome.brandNote) +
      '</p></div><nav class="side-nav" aria-label="' +
      esc(CC.chrome.navLabel) +
      '">' +
      navButtons(false) +
      '</nav><p class="disclaimer">' +
      esc(CC.chrome.disclaimer) +
      '</p></aside><div class="column"><header class="topbar"><div class="mobile-rule"></div><div class="top-row"><p class="mobile-brand">' +
      esc(CC.chrome.brand) +
      '<span class="sim-tag">' +
      esc(CC.chrome.simulation) +
      '</span></p><p class="step-label"><span class="sr-only">' +
      esc(CC.chrome.currentStep) +
      "</span>" +
      esc(fill(CC.chrome.stepProgress, { label: CC.steps[state.step].label, current: state.step + 1, total: CC.steps.length })) +
      "</p>" +
      btn(esc(CC.chrome.startOver), "reset-ask", { variant: "ghost", sm: true }) +
      '</div><nav class="mobile-steps" aria-label="' +
      esc(CC.chrome.navLabel) +
      '">' +
      navButtons(true) +
      '</nav><div class="progress" role="progressbar" aria-label="' +
      esc(CC.chrome.progressLabel) +
      '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      Math.round(progress) +
      '"><span style="width:' +
      progress +
      '%"></span></div>' +
      (ui.note ? '<p class="note">' + esc(ui.note) + "</p>" : "") +
      '</header><main class="lesson-wrap"><article class="lesson">' +
      lessons[state.step]() +
      '</article></main><footer class="footer"><div class="footer-row">' +
      btn(esc(CC.chrome.back), "back", { variant: "outline", disabled: state.step === 0 }) +
      '<p class="hint hint-desktop" data-hint>' +
      esc(hint || "") +
      "</p>" +
      btn(esc(last ? CC.chrome.startOver : CC.chrome.continue), "continue", { test: "continue", disabled: !last && !canContinue(state) }) +
      "</div>" +
      '<p class="hint hint-mobile" data-hint' +
      (hint ? "" : " hidden") +
      ">" +
      esc(hint || "") +
      "</p>" +
      "</footer></div></div>" +
      modal()
    );
  }

  function updateFooter() {
    const hint = continueHint(state);
    document.querySelectorAll("[data-hint]").forEach(function (el) {
      el.textContent = hint || "";
      if (el.classList.contains("hint-mobile")) el.hidden = !hint;
    });
    const cont = document.querySelector('[data-testid="continue"]');
    const last = state.step === CC.steps.length - 1;
    if (cont) cont.disabled = !last && !canContinue(state);
  }

  function render(opts) {
    if (state.step === 5 && state.planAdjusted && !state.researchRan) {
      state.researchRan = true;
      ui.planShown = CC.planSteps.length;
      save();
    }
    const options = opts || {};
    const main = document.querySelector("main");
    const scroll = options.preserveScroll && main ? main.scrollTop : 0;
    app.className = "";
    app.innerHTML = shell();
    const next = document.querySelector("main");
    if (next && options.preserveScroll) next.scrollTop = scroll;
    if (options.focusLesson) {
      const title = document.getElementById("lesson-title");
      if (title) title.focus();
    }
    if (document.querySelector(".dialog")) {
      const dialog = document.querySelector(".dialog");
      if (dialog) dialog.focus();
    }
  }

  function toggleList(list, id, on) {
    if (on) return list.includes(id) ? list : list.concat(id);
    return list.filter(function (item) { return item !== id; });
  }

  function onClick(event) {
    const el = event.target.closest("[data-action]");
    if (!el || el.matches("input, textarea")) return;
    const action = el.dataset.action;
    if (action === "close-modal") {
      if (event.target.closest(".dialog") && !el.dataset.forceClose) return;
      closeModals();
      return;
    }
    if (action === "goto") return goTo(Number(el.dataset.step));
    if (action === "back") return goTo(state.step - 1);
    if (action === "continue") {
      if (state.step === CC.steps.length - 1) {
        ui.confirmReset = true;
        render({ preserveScroll: true });
        return;
      }
      if (!canContinue(state)) return;
      leaveStep(state.step);
      state.step += 1;
      state.maxStep = Math.max(state.maxStep, state.step);
      enterStep(state.step);
      save();
      render({ focusLesson: true });
      return;
    }
    if (action === "reset-ask") {
      ui.confirmReset = true;
      render({ preserveScroll: true });
      return;
    }
    if (action === "reset-cancel") {
      ui.confirmReset = false;
      render({ preserveScroll: true });
      return;
    }
    if (action === "reset-confirm") return restart();
    if (action === "select-role") {
      const match = CC.roles.find(function (role) { return role.id === el.dataset.id; });
      state.role = el.dataset.id;
      state.practice = match ? match.practice : state.practice;
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "set-practice" || action === "set-jurisdiction") {
      if (action === "set-practice") state.practice = el.dataset.value;
      else state.jurisdiction = el.dataset.value;
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "open-doc") {
      ui.docId = el.dataset.id;
      render({ preserveScroll: true });
      return;
    }
    if (action === "select-zone") {
      if (state.step === 3) {
        ui.tourZone = el.dataset.id;
        state.visitedZones = toggleList(state.visitedZones, el.dataset.id, true);
        save();
      } else if (state.step === 5) {
        ui.researchZone = el.dataset.id;
      }
      render({ preserveScroll: true });
      return;
    }
    if (action === "insert-example") {
      state.question = CC.exampleQuestion(state.jurisdiction);
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "set-report") {
      state.reportType = el.dataset.value;
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "run-research") return runResearch();
    if (action === "drop-predict") {
      state.planAdjusted = true;
      state.researchRan = true;
      ui.planShown = Math.max(ui.planShown, CC.planSteps.length);
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "draft-report") {
      state.researchRan = true;
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "set-view") {
      ui.reportView = el.dataset.value;
      render({ preserveScroll: true });
      return;
    }
    if (action === "open-source") {
      ui.readingSource = el.dataset.id;
      state.openedSources = toggleList(state.openedSources, el.dataset.id, true);
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "toggle-argument") {
      const id = el.dataset.id;
      state.selectedArguments = toggleList(state.selectedArguments, id, !state.selectedArguments.includes(id));
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "playbook-status") {
      state.playbookStatus = el.dataset.value;
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "playbook-fix") {
      state.playbookFix = el.dataset.value;
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "toggle-review") {
      ui.onlyReview = !ui.onlyReview;
      render({ preserveScroll: true });
      return;
    }
    if (action === "open-cell") {
      ui.openCell = el.dataset.id;
      state.openedCells = toggleList(state.openedCells, el.dataset.id, true);
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "set-verdict") {
      state.verdicts = Object.assign({}, state.verdicts, { [el.dataset.id]: el.dataset.verdict });
      state.verifySubmitted = false;
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "check-calls") {
      state.verifySubmitted = true;
      save();
      render({ preserveScroll: true });
    }
  }

  function onChange(event) {
    const el = event.target;
    const action = el.dataset.action;
    if (!action) return;
    if (action === "ack-trust") {
      state.acknowledgedTrust = el.checked === true;
      save();
      updateFooter();
      return;
    }
    if (action === "toggle-doc") {
      state.documentIds = toggleList(state.documentIds, el.dataset.id, el.checked);
      save();
      render({ preserveScroll: true });
      return;
    }
    if (action === "toggle-habit") {
      state.habitIds = toggleList(state.habitIds, el.dataset.id, el.checked);
      save();
      return;
    }
    if (action === "toggle-plan") {
      state.removedPlanSteps = toggleList(state.removedPlanSteps, el.dataset.id, !el.checked);
      save();
      render({ preserveScroll: true });
    }
  }

  function onInput(event) {
    const field = event.target.dataset.field;
    if (!field) return;
    state[field] = event.target.value;
    save();
    if (field === "matterName") {
      const alert = document.getElementById("matter-alert");
      if (alert) alert.hidden = state.matterName.trim().length > 0;
      event.target.setAttribute("aria-invalid", String(state.matterName.trim().length === 0));
      document.querySelectorAll("[data-matter]").forEach(function (node) {
        node.textContent = state.matterName;
      });
    }
    if (field === "question") {
      const box = document.getElementById("prompt-checks");
      if (box) box.innerHTML = checksHtml();
      const shown = document.getElementById("research-question");
      if (shown) shown.textContent = state.question.trim() || CC.research.questionFallback;
    }
    updateFooter();
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.querySelector(".modal")) closeModals();
  });

  app.addEventListener("click", onClick);
  app.addEventListener("change", onChange);
  app.addEventListener("input", onInput);

  const loaded = load();
  state = loaded.state;
  ui.note = loaded.error;
  ui.planShown = state.researchRan ? CC.planSteps.length : 0;
  if (state.step === 3) ui.tourZone = state.visitedZones[0] || "chat";
  render();
})();
