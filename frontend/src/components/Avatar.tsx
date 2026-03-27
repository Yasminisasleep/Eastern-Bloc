interface AvatarProps {
  user: { displayName: string; photoUrl: string | null }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE = { sm: 'w-8 h-8 text-sm', md: 'w-12 h-12 text-base', lg: 'w-[72px] h-[72px] text-2xl' }

export default function Avatar({ user, size = 'md', className = '' }: AvatarProps) {
  const initials = user.displayName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  return user.photoUrl ? (
    <img
      src={user.photoUrl}
      alt={user.displayName}
      className={`rounded-full object-cover ${SIZE[size]} ${className}`}
    />
  ) : (
    <div className={`rounded-full flex items-center justify-center font-semibold ${SIZE[size]} ${className}`}
         style={{ background: '#6b1423', color: '#d4af37' }}>
      {initials}
    </div>
  )
}
