/*
 * app.js — the dashboard's behavior: calculations, button clicks, and saving.
 * It contains no wording of its own; every visible word comes from content.js.
 */
(function () {
  "use strict";

  // The target hours the sprint starts with, and after "Reset sprint".
  var DEFAULT_TARGET_HOURS = 60;
  // Capacity percentage at which the status chip turns from orange to green.
  var ON_TRACK_PERCENT = 60;
  // Where this browser remembers your entries between visits.
  var STORAGE_KEY = "sprint-hours-dashboard-v1";

  /* ---------- Reading text from content.js ---------- */

  function text(name) {
    var value = window[name];
    if (typeof value !== "string") {
      console.warn("content.js has no text named " + name);
      return "[" + name + "]";
    }
    return value;
  }

  // Swaps {placeholders} in a sentence for live values.
  function fillIn(template, values) {
    return template.replace(/\{(\w+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match;
    });
  }

  function applyText(root) {
    root.querySelectorAll("[data-text]").forEach(function (el) {
      el.textContent = text(el.getAttribute("data-text"));
    });
    root.querySelectorAll("[data-aria]").forEach(function (el) {
      var label = text(el.getAttribute("data-aria"));
      el.setAttribute("aria-label", label);
      if (el.tagName === "BUTTON") el.setAttribute("title", label);
    });
  }

  /* ---------- Numbers ---------- */

  function roundToTenth(n) {
    return Math.round(n * 10) / 10;
  }

  // Returns a valid, non-negative number of hours, or null if the box isn't a usable number yet.
  function parseHours(raw) {
    var n = parseFloat(raw);
    return isFinite(n) && n >= 0 ? n : null;
  }

  /* ---------- Saved entries ---------- */

  function loadSaved() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function save() {
    try {
      var savedTickets = {};
      tickets.forEach(function (t) {
        var entry = { estimate: t.estimate, hours: t.hours };
        // Only remember a title you typed, so wording changes in content.js still show up.
        if (t.title !== t.defaultTitle) entry.title = t.title;
        savedTickets[t.id] = entry;
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ target: target, tickets: savedTickets }));
    } catch (error) {
      // Saving can fail in private browsing; the dashboard still works for this visit.
    }
  }

  /* ---------- Data ---------- */

  var saved = loadSaved() || {};
  var savedTickets = saved.tickets || {};
  var target = parseHours(saved.target);
  if (target === null) target = DEFAULT_TARGET_HOURS;

  var groups = (window.TICKET_GROUPS || []).map(function (group) {
    return {
      name: String(group.name),
      tickets: (group.tickets || []).map(function (t) {
        var stored = savedTickets[t.id] || {};
        var estimate = parseHours(stored.estimate);
        var hours = parseHours(stored.hours);
        return {
          id: t.id,
          defaultTitle: String(t.title),
          title: typeof stored.title === "string" ? stored.title : String(t.title),
          estimate: estimate !== null ? estimate : Number(t.estimate) || 0,
          hours: hours !== null ? hours : Number(t.hours) || 0,
          active: t.active === true,
          inputs: {}
        };
      })
    };
  });

  var tickets = groups.reduce(function (all, group) {
    return all.concat(group.tickets);
  }, []);

  /* ---------- Page elements ---------- */

  function byId(id) {
    return document.getElementById(id);
  }

  var el = {
    appBody: byId("app-body"),
    navToggle: byId("nav-toggle"),
    intro: byId("sprint-intro"),
    totalHours: byId("total-hours"),
    totalSuffix: byId("total-suffix"),
    capacityText: byId("capacity-text"),
    progressComplete: byId("progress-complete"),
    progressTrack: byId("progress-track"),
    progressFill: byId("progress-fill"),
    targetInput: byId("target-input"),
    remainingValue: byId("remaining-value"),
    resetButton: byId("reset-button"),
    kpiHours: byId("kpi-hours"),
    kpiHoursDetail: byId("kpi-hours-detail"),
    kpiCapacity: byId("kpi-capacity"),
    kpiStatus: byId("kpi-status"),
    kpiRemaining: byId("kpi-remaining"),
    kpiActive: byId("kpi-active"),
    kpiActiveDetail: byId("kpi-active-detail"),
    groupList: byId("group-list"),
    groupTemplate: byId("group-template"),
    rowTemplate: byId("ticket-row-template"),
    copyright: byId("footer-copyright")
  };

  /* ---------- Hour boxes ---------- */

  // Updates the total while typing, and tidies the box when you leave it (blank becomes 0).
  function wireHoursInput(input, onChange) {
    input.addEventListener("input", function () {
      var n = parseHours(input.value);
      if (n !== null) onChange(n);
    });
    input.addEventListener("blur", function () {
      var n = parseHours(input.value);
      if (n === null) n = 0;
      input.value = String(n);
      onChange(n);
    });
  }

  /* ---------- Ticket groups ---------- */

  function buildGroups() {
    groups.forEach(function (group, groupIndex) {
      var card = el.groupTemplate.content.firstElementChild.cloneNode(true);
      var titleId = "group-title-" + groupIndex;
      var nameEl = card.querySelector('[data-role="group-name"]');
      nameEl.textContent = group.name;
      nameEl.id = titleId;
      card.setAttribute("aria-labelledby", titleId);
      group.progressEl = card.querySelector('[data-role="group-progress"]');

      var rows = card.querySelector('[data-role="group-rows"]');
      group.tickets.forEach(function (ticket) {
        var row = el.rowTemplate.content.firstElementChild.cloneNode(true);
        applyText(row);

        var titleInput = row.querySelector('[data-field="title"]');
        var estimateInput = row.querySelector('[data-field="estimate"]');
        var hoursInput = row.querySelector('[data-field="hours"]');

        titleInput.value = ticket.title;
        estimateInput.value = String(ticket.estimate);
        hoursInput.value = String(ticket.hours);
        ticket.inputs = { estimate: estimateInput, hours: hoursInput };

        titleInput.addEventListener("input", function () {
          ticket.title = titleInput.value;
          save();
        });
        wireHoursInput(estimateInput, function (n) {
          ticket.estimate = n;
          update();
        });
        wireHoursInput(hoursInput, function (n) {
          ticket.hours = n;
          update();
        });

        rows.appendChild(row);
      });

      el.groupList.appendChild(card);
    });
  }

  /* ---------- Totals and status ---------- */

  function update() {
    var totalHours = roundToTenth(tickets.reduce(function (sum, t) { return sum + t.hours; }, 0));
    var totalEstimate = roundToTenth(tickets.reduce(function (sum, t) { return sum + t.estimate; }, 0));
    var percent = target > 0 ? Math.min(100, Math.round((totalHours / target) * 100)) : 0;
    var remaining = roundToTenth(Math.max(0, target - totalHours));
    var activeCount = tickets.filter(function (t) { return t.active; }).length;
    var isOver = totalHours > target;

    el.intro.textContent = fillIn(text("SPRINT_INTRO"), { target: target });

    el.totalHours.textContent = String(totalHours);
    el.totalSuffix.textContent = fillIn(text("PROGRESS_TOTAL_SUFFIX"), { target: target });
    el.capacityText.textContent = fillIn(text("PROGRESS_CAPACITY_TEXT"), { percent: percent });
    el.progressComplete.textContent = fillIn(text("PROGRESS_BAR_COMPLETE"), { percent: percent });

    el.progressFill.style.width = percent + "%";
    el.progressFill.classList.toggle("is-over", isOver);
    el.progressTrack.setAttribute("aria-valuemax", String(target));
    el.progressTrack.setAttribute("aria-valuenow", String(Math.min(totalHours, target)));
    el.progressTrack.setAttribute("aria-valuetext", el.progressComplete.textContent);

    el.remainingValue.textContent = fillIn(text("REMAINING_VALUE"), { hours: remaining });

    el.kpiHours.textContent = String(totalHours);
    el.kpiHoursDetail.textContent = fillIn(text("KPI_HOURS_DETAIL"), { target: target, estimate: totalEstimate });

    el.kpiCapacity.textContent = percent + "%";
    var status = isOver ? "error" : percent >= ON_TRACK_PERCENT ? "success" : "warning";
    var statusText = { error: "STATUS_OVER_TARGET", success: "STATUS_ON_TRACK", warning: "STATUS_RAMPING_UP" };
    el.kpiStatus.textContent = text(statusText[status]);
    el.kpiStatus.className = "badge is-" + status;

    el.kpiRemaining.textContent = String(remaining);
    el.kpiActive.textContent = String(activeCount);
    el.kpiActiveDetail.textContent = fillIn(text("KPI_ACTIVE_DETAIL"), { count: tickets.length });

    groups.forEach(function (group) {
      var logged = group.tickets.filter(function (t) { return t.hours > 0; }).length;
      group.progressEl.textContent = fillIn(text("GROUP_PROGRESS"), { logged: logged, total: group.tickets.length });
    });

    save();
  }

  /* ---------- Reset sprint ---------- */

  // Clears every ticket's logged hours and restores the default target.
  // Ticket names and estimates stay as they are.
  function resetSprint() {
    tickets.forEach(function (t) {
      t.hours = 0;
      t.inputs.hours.value = "0";
    });
    target = DEFAULT_TARGET_HOURS;
    el.targetInput.value = String(target);
    update();
  }

  /* ---------- Side navigation ---------- */

  function setNavOpen(isOpen) {
    el.appBody.classList.toggle("nav-collapsed", !isOpen);
    el.navToggle.setAttribute("aria-expanded", String(isOpen));
    var label = text(isOpen ? "NAV_COLLAPSE_LABEL" : "NAV_EXPAND_LABEL");
    el.navToggle.setAttribute("aria-label", label);
    el.navToggle.setAttribute("title", label);
  }

  /* ---------- Start ---------- */

  document.title = text("PAGE_TITLE");
  applyText(document);
  el.copyright.textContent = fillIn(text("FOOTER_COPYRIGHT"), { year: new Date().getFullYear() });

  buildGroups();

  el.targetInput.value = String(target);
  wireHoursInput(el.targetInput, function (n) {
    target = n;
    update();
  });

  el.resetButton.addEventListener("click", resetSprint);

  setNavOpen(true);
  el.navToggle.addEventListener("click", function () {
    setNavOpen(el.appBody.classList.contains("nav-collapsed"));
  });

  update();
})();
