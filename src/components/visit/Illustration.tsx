export default function Illustration({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Lư hương và nén hương">
      <ellipse cx="60" cy="100" rx="38" ry="10" fill="#8b5e3c" />
      <rect x="22" y="84" width="76" height="16" rx="6" fill="#6a4529" />
      <rect x="58" y="30" width="4" height="56" fill="#d9a441" />
      {lit && <circle className="visit-ember" cx="60" cy="28" r="4" fill="#d9a441" />}
      {lit && <path d="M60 22 C50 12 70 6 60 -2" stroke="#6b5b4a" strokeWidth="2" fill="none" opacity="0.5" />}
    </svg>
  );
}
