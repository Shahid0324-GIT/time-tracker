export function Footer() {
  return (
    <footer className="bg-black py-12 border-t border-white/10 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto flex flex-col items-center justify-between h-full">
        {/* Small Top Links */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500 mb-20">
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
          <p>© Time Tracker</p>
        </div>

        {/* THE BIG TEXT */}
        <div className="w-full text-center">
          <h1 className="text-[12vw] md:text-[14vw] font-black leading-none tracking-tighter text-white/5 select-none hover:text-white/60 transition-colors duration-500">
            TIME TRACKER
          </h1>
        </div>
      </div>
    </footer>
  );
}
