export default function Sidebar({ children, className = '' }) {
  return (
    <aside className={`w-full shrink-0 overflow-hidden border-r border-[#d1d7db] bg-white shadow-sm dark:border-[#374045] dark:bg-[#202c33] md:w-[22rem] lg:w-[25rem] ${className}`}>
      {children}
    </aside>
  );
}
