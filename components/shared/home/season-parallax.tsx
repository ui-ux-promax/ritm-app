export function SeasonParallax() {
  return (
    <div
      data-reveal="scale"
      className="relative min-h-[280px] w-screen overflow-hidden md:min-h-[390px]"
      style={{ marginLeft: 'calc(50% - 50vw)' }}
    >
      <div
        aria-hidden="true"
        className="season-fixed-background absolute inset-0"
      />
      <div className="absolute bottom-7 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/35 bg-ink/72 px-4 py-2 text-white shadow-xl backdrop-blur-md">
        <span className="font-mono text-[10px] font-bold tracking-[.18em]">RITM / SS26</span>
        <span className="h-1 w-1 rounded-full bg-accent" />
        <span className="hidden text-[11px] text-white/72 sm:inline">Лимитированная коллекция</span>
      </div>
    </div>
  );
}
