export default function Avatar({ user, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-2xl',
  };
  const label = user?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className={`${sizes[size] || sizes.md} shrink-0 overflow-hidden rounded-full bg-primary text-white flex items-center justify-center font-semibold ${className}`}>
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt={`${user.username || 'User'} profile`} className="w-full h-full object-cover" />
      ) : (
        label
      )}
    </div>
  );
}
