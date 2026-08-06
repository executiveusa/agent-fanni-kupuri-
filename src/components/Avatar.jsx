import { useLanguage } from '../hooks/useLanguage.js';

const AVATAR_VARIANT = import.meta.env.VITE_FANNI_AVATAR_VARIANT || 'a';

const STATE_META = {
  offline: { pulse: false, ring: 'var(--fanni-smoke)', motionClass: '' },
  idle: { pulse: true, ring: 'var(--fanni-rose)', motionClass: 'avatar--idle' },
  listening: { pulse: true, ring: 'var(--fanni-orchid)', motionClass: 'avatar--listening' },
  transcribing: { pulse: true, ring: 'var(--fanni-orchid-soft)', motionClass: 'avatar--transcribing' },
  thinking: { pulse: true, ring: 'var(--fanni-merlot)', motionClass: 'avatar--thinking' },
  working: { pulse: true, ring: 'var(--fanni-wine)', motionClass: 'avatar--working' },
  waiting_for_approval: { pulse: true, ring: 'var(--fanni-warning)', motionClass: 'avatar--waiting' },
  speaking: { pulse: true, ring: 'var(--fanni-chartreuse)', motionClass: 'avatar--speaking' },
  success: { pulse: false, ring: 'var(--fanni-success)', motionClass: '' },
  warning: { pulse: true, ring: 'var(--fanni-warning)', motionClass: '' },
  error: { pulse: false, ring: 'var(--fanni-danger)', motionClass: '' }
};

/**
 * @param {{ state: string, compact?: boolean, waveformActive?: boolean }} props
 */
export function Avatar({ state = 'idle', compact = false, waveformActive = false }) {
  const { t } = useLanguage();
  const meta = STATE_META[state] || STATE_META.idle;
  const label = t.avatar[state] || state;

  const avatarSrc = `/avatars/fanni-${AVATAR_VARIANT}.png`;

  return (
    <div
      className={`fanni-avatar ${compact ? 'fanni-avatar--compact' : ''} ${meta.motionClass}`}
      aria-label={`Fanni — ${label}`}
      role="img"
      data-state={state}
    >
      {/* Orbital ring */}
      <div
        className={`fanni-avatar__ring ${meta.pulse ? 'fanni-avatar__ring--pulse' : ''}`}
        style={{ '--ring-color': meta.ring }}
        aria-hidden="true"
      />

      {/* Portrait */}
      <div className="fanni-avatar__portrait">
        <img
          src={avatarSrc}
          alt="Fanni"
          className="fanni-avatar__img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling.style.display = 'flex';
          }}
        />
        {/* SVG fallback when image is unavailable */}
        <div className="fanni-avatar__fallback" aria-hidden="true" style={{ display: 'none' }}>
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="fg" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#C58A9E" />
                <stop offset="100%" stopColor="#4C1027" />
              </radialGradient>
            </defs>
            <circle cx="60" cy="60" r="60" fill="#0B0A0C" />
            <ellipse cx="60" cy="52" rx="22" ry="26" fill="url(#fg)" />
            <ellipse cx="60" cy="95" rx="34" ry="25" fill="#741C43" />
            <text x="60" y="58" textAnchor="middle" fontSize="28" fontWeight="800" fill="#F3EEE6" fontFamily="serif">F</text>
          </svg>
        </div>
      </div>

      {/* Voice waveform (speaking state) */}
      {(state === 'speaking' || (state === 'listening' && waveformActive)) && (
        <div className="fanni-avatar__waveform" aria-hidden="true">
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className="fanni-avatar__wave-bar" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      )}

      {/* State label */}
      <div className="fanni-avatar__state" aria-live="polite">
        <span className="fanni-avatar__dot" style={{ background: meta.ring }} aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  );
}
