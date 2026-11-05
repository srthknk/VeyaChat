export default function MainLayout({ header, sidebar, children }) {
  return (
    <div className="min-h-screen bg-background">
      {header}
      <div className="flex">
        {sidebar}
        <main className="flex-1 bg-white flex flex-col">{children}</main>
      </div>
    </div>
  );
}
