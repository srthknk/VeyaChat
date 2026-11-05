import logo from '../assets/veya-logo.png';

export default function VeyaLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-2">
      <img src={logo} alt="Veya" className="h-9 w-9 rounded-xl shadow-sm" />
      {!compact && <span className="text-xl font-bold tracking-tight text-primary">Veya</span>}
    </div>
  );
}
