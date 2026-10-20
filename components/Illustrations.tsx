export function ToolIllustration() {
  return (
    <svg viewBox="0 0 520 420" className="hero-art" aria-hidden="true">
      <path
        className="blob blob-purple"
        d="M66 88C111 8 247 18 311 55c72 41 154 113 127 207-27 95-144 144-252 116C74 350 11 186 66 88Z"
      />
      <path
        className="blob blob-blue"
        d="M330 62c54-37 137 2 135 66-2 66-89 80-139 45-41-29-35-84 4-111Z"
      />
      <g className="float-slow">
        <rect x="110" y="198" width="235" height="45" rx="16" fill="#FDF0C8" stroke="#302f26" strokeWidth="5" />
        <rect x="146" y="248" width="36" height="118" rx="14" fill="#8A8F4A" stroke="#302f26" strokeWidth="5" />
        <rect x="275" y="248" width="36" height="118" rx="14" fill="#8A8F4A" stroke="#302f26" strokeWidth="5" />
        <circle cx="130" cy="220" r="7" fill="#F28C5B" />
        <circle cx="325" cy="220" r="7" fill="#F28C5B" />
      </g>
      <g className="float-fast" transform="rotate(-18 360 160)">
        <path d="M363 89h22v165h-22z" fill="#9B5FB0" stroke="#302f26" strokeWidth="5" />
        <path d="M338 92c0-35 70-35 70 0v16h-70Z" fill="#F28C5B" stroke="#302f26" strokeWidth="5" />
      </g>
      <path d="M79 129l9 17 18 8-18 8-9 18-8-18-18-8 18-8Z" fill="#F28C5B" />
      <path d="M427 266l7 14 15 7-15 7-7 15-7-15-15-7 15-7Z" fill="#F8AFC3" />
      <path d="M346 333c28-25 65-20 81 10-28 29-64 32-92 9Z" fill="#f2bb96" stroke="#302f26" strokeWidth="5" />
      <path d="M408 343l42-49" stroke="#302f26" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

export function PartsIllustration() {
  return (
    <svg viewBox="0 0 270 210" className="mini-art" aria-hidden="true">
      <path d="M41 48c44-42 147-31 183 18 32 44 4 110-45 130-54 22-135-1-156-48-14-31-7-76 18-100Z" fill="#d7ddee" />
      <rect x="58" y="83" width="150" height="37" rx="9" fill="#FDF0C8" stroke="#302f26" strokeWidth="4" />
      <rect x="86" y="128" width="25" height="60" rx="7" fill="#8A8F4A" stroke="#302f26" strokeWidth="4" />
      <rect x="157" y="128" width="25" height="60" rx="7" fill="#8A8F4A" stroke="#302f26" strokeWidth="4" />
      <circle cx="50" cy="55" r="11" fill="#F28C5B" stroke="#302f26" strokeWidth="4" />
      <circle cx="220" cy="55" r="8" fill="#9B5FB0" stroke="#302f26" strokeWidth="4" />
    </svg>
  );
}