import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AudioLines, Bot, CheckCircle2, CircleDollarSign, Database, FileText, LockKeyhole, Play, ShieldCheck, Sparkles } from 'lucide-react';
import './styles.css';

const workflows = [
  { id: 'discover', name: 'Discover signals', stage: '00', status: 'ready', value: 'Collect and normalize approved inputs' },
  { id: 'classify', name: 'Classify intelligence', stage: '01', status: 'ready', value: 'Topic, dimension, sentiment, risk' },
  { id: 'review', name: 'Resolve uncertainty', stage: '02', status: 'ready', value: 'Evidence-driven exception handling' },
  { id: 'report', name: 'Produce weekly report', stage: '03', status: 'ready', value: 'Executive narrative and evidence' },
  { id: 'strategy', name: 'Build content strategy', stage: '04', status: 'planned', value: 'Patterns, audience and platform choices' },
  { id: 'produce', name: 'Produce campaign assets', stage: '05', status: 'planned', value: 'Calendar, posts, captions and variants' },
  { id: 'publish', name: 'Publish and monitor', stage: '06', status: 'locked', value: 'Postiz/Facebook writes require policy and secrets' },
  { id: 'optimize', name: 'Optimize for profit', stage: '07', status: 'planned', value: 'Performance, cost and next-best action' }
];

const demoMentions = [
  { source: 'Noticias MX', signal: 'Nueva experiencia digital para clientes', topic: 'Digital banking', sentiment: 'Positive', risk: 'Low', confidence: 94 },
  { source: 'Consumer forum', signal: 'Intermittent mobile application complaint', topic: 'Customer experience', sentiment: 'Negative', risk: 'Medium', confidence: 82 },
  { source: 'Industry brief', signal: 'Regional expansion commentary', topic: 'Corporate strategy', sentiment: 'Neutral', risk: 'Low', confidence: 89 },
  { source: 'Unknown repost', signal: 'Unverified fraud allegation requires review', topic: 'Fraud prevention', sentiment: 'Negative', risk: 'High', confidence: 61 }
];

function App() {
  const [active, setActive] = useState('classify');
  const [running, setRunning] = useState(false);
  const [voice, setVoice] = useState(false);
  const [completed, setCompleted] = useState(0);
  const selected = useMemo(() => workflows.find((item) => item.id === active), [active]);

  const runDemo = () => {
    if (selected.status === 'locked') return;
    setRunning(true);
    setCompleted(0);
    let value = 0;
    const timer = window.setInterval(() => {
      value += 25;
      setCompleted(value);
      if (value >= 100) {
        window.clearInterval(timer);
        setRunning(false);
      }
    }, 350);
  };

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">F</span><div><strong>Agent Fanny</strong><small>Kupuri Media · Sovereign Operations</small></div></div>
        <div className="security"><LockKeyhole size={16} /> Local-first demo <span>Cloud writes blocked</span></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15}/> Private AI operations</span>
          <h1>Turn signals into decisions, content and measurable business value.</h1>
          <p>Fanny is a charismatic bilingual operator that coordinates evidence-based workflows, speaks with the team, and keeps sensitive work separated by workspace.</p>
          <div className="hero-actions">
            <button className="primary" onClick={runDemo} disabled={running || selected.status === 'locked'}><Play size={17}/>{running ? 'Running workflow…' : 'Run selected workflow'}</button>
            <button className={voice ? 'secondary active' : 'secondary'} onClick={() => setVoice(!voice)}><AudioLines size={17}/>{voice ? 'Voice active' : 'Activate voice demo'}</button>
          </div>
        </div>
        <div className="avatar-card" aria-label="Agent Fanny avatar placeholder">
          <div className="avatar-orbit"></div>
          <div className="avatar"><span>F</span></div>
          <div className="presence"><i></i>{voice ? 'Listening locally' : 'Ready to work'}</div>
          <p>Professional, confident and warm. Final avatar and voice remain replaceable adapters.</p>
        </div>
      </section>

      <section className="metrics">
        <article><Activity/><div><strong>8</strong><span>Workflow stages</span></div></article>
        <article><ShieldCheck/><div><strong>RLS</strong><span>Workspace isolation</span></div></article>
        <article><Database/><div><strong>0</strong><span>Real client records</span></div></article>
        <article><CircleDollarSign/><div><strong>ROI</strong><span>Measured per run</span></div></article>
      </section>

      <section className="workspace">
        <aside>
          <div className="section-title"><Bot size={18}/><span>End-to-end workflows</span></div>
          <nav>{workflows.map((item) => <button key={item.id} className={active === item.id ? 'workflow active' : 'workflow'} onClick={() => setActive(item.id)}><span>{item.stage}</span><div><strong>{item.name}</strong><small>{item.value}</small></div><em data-status={item.status}>{item.status}</em></button>)}</nav>
        </aside>

        <div className="panel">
          <div className="panel-head"><div><span>Stage {selected.stage}</span><h2>{selected.name}</h2><p>{selected.value}</p></div><span className="mode">Synthetic demonstration</span></div>
          <div className="progress"><div style={{width: `${completed}%`}}></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Source</th><th>Signal</th><th>Topic</th><th>Sentiment</th><th>Risk</th><th>Confidence</th></tr></thead>
              <tbody>{demoMentions.map((row) => <tr key={row.signal}><td>{row.source}</td><td>{row.signal}</td><td>{row.topic}</td><td>{row.sentiment}</td><td><span className={`risk ${row.risk.toLowerCase()}`}>{row.risk}</span></td><td>{row.confidence}%</td></tr>)}</tbody>
            </table>
          </div>
          <div className="proof-grid">
            <div><CheckCircle2/><strong>Observable</strong><span>Every stage emits artifacts and evidence.</span></div>
            <div><FileText/><strong>Report-ready</strong><span>Outputs feed the next stage without hidden context.</span></div>
            <div><ShieldCheck/><strong>Separated</strong><span>Organization and workspace IDs gate every record.</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
