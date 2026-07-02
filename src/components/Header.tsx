import { Compass, Film, Home, Info, MessageCircle, Search, Sparkles, Star } from 'lucide-react';

export type SectionId = 'hero' | 'recomendacoes' | 'minha-lista' | 'avaliacoes' | 'catalogo' | 'sobre';

interface HeaderProps {
  activeSection: SectionId;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNavigate: (sectionId: SectionId) => void;
  onOpenChat: () => void;
  isMovieSelected: boolean;
}

const navItems: Array<{ id: SectionId; label: string; icon: typeof Home }> = [
  { id: 'hero', label: 'Início', icon: Home },
  { id: 'recomendacoes', label: 'Recomendações', icon: Sparkles },
  { id: 'minha-lista', label: 'Minha Lista', icon: Film },
  { id: 'avaliacoes', label: 'Avaliações', icon: Star },
  { id: 'catalogo', label: 'Catálogo', icon: Compass },
  { id: 'sobre', label: 'Sobre', icon: Info },
];

export function Header({
  activeSection,
  searchQuery,
  onSearchChange,
  onNavigate,
  onOpenChat,
  isMovieSelected,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <button
              type="button"
              onClick={() => onNavigate('hero')}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-300">
                <Film className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">CineReviews</h1>
                <p className="text-slate-400 text-sm">
                  Descubra filmes, salve favoritos e compartilhe suas opiniões.
                </p>
              </div>
            </button>

            <div className="relative w-full lg:max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar filmes pelo nome..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40 focus:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <nav className="hidden md:flex flex-wrap gap-2 items-center">
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id && !isMovieSelected;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onNavigate(id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${
                      isActive
                        ? 'bg-sky-400 text-slate-950'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 px-4 py-2 text-sky-100 transition hover:bg-sky-400/20"
              >
                <MessageCircle className="h-4 w-4" />
                CineBot
              </button>
            </nav>

            <div className="md:hidden -mx-1 flex overflow-x-auto pb-1">
              <div className="flex gap-2 px-1">
                {navItems.map(({ id, label, icon: Icon }) => {
                  const isActive = activeSection === id && !isMovieSelected;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onNavigate(id)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition ${
                        isActive
                          ? 'bg-sky-400 text-slate-950'
                          : 'border border-white/10 bg-slate-900/60 text-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm whitespace-nowrap text-sky-100"
                >
                  <MessageCircle className="h-4 w-4" />
                  CineBot
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-400">
              {isMovieSelected
                ? 'Você está vendo os detalhes de um filme. Use o menu para continuar explorando.'
                : 'Escolha uma área acima para descobrir filmes do seu jeito.'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
