export default function PortailPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-rzpanda-fond">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <span className="text-lg font-bold text-rzpanda-primary">{"RZPan'Da"}</span>
          <span className="ml-2 text-sm text-gray-400">Portail Parents</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
