const ARM_LABELS = [
  'Listen',
  'Verify',
  'Understand',
  'Decide',
  'Act',
  'Measure',
  'Protect',
  'Learn'
];

/**
 * Full-body, stylized cartoon avatar for Fanni.
 * The SVG is intentionally non-photorealistic and remains legible at WhatsApp-avatar scale.
 * @param {{ className?: string, labelled?: boolean, title?: string }} props
 */
export function FanniCharacter({ className = '', labelled = false, title = 'Fanni, a stylized full-body octopus agent' }) {
  return (
    <figure className={`fanni-character ${className}`.trim()}>
      <svg
        className="fanni-character__svg"
        viewBox="0 0 520 720"
        role="img"
        aria-labelledby="fanni-character-title fanni-character-description"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="fanni-character-title">{title}</title>
        <desc id="fanni-character-description">
          A full-body editorial cartoon octopus in merlot and rose tones with eight capability arms.
        </desc>
        <defs>
          <linearGradient id="fanni-body" x1="110" y1="50" x2="410" y2="650" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D7A1B4" />
            <stop offset="0.46" stopColor="#8F2856" />
            <stop offset="1" stopColor="#4C1027" />
          </linearGradient>
          <linearGradient id="fanni-suit" x1="180" y1="270" x2="342" y2="610" gradientUnits="userSpaceOnUse">
            <stop stopColor="#171319" />
            <stop offset="1" stopColor="#09080A" />
          </linearGradient>
          <linearGradient id="fanni-shine" x1="180" y1="90" x2="330" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8DDE7" stopOpacity="0.92" />
            <stop offset="1" stopColor="#F8DDE7" stopOpacity="0" />
          </linearGradient>
          <filter id="fanni-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="24" stdDeviation="22" floodColor="#050406" floodOpacity="0.48" />
          </filter>
        </defs>

        <ellipse cx="260" cy="674" rx="172" ry="25" fill="#050406" opacity="0.32" />

        <g className="fanni-character__arms" fill="none" stroke="url(#fanni-body)" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round">
          <path className="fanni-character__arm fanni-character__arm--1" d="M223 418C178 445 135 485 88 475C49 467 42 432 67 411" />
          <path className="fanni-character__arm fanni-character__arm--2" d="M218 455C163 494 132 552 76 564C35 573 25 540 47 515" />
          <path className="fanni-character__arm fanni-character__arm--3" d="M228 492C178 545 180 607 129 638C93 659 67 634 81 605" />
          <path className="fanni-character__arm fanni-character__arm--4" d="M248 507C220 565 235 630 204 665C180 691 149 678 154 645" />
          <path className="fanni-character__arm fanni-character__arm--5" d="M272 507C300 565 285 630 316 665C340 691 371 678 366 645" />
          <path className="fanni-character__arm fanni-character__arm--6" d="M292 492C342 545 340 607 391 638C427 659 453 634 439 605" />
          <path className="fanni-character__arm fanni-character__arm--7" d="M302 455C357 494 388 552 444 564C485 573 495 540 473 515" />
          <path className="fanni-character__arm fanni-character__arm--8" d="M297 418C342 445 385 485 432 475C471 467 478 432 453 411" />
        </g>

        <g filter="url(#fanni-shadow)">
          <path d="M158 331C158 263 199 218 260 218C321 218 362 263 362 331V468C362 525 320 559 260 559C200 559 158 525 158 468V331Z" fill="url(#fanni-body)" />
          <path d="M178 345C190 302 220 278 260 278C300 278 330 302 342 345L327 508C309 526 287 536 260 536C233 536 211 526 193 508L178 345Z" fill="url(#fanni-suit)" />
          <path d="M260 278L219 350L260 392L301 350L260 278Z" fill="#F3EEE6" />
          <path d="M260 393L241 430L260 499L279 430L260 393Z" fill="#D7FF3F" />
          <path d="M149 217C149 129 195 66 260 66C325 66 371 129 371 217C371 284 327 323 260 323C193 323 149 284 149 217Z" fill="url(#fanni-body)" />
          <path d="M174 180C187 112 219 82 260 82C301 82 333 112 346 180C319 153 291 140 260 140C229 140 201 153 174 180Z" fill="#4C1027" />
          <path d="M166 194C184 121 220 92 260 92" stroke="url(#fanni-shine)" strokeWidth="18" strokeLinecap="round" fill="none" />
        </g>

        <g className="fanni-character__face">
          <ellipse cx="219" cy="216" rx="23" ry="29" fill="#F3EEE6" />
          <ellipse cx="301" cy="216" rx="23" ry="29" fill="#F3EEE6" />
          <circle cx="225" cy="220" r="10" fill="#0B0A0C" />
          <circle cx="295" cy="220" r="10" fill="#0B0A0C" />
          <circle cx="229" cy="216" r="3" fill="#F3EEE6" />
          <circle cx="299" cy="216" r="3" fill="#F3EEE6" />
          <path d="M228 267C246 280 274 280 292 267" stroke="#4C1027" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M195 184C210 174 225 172 239 178" stroke="#4C1027" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M281 178C295 172 310 174 325 184" stroke="#4C1027" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="147" cy="222" r="10" fill="#D7FF3F" />
          <circle cx="373" cy="222" r="10" fill="#D7FF3F" />
        </g>

        <g className="fanni-character__badge">
          <circle cx="329" cy="382" r="24" fill="#F3EEE6" />
          <text x="329" y="392" textAnchor="middle" fontFamily="Georgia, serif" fontSize="27" fontWeight="700" fill="#4C1027">F</text>
        </g>

        {labelled && (
          <g className="fanni-character__labels" aria-hidden="true">
            {ARM_LABELS.map((label, index) => {
              const positions = [
                [38, 378], [18, 510], [62, 646], [156, 705],
                [364, 705], [444, 646], [474, 510], [432, 378]
              ];
              const [x, y] = positions[index];
              return (
                <g key={label} transform={`translate(${x} ${y})`}>
                  <rect width="72" height="24" rx="12" fill="#0B0A0C" stroke="#F3EEE6" strokeOpacity="0.24" />
                  <text x="36" y="16" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" fill="#F3EEE6">{label}</text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </figure>
  );
}
