import { Film } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">CineReviews</h1>
              <p className="text-slate-400 text-sm">Sua comunidade de reviews de filmes</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Filmes</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Reviews</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Rankings</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Sobre</a>
          </nav>
        </div>
      </div>
    </header>
  );
}