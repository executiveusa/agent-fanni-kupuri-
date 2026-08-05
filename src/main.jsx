import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AudioLines,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Database,
  Download,
  FileText,
  HeartPulse,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import './styles.css';
import { syntheticMentions } from './runtime/syntheticMentions';
import { reportToMarkdown, runMediaIntelligenceWorkflow, workflowStages } from './runtime/workflowEngine';
import { runHeartbeat } from './runtime/heartbeat';

const workflowMenu = [
  { id: 'media', name: 'Weekly media intelligence', stage: '00–07', status: 'ready', value: 'Real deterministic synthetic workflow' },
  { id: 'heartbeat', name: 'Run Fanni heartbeat', stage: 'HB', status: 'ready', value: 'Configuration, health, risk and next action' },
  { id: 'strategy', name: 'Build content strategy', stage: '08', status: 'planned', value: 'Patterns, audience and platform choices' },
  { id: 'publish', name: 'Publish and monitor', stage: '09', status: 'locked', value: 'External writes require both safety gates' }
];

function downloadText(filename, content, type = 'text/markdown') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [active, setActive] = useState('media');
  const [voice, setVoice] = useState(false);
  const [run, setRun] = useState(null);
  const [heartbeat, setHeartbeat] = useState(null);
  const [running, setRunning] = useState(false);
  const selected = useMemo(() => workflowMenu.find((item) => item.id === active), [active]);

  const executeSelected = () => {
    if (selected.status === 'locked') return;
    setRunning(true);
    window.setTimeout(() => {
      if (active === 'heartbeat') {
        setHeartbeat(runHeartbeat({ workflowRun: run }));
      } else {
        const result = runMediaIntelligenceWorkflow(syntheticMentions);
        setRun(result);
        setHeartbeat(runHeartbeat({ workflowRun: result }));
      }
      setRunning(false);
    }, 250);
  };

  const completedStages = run?.artifacts?.length || 0;
  const progress = Math.round((completedStages / workflowStages.length) * 100);
  const rows = run?.records || [];

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">F</span><div><strong>Agent Fanni</strong><small>Kupuri Media · Sovereign Operations</small></div></div>
        <div className="security"><LockKeyhole size={16} /> Executable synthetic prototype <span>External writes blocked</span></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15}/> Private AI operations</span>
          <h1>Turn signals into evidence, decisions and finished work.</h1>
          <p>Fanni now runs a deterministic media-intelligence workflow and an executable heartbeat. Every stage emits artifacts, evidence and measurable demonstration value.</p>
          <div className="hero-actions">
            <button className="primary" onClick={executeSelected} disabled={running || selected.status === 'locked'}><Play size={17}/>{running ? 'Executing…' : `Run ${selected.name}`}</button>
            <button className={voice ? 'secondary active' : 'secondary'} onClick={() => setVoice(!voice)}><AudioLines size={17}/>{voice ? 'Voice demo active' : 'Activate voice state'}</button>
            {run && <button className="secondary" onClick={() => downloadText('agent-fanni-weekly-report.md', reportToMarkdown(run))}><Download size={17}/>Download report</button>}
          </div>
        </div>
        <div className="avatar-card" aria-label="Agent Fanni avatar placeholder">
          <div className="avatar-orbit"></div>
          <div className="avatar"><span>F</span></div>
          <div className="presence"><i></i>{running ? 'Working' : voice ? 'Listening locally' : 'Ready to work'}</div>
          <p>Heart, persona and heartbeat loaded. Final voice and avatar remain replaceable adapters.</p>
        </div>
      </section>

      <section className="metrics">
        <article><Activity/><div><strong>{run?.report.totalInput ?? syntheticMentions.length}</strong><span>Synthetic input records</span></div></article>
        <article><ShieldCheck/><div><strong>{run?.report.reviewRequired ?? '—'}</strong><span>Items requiring review</span></div></article>
        <article><Database/><div><strong>{run?.report.duplicatesRemoved ?? '—'}</strong><span>Duplicates removed</span></div></article>
        <article><CircleDollarSign/><div><strong>{run ? `${run.metrics.estimatedMinutesSaved}m` : '—'}</strong><span>Estimated time saved</span></div></article>
      </section>

      <section className="workspace">
        <aside>
          <div className="section-title"><Bot size={18}/><span>Executable workflows</span></div>
          <nav>{workflowMenu.map((item) => <button key={item.id} className={active === item.id ? 'workflow active' : 'workflow'} onClick={() => setActive(item.id)}><span>{item.stage}</span><div><strong>{item.name}</strong><small>{item.value}</small></div><em data-status={item.status}>{item.status}</em></button>)}</nav>
        </aside>

        <div className="panel">
          <div className="panel-head"><div><span>{selected.stage}</span><h2>{selected.name}</h2><p>{selected.value}</p></div><span className="mode">Synthetic data only</span></div>
          <div className="progress"><div style={{width: `${active === 'media' ? progress : heartbeat ? 100 : 0}%`}}></div></div>

          {active === 'heartbeat' ? (
            <section className="heartbeat-panel">
              <div className="heartbeat-title"><HeartPulse/><div><strong>{heartbeat ? heartbeat.systemStatus : 'Not run'}</strong><span>{heartbeat?.timestamp || 'Run the heartbeat to inspect the system.'}</span></div></div>
              {heartbeat && <>
                <div className="status-grid">
                  <div><span>External writes</span><strong>{heartbeat.externalWrites}</strong></div>
                  <div><span>Real client data</span><strong>{heartbeat.realClientData}</strong></div>
                  <div><span>Unknowns</span><strong>{heartbeat.unknowns.length}</strong></div>
                  <div><span>Human attention</span><strong>{heartbeat.humanAttentionRequired ? 'Required' : 'No'}</strong></div>
                </div>
                <div className="evidence-list"><h3>Facts</h3>{heartbeat.facts.map((fact) => <p key={fact}><CheckCircle2 size={15}/>{fact}</p>)}</div>
                <div className="next-action"><strong>Next action</strong><p>{heartbeat.nextAction}</p></div>
              </>}
            </section>
          ) : (
            <>
              <div className="stage-strip">{workflowStages.map((stage) => <span key={stage} className={run?.artifacts.some((artifact) => artifact.stage === stage) ? 'complete' : ''}>{stage}</span>)}</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Source</th><th>Signal</th><th>Topic</th><th>Sentiment</th><th>Risk</th><th>Confidence</th></tr></thead>
                  <tbody>{rows.length ? rows.map((row) => <tr key={row.id}><td>{row.source}</td><td>{row.text}</td><td>{row.topic}</td><td>{row.sentiment}</td><td><span className={`risk ${row.risk.toLowerCase()}`}>{row.risk}</span></td><td>{row.confidence}%</td></tr>) : <tr><td colSpan="6">Run the workflow to produce classified records.</td></tr>}</tbody>
                </table>
              </div>
              {run && <div className="report-summary"><FileText/><div><strong>{run.report.title}</strong><p>{run.report.executiveSummary}</p><small>{run.report.disclaimer}</small></div></div>}
            </>
          )}

          <div className="proof-grid">
            <div><CheckCircle2/><strong>Executable</strong><span>Stages generate real browser artifacts.</span></div>
            <div><FileText/><strong>Exportable</strong><span>The weekly report downloads as Markdown.</span></div>
            <div><ShieldCheck/><strong>Fail closed</strong><span>Publishing and real data remain disabled.</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
