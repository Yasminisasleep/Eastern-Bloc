import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  const base = 'flex flex-col items-center gap-1 flex-1 rounded-[18px] py-2.5 text-on-surface-muted transition'
  const active = 'bg-primary-light text-primary-mid'

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 gap-2 rounded-[24px] border border-outline-soft bg-[rgba(17,26,37,0.88)] p-2 shadow-float backdrop-blur-xl">
      <NavLink to="/discover" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        <span className="material-symbols-rounded text-[24px]">explore</span>
        <span className="text-[11px] font-semibold tracking-wide uppercase">Discover</span>
      </NavLink>
      <NavLink to="/outings" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        <span className="material-symbols-rounded text-[24px]">event_available</span>
        <span className="text-[11px] font-semibold tracking-wide uppercase">Outings</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        <span className="material-symbols-rounded text-[24px]">person</span>
        <span className="text-[11px] font-semibold tracking-wide uppercase">Me</span>
      </NavLink>
    </nav>
  )
}
