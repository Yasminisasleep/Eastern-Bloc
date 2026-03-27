import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  const base = 'flex flex-col items-center gap-0.5 flex-1 py-2 text-on-surface-muted transition-colors'
  const active = 'text-primary-mid'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-surface-high flex z-50 max-w-lg mx-auto">
      <NavLink to="/discover" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        <span className="material-symbols-rounded text-[24px]">explore</span>
        <span className="text-[11px] font-medium tracking-wide uppercase">Discover</span>
      </NavLink>
      <NavLink to="/outings" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        <span className="material-symbols-rounded text-[24px]">event_available</span>
        <span className="text-[11px] font-medium tracking-wide uppercase">Outings</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        <span className="material-symbols-rounded text-[24px]">person</span>
        <span className="text-[11px] font-medium tracking-wide uppercase">Me</span>
      </NavLink>
    </nav>
  )
}
