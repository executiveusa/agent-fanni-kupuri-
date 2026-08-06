import { useState } from 'react';
import { X, RotateCcw, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Clock, Cpu, HeartPulse } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';

/**
 * @param {{ open: boolean, onClose: () => void, runContext: Record<string, any> | null, onRollback: (cpId: string) => void }} props
 */
export function OperatorDrawer({ open, onClose, runContext, onRollback }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState({});
  const [confirmRollback, setConfirmRollback] = useState(null);

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  if (!open) return null;

  const run = runContext || {};
  const checkpoints = run.checkpoints || [];
  const risks = run.risks || [];

  return (
    <aside className="operator-drawer" aria-label="Operator panel" role="complementary">
      <div className="operator-drawer__header">
        <span className="operator-drawer__title"><Cpu size={16} aria-hidden="true" /> {t.operator.workItem || 'Operator'}</span>
        <button className="operator-drawer__close" onClick={onClose} aria-label={t.app.closeDrawer}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="operator-drawer__body">

        {/* Work item */}
        <Section icon={<CheckCircle2 size={14} />} label={t.operator.workItem} expanded={expanded.work} onToggle={() => toggle('work')}>
          {run.workItemId
            ? <code className="mono">{run.workItemId}</code>
            : <Empty />}
          {run.workflowKey && <Detail label="Workflow" value={run.workflowKey} />}
          {run.stage && <Detail label={t.operator.stage} value={run.stage} />}
          {run.status && <Detail label="Status" value={run.status} />}
        </Section>

        {/* Provider route */}
        <Section icon={<Cpu size={14} />} label={t.operator.provider} expanded={expanded.provider} onToggle={() => toggle('provider')}>
          {run.provider
            ? <>
                <Detail label="Provider" value={run.provider} />
                {run.latencyMs && <Detail label={t.operator.latency} value={`${run.latencyMs} ms`} />}
                {run.estimatedCostUsd != null && <Detail label={t.operator.cost} value={`$${run.estimatedCostUsd.toFixed(5)}`} />}
              </>
            : <Empty />}
        </Section>

        {/* Checkpoints */}
        <Section icon={<Clock size={14} />} label={t.operator.checkpoint} expanded={expanded.checkpoints} onToggle={() => toggle('checkpoints')}>
          {checkpoints.length === 0 ? <Empty /> : checkpoints.map(cp => (
            <div key={cp.id} className="operator-checkpoint">
              <code className="mono">{cp.id}</code>
              <span className="operator-checkpoint__stage">{cp.stageKey}</span>
              <span className="operator-checkpoint__time">{new Date(cp.createdAt).toLocaleTimeString()}</span>
              <button
                className="operator-checkpoint__restore"
                onClick={() => setConfirmRollback(cp.id)}
                aria-label={`${t.app.rollback} ${cp.id}`}
              >
                <RotateCcw size={12} /> {t.app.rollback}
              </button>
            </div>
          ))}
          {confirmRollback && (
            <div className="operator-confirm" role="alertdialog" aria-label="Confirm restore">
              <AlertTriangle size={14} aria-hidden="true" />
              <span>Restore to <code>{confirmRollback}</code>?</span>
              <button className="btn-danger" onClick={() => { onRollback(confirmRollback); setConfirmRollback(null); }}>
                {t.app.confirmRollback}
              </button>
              <button className="btn-ghost" onClick={() => setConfirmRollback(null)}>Cancel</button>
            </div>
          )}
        </Section>

        {/* Evidence */}
        <Section icon={<CheckCircle2 size={14} />} label={t.operator.evidence} expanded={expanded.evidence} onToggle={() => toggle('evidence')}>
          {(run.artifacts || []).length === 0 ? <Empty /> : (
            <ul className="operator-evidence">
              {(run.artifacts || []).map((a, i) => (
                <li key={i}><span className="badge">{a.stage}</span> {a.status} · {a.count ?? ''}</li>
              ))}
            </ul>
          )}
        </Section>

        {/* Risks */}
        {risks.length > 0 && (
          <Section icon={<AlertTriangle size={14} />} label={t.operator.risks} expanded={expanded.risks} onToggle={() => toggle('risks')}>
            <ul className="operator-risks">
              {risks.map((r, i) => <li key={i}><AlertTriangle size={12} aria-hidden="true" /> {r}</li>)}
            </ul>
          </Section>
        )}

        {/* Heartbeat */}
        <Section icon={<HeartPulse size={14} />} label={t.operator.heartbeat} expanded={expanded.heartbeat} onToggle={() => toggle('heartbeat')}>
          {run.heartbeat ? (
            <>
              <Detail label="Status" value={run.heartbeat.systemStatus} />
              <Detail label="Next action" value={run.heartbeat.nextAction} />
            </>
          ) : <Empty />}
        </Section>

      </div>
    </aside>
  );
}

function Section({ icon, label, children, expanded, onToggle }) {
  return (
    <div className="operator-section">
      <button className="operator-section__header" onClick={onToggle} aria-expanded={expanded}>
        {icon}
        <span>{label}</span>
        {expanded ? <ChevronDown size={12} aria-hidden="true" /> : <ChevronRight size={12} aria-hidden="true" />}
      </button>
      {expanded && <div className="operator-section__body">{children}</div>}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="operator-detail">
      <span className="operator-detail__label">{label}</span>
      <span className="operator-detail__value">{value}</span>
    </div>
  );
}

function Empty() {
  return <p className="operator-empty">No data yet</p>;
}
