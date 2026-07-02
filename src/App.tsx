import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Film, MessageCircle, Search, Sparkles, X } from 'lucide-react';
import { Header } from './components/Header';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetails } from './components/MovieDetails';
import { ChatBot } from './components/ChatBot';
import { MovieShelf } from './components/MovieShelf';
import { Movie, Review } from './types/movie';
import { tmdbService } from './services/tmdb';
import { MovieAdapter } from './services/movieAdapter';

type SectionId = 'hero' | 'recomendacoes' | 'avaliacoes' | 'catalogo' | 'sobre';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSection, setPendingSection] = useState<SectionId | null>(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError(null);

        const [popularTmdbMovies, trendingTmdbMovies] = await Promise.all([
          tmdbService.getPopularMovies(),
          tmdbService.getTrendingMovies(),
        ]);

        if (popularTmdbMovies.length === 0) {
          throw new Error('A API não retornou nenhum filme.');
        }

        const popularMovies = await Promise.all(
          popularTmdbMovies.map(async (tmdbMovie) => {
            const providers = await tmdbService.getWatchProviders(tmdbMovie.id);
            return MovieAdapter.fromTMDBToMovie(tmdbMovie, providers);
          })
        );

        const trendingAdaptedMovies = trendingTmdbMovies.map((tmdbMovie) =>
          MovieAdapter.fromTMDBToMovie(tmdbMovie)
        );

        setMovies(popularMovies);
        setTrendingMovies(trendingAdaptedMovies);
      } catch (err: unknown) {
        console.error('Erro ao carregar filmes:', err);
        const message = err instanceof Error ? err.message : 'Verifique sua chave do TMDB.';
        setError(`Falha ao carregar filmes da API: ${message}`);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const tmdbResults = await tmdbService.searchMovies(trimmedQuery);
        const adaptedResults = tmdbResults
          .slice(0, 12)
          .map((tmdbMovie) => mergeWithExistingReviews(MovieAdapter.fromTMDBToMovie(tmdbMovie)));

        if (!ignore) {
          setSearchResults(adaptedResults);
        }
      } catch (err) {
        console.error('Erro ao buscar filmes:', err);
        if (!ignore) {
          setSearchResults([]);
        }
      } finally {
        if (!ignore) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, movies, selectedMovie]);

  useEffect(() => {
    if (!pendingSection || selectedMovie) return;

    const timeoutId = window.setTimeout(() => {
      document.getElementById(pendingSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingSection(null);
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [pendingSection, selectedMovie]);

  const mergeWithExistingReviews = (movie: Movie): Movie => {
    const movieFromList = movies.find((currentMovie) => currentMovie.id === movie.id);
    const matchingSource = movieFromList ?? (selectedMovie?.id === movie.id ? selectedMovie : null);

    if (!matchingSource) return movie;

    return {
      ...movie,
      userReviews: matchingSource.userReviews,
      averageRating: matchingSource.userReviews.length > 0 ? matchingSource.averageRating : movie.averageRating,
    };
  };

  const allGenres = useMemo(
    () => ['Todos', ...Array.from(new Set(movies.flatMap((movie) => movie.genre))).sort((a, b) => a.localeCompare(b))],
    [movies]
  );

  const featuredMovie = trendingMovies[0] ?? movies[0] ?? null;
  const recommendedTonight = [...movies].sort((a, b) => b.averageRating - a.averageRating).slice(0, 4);
  const trendingShelf = trendingMovies.length > 0 ? trendingMovies.slice(0, 6) : movies.slice(0, 6);
  const recentFavorites = [...movies]
    .sort((a, b) => b.year - a.year || b.averageRating - a.averageRating)
    .slice(0, 6);

  const filteredCatalogMovies =
    selectedGenre === 'Todos'
      ? movies
      : movies.filter((movie) => movie.genre.some((genre) => genre.toLowerCase() === selectedGenre.toLowerCase()));

  const activeCatalogMovies = searchQuery.trim().length >= 2 ? searchResults : filteredCatalogMovies;
  const totalReviews = movies.reduce((acc, movie) => acc + movie.userReviews.length, 0);
  const averageCommunityRating =
    movies.length > 0 ? movies.reduce((acc, movie) => acc + movie.averageRating, 0) / movies.length : 0;

  const handleAddReview = (movieId: string, review: Review) => {
    setMovies((prevMovies) =>
      prevMovies.map((movie) =>
        movie.id === movieId
          ? {
              ...movie,
              userReviews: [...movie.userReviews, review],
              averageRating:
                (movie.averageRating * movie.userReviews.length + review.rating) /
                (movie.userReviews.length + 1),
            }
          : movie
      )
    );

    if (selectedMovie && selectedMovie.id === movieId) {
      setSelectedMovie((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          userReviews: [...prev.userReviews, review],
          averageRating:
            (prev.averageRating * prev.userReviews.length + review.rating) /
            (prev.userReviews.length + 1),
        };
      });
    }
  };

  const handleSelectMovie = async (movie: Movie) => {
    try {
      const movieId = Number(movie.id);
      const [tmdbMovieDetails, providers] = await Promise.all([
        tmdbService.getMovieById(movieId),
        tmdbService.getWatchProviders(movieId),
      ]);

      if (tmdbMovieDetails) {
        const detailedMovie = mergeWithExistingReviews(
          MovieAdapter.fromTMDBToMovie(tmdbMovieDetails, providers)
        );
        setSelectedMovie(detailedMovie);
        return;
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do filme:', err);
    }

    setSelectedMovie(movie);
  };

  const handleNavigate = (sectionId: SectionId) => {
    if (selectedMovie) {
      setPendingSection(sectionId);
      setSelectedMovie(null);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) return;

    if (selectedMovie) {
      setPendingSection('catalogo');
      setSelectedMovie(null);
      return;
    }

    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetCatalogView = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedGenre('Todos');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Film className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-slate-300 text-lg font-medium">Carregando filmes da API...</p>
          <p className="text-slate-500 text-sm mt-2">Isso pode levar alguns segundos.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Erro ao conectar com a API</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-slate-400 text-sm mb-2">Para corrigir:</p>
            <ol className="text-slate-300 text-sm list-decimal list-inside space-y-1">
              <li>Verifique se sua chave do TMDB está correta no arquivo `.env`.</li>
              <li>Certifique-se de que reiniciou o servidor após adicionar a chave.</li>
              <li>Verifique sua conexão com a internet.</li>
              <li>Se necessário, gere uma nova chave no site do TMDB.</li>
            </ol>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] text-white">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onNavigate={handleNavigate}
        onOpenChat={() => setIsChatOpen(true)}
        isMovieSelected={Boolean(selectedMovie)}
      />

      <main className="container mx-auto px-4 py-8">
        {selectedMovie ? (
          <MovieDetails movie={selectedMovie} onBack={() => setSelectedMovie(null)} onAddReview={handleAddReview} />
        ) : (
          <div className="space-y-12">
            {featuredMovie && (
              <section
                id="hero"
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10 backdrop-blur"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/15 via-transparent to-amber-400/10" />
                <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.9fr] items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1 text-sm text-sky-200">
                      <Sparkles className="h-4 w-4" />
                      Destaque da semana
                    </div>
                    <h2 className="mt-5 max-w-2xl text-4xl md:text-5xl font-black tracking-tight">
                      Descubra o próximo filme que merece sua atenção.
                    </h2>
                    <p className="mt-4 max-w-2xl text-slate-300 text-lg leading-8">
                      Explore lançamentos, encontre onde assistir e registre suas próprias avaliações em um só lugar.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectMovie(featuredMovie)}
                        className="rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
                      >
                        Ver destaque: {featuredMovie.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('recomendacoes')}
                        className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                      >
                        Ver recomendações
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChatOpen(true)}
                        className="rounded-full border border-sky-400/30 bg-sky-400/10 px-6 py-3 font-semibold text-sky-100 transition hover:bg-sky-400/20"
                      >
                        Pedir sugestões ao CineBot
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectMovie(featuredMovie)}
                    className="group rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4 text-left shadow-2xl shadow-sky-950/30 transition hover:-translate-y-1 hover:border-sky-400/30"
                  >
                    <div className="overflow-hidden rounded-[1.2rem]">
                      <img
                        src={featuredMovie.poster}
                        alt={featuredMovie.title}
                        className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-sky-200/70">Escolha em destaque</p>
                        <h3 className="mt-2 text-2xl font-bold">{featuredMovie.title}</h3>
                      </div>
                      <div className="rounded-2xl bg-amber-400/10 px-4 py-2 text-right">
                        <p className="text-xs uppercase tracking-wide text-amber-200/80">Nota</p>
                        <p className="text-2xl font-black text-amber-300">{featuredMovie.averageRating.toFixed(1)}</p>
                      </div>
                    </div>
                  </button>
                </div>
              </section>
            )}

            <section id="avaliacoes" className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Filmes no catálogo</p>
                <p className="mt-4 text-4xl font-black">{movies.length}</p>
                <p className="mt-2 text-slate-400">Um ponto de partida sólido para explorar títulos populares.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Média geral</p>
                <p className="mt-4 text-4xl font-black">{averageCommunityRating.toFixed(1)}</p>
                <p className="mt-2 text-slate-400">A média das notas visíveis hoje na vitrine principal do site.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Reviews da comunidade</p>
                <p className="mt-4 text-4xl font-black">{totalReviews}</p>
                <p className="mt-2 text-slate-400">Esse número cresce a cada avaliação enviada pelos usuários.</p>
              </div>
            </section>

            <section id="recomendacoes" className="space-y-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-sky-200/70">Recomendações</p>
                  <h2 className="text-3xl md:text-4xl font-black">Coleções rápidas para navegar sem se perder</h2>
                </div>
                <p className="max-w-xl text-slate-400">
                  Separei trilhas de descoberta para quem quer abrir o site e já encontrar algo promissor.
                </p>
              </div>

              <MovieShelf
                title="Para começar bem a noite"
                description="Os títulos com melhor nota média entre os filmes já carregados."
                movies={recommendedTonight}
                onSelectMovie={handleSelectMovie}
              />

              <MovieShelf
                title="Em alta agora"
                description="Uma faixa com os filmes que estão chamando atenção no momento."
                movies={trendingShelf}
                onSelectMovie={handleSelectMovie}
              />

              <MovieShelf
                title="Favoritos recentes"
                description="Uma seleção puxando filmes mais novos com boa nota para descoberta rápida."
                movies={recentFavorites}
                onSelectMovie={handleSelectMovie}
              />
            </section>

            <section id="catalogo" className="space-y-8">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-sm uppercase tracking-[0.28em] text-sky-200/70">Catálogo</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-black">Busque por nome ou filtre por gênero</h2>
                    <p className="mt-3 text-slate-400">
                      A busca consulta o TMDB enquanto você digita, e os gêneros ajudam a navegar pelos títulos já carregados.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                      <span className="text-emerald-300">●</span>
                      {isSearching ? 'Buscando filmes...' : `${activeCatalogMovies.length} resultados visíveis`}
                    </div>
                    {(searchQuery || selectedGenre !== 'Todos') && (
                      <button
                        type="button"
                        onClick={resetCatalogView}
                        className="text-sm text-slate-300 underline underline-offset-4 hover:text-white"
                      >
                        Limpar busca e filtros
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => handleSearchChange(event.target.value)}
                      placeholder="Busque por um filme, por exemplo: Interestelar, Barbie, Parasita..."
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-4 pl-12 pr-12 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40 focus:bg-slate-950"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        aria-label="Limpar busca"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {allGenres.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => setSelectedGenre(genre)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          selectedGenre === genre
                            ? 'bg-sky-400 text-slate-950'
                            : 'border border-white/10 bg-slate-950/50 text-slate-300 hover:border-sky-400/30 hover:text-white'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <MovieGrid
                title={searchQuery.trim().length >= 2 ? 'Resultados da busca' : 'Catálogo popular'}
                description={
                  searchQuery.trim().length >= 2
                    ? 'Filmes encontrados a partir da sua busca atual.'
                    : selectedGenre === 'Todos'
                      ? 'Os filmes populares carregados para exploração livre.'
                      : `Filtrando o catálogo pelo gênero ${selectedGenre}.`
                }
                movies={activeCatalogMovies}
                emptyMessage={
                  searchQuery.trim().length >= 2
                    ? 'Nenhum filme encontrado para essa busca. Tente outro título.'
                    : 'Nenhum filme encontrado para esse gênero. Tente outro filtro.'
                }
                onSelectMovie={handleSelectMovie}
              />
            </section>
          </div>
        )}
      </main>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isChatOpen
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        }`}
        aria-label={isChatOpen ? 'Fechar chatbot' : 'Abrir chatbot'}
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
      >
        {isChatOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        )}
      </button>

      <ChatBot movies={movies} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <footer className="mt-16 py-8 border-t border-slate-800 bg-slate-900/50" id="sobre">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-slate-400">CineReviews - Dados fornecidos por TMDB</p>
              <p className="text-slate-500 text-sm mt-1">
                Aplicação React/TypeScript com integração de API para descoberta, detalhes e reviews de filmes.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
                alt="TMDB Logo"
                className="h-6 opacity-70"
              />
              <span className="text-slate-500 text-sm">API v3</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
