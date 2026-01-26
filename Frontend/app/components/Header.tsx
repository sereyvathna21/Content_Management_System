export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-8">
        <div className="transition-transform hover:scale-105 duration-300">
          <img src="/logo.svg" className="h-20 w-auto" alt="logo" />
        </div>
        <div>
          <button className="bg-primary text-white font-semibold py-3 px-8 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-primary/90">
            Log in
          </button>
        </div>
      </div>
    </header>
  );
}
