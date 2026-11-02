.status-message.is-visible {
  display: block;
}
.status-message:focus {
  outline: none;
}
.status-message:focus-visible {
  outline: 3px solid var(--green-ink);
  outline-offset: 2px;
}
.footer-note {
  margin: 0 0 12px;
  color: var(--muted);
  font-size: 0.9rem;
}
.footer-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.btn {
  min-height: 44px;
  min-width: 120px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
}
.btn-primary {
  background: var(--blue);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: var(--blue-dark);
}
.btn-secondary {
  background: var(--paper);
  color: var(--blue);
  border-color: var(--blue);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--blue-soft);
}
.btn:disabled {
  cursor: not-allowed;
  background: #e6edf3;
  color: #3e5163;
  border-color: #c5d0db;
  opacity: 1;
}
.btn-mock {
  opacity: 1;
  min-width: 96px;
}
@media (max-width: 760px) {
  .page {
    width: 100%;
    margin: 0;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }
  .header,
  .main,
  .footer {
    padding-left: 16px;
    padding-right: 16px;
  }
  .footer {
    border-radius: 0;
  }
  h1 {
    font-size: 1.6rem;
  }
  .compare,
  .filters,
  .segment-group {
    grid-template-columns: 1fr;
  }
  .search-bar {
    flex-direction: column;
  }
  .btn-mock {
    align-self: stretch;
    text-align: center;
  }
  .result {
    grid-template-columns: 1fr;
  }
  .result-tag {
    justify-self: start;
    grid-row: auto;
  }
}
@media (max-width: 480px) {
  .footer-actions .btn {
    flex: 1;
    min-width: 0;
  }
}
@media (forced-colors: active) {
  .flag,
  .btn,
  .segment,
  .example-card,
  .progress-segment {
    border: 1px solid CanvasText;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
  }
}
