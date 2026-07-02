import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart3, Film, MessageCircle, Search, Sparkles, Star, Users, X } from 'lucide-react';
import { Header, type SectionId } from './components/Header';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetails } from './components/MovieDetails';
import { ChatBot } from './components/ChatBot';
import { MovieShelf } from './components/MovieShelf';
import { Movie, Review } from './types/movie';
import { tmdbService } from './services/tmdb';
import { MovieAdapter } from './services/movieAdapter';

type CatalogSort = 'relevance' | 'rating' | 'year' | 'title';

const REVIEWS_STORAGE_KEY = 'cine-reviews-user-reviews';
const WATCHLIST_STORAGE_KEY = 'cine-reviews-watchlist';
const RECENT_STORAGE_KEY = 'cine-reviews-recently-viewed';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) return fallback;

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`Não foi possível ler ${key}:`, error);
    return fallback;
  }
}

function calculateAverageRating(tmdbRating: number, reviews: Review[]) {
  if (reviews.length === 0) return tmdbRating;

  const reviewsTotal = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((((tmdbRating * 2) + reviewsTotal) / (reviews.length + 2)).toFixed(1));
}

function syncMovieWithReviews(movie: Movie, reviewsMap: Record<string, Review[]>) {
  const reviews = reviewsMap[movie.id] ?? [];

  return {
    ...movie,
    userReviews: reviews,
    averageRating: calculateAverageRating(movie.tmdbRating, reviews),
  };
}

function pushRecentMovie(movieIds: string[], movieId: string) {
  return [movieId, ...movieIds.filter((id) => id !== movieId)].slice(0, 8);
}

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [catalogSort, setCatalogSort] = useState<CatalogSort>('relevance');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [storedReviews, setStoredReviews] = useState<Record<string, Review[]>>(() =>
    readStorage<Record<string, Review[]>>(REVIEWS_STORAGE_KEY, {})
  );
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() =>
    readStorage<string[]>(WATCHLIST_STORAGE_KEY, [])
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    readStorage<string[]>(RECENT_STORAGE_KEY, [])
  );

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
            return syncMovieWithReviews(MovieAdapter.fromTMDBToMovie(tmdbMovie, providers), storedReviews);
          })
        );

        const trendingAdaptedMovies = trendingTmdbMovies.map((tmdbMovie) =>
          syncMovieWithReviews(MovieAdapter.fromTMDBToMovie(tmdbMovie), storedReviews)
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
    window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(storedReviews));
  }, [storedReviews]);

  useEffect(() => {
    window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlistIds));
  }, [watchlistIds]);

  useEffect(() => {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  useEffect(() => {
    setMovies((prevMovies) => prevMovies.map((movie) => syncMovieWithReviews(movie, storedReviews)));
    setTrendingMovies((prevMovies) => prevMovies.map((movie) => syncMovieWithReviews(movie, storedReviews)));
    setSearchResults((prevMovies) => prevMovies.map((movie) => syncMovieWithReviews(movie, storedReviews)));
    setSelectedMovie((prevMovie) => (prevMovie ? syncMovieWithReviews(prevMovie, storedReviews) : prevMovie));
  }, [storedReviews]);

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
          .map((tmdbMovie) => syncMovieWithReviews(MovieAdapter.fromTMDBToMovie(tmdbMovie), storedReviews));

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
  }, [searchQuery, storedReviews]);

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
      ? [...movies]
      : movies.filter((movie) => movie.genre.some((genre) => genre.toLowerCase() === selectedGenre.toLowerCase()));

  const baseCatalogMovies = searchQuery.trim().length >= 2 ? [...searchResults] : filteredCatalogMovies;
  const activeCatalogMovies = [...baseCatalogMovies].sort((movieA, movieB) => {
    if (catalogSort === 'rating') return movieB.averageRating - movieA.averageRating;
    if (catalogSort === 'year') return movieB.year - movieA.year || movieB.averageRating - movieA.averageRating;
    if (catalogSort === 'title') return movieA.title.localeCompare(movieB.title);
    return 0;
  });

  const totalReviews = movies.reduce((acc, movie) => acc + movie.userReviews.length, 0);
  const averageCommunityRating =
    movies.length > 0 ? movies.reduce((acc, movie) => acc + movie.averageRating, 0) / movies.length : 0;
  const highlightedReviews = [...movies]
    .filter((movie) => movie.userReviews.length > 0)
    .sort((a, b) => b.userReviews.length - a.userReviews.length || b.averageRating - a.averageRating)
    .slice(0, 3);

  const movieLookup = useMemo(() => {
    const map = new Map<string, Movie>();
    [...movies, ...trendingMovies, ...searchResults, ...(selectedMovie ? [selectedMovie] : [])].forEach((movie) => {
      map.set(movie.id, syncMovieWithReviews(movie, storedReviews));
    });
    return map;
  }, [movies, trendingMovies, searchResults, selectedMovie, storedReviews]);

  const watchlistMovies = watchlistIds
    .map((movieId) => movieLookup.get(movieId))
    .filter((movie): movie is Movie => Boolean(movie));

  const recentlyViewedMovies = recentlyViewedIds
    .map((movieId) => movieLookup.get(movieId))
    .filter((movie): movie is Movie => Boolean(movie));

  const handleToggleWatchlist = (movieId: string) => {
    setWatchlistIds((prevIds) =>
      prevIds.includes(movieId) ? prevIds.filter((id) => id !== movieId) : [movieId, ...prevIds]
    );
  };

  const handleAddReview = (movieId: string, review: Review) => {
    setStoredReviews((prevReviews) => ({
      ...prevReviews,
      [movieId]: [...(prevReviews[movieId] ?? []), review],
    }));
  };

  const handleSelectMovie = async (movie: Movie) => {
    setRecentlyViewedIds((prevIds) => pushRecentMovie(prevIds, movie.id));

    try {
      const movieId = Number(movie.id);
      const [tmdbMovieDetails, providers] = await Promise.all([
        tmdbService.getMovieById(movieId),
        tmdbService.getWatchProviders(movieId),
      ]);

      if (tmdbMovieDetails) {
        const detailedMovie = syncMovieWithReviews(
          MovieAdapter.fromTMDBToMovie(tmdbMovieDetails, providers),
          storedReviews
        );
        setSelectedMovie(detailedMovie);
        return;
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do filme:', err);
    }

    setSelectedMovie(syncMovieWithReviews(movie, storedReviews));
  };

  const handleNavigate = (sectionId: SectionId) => {
    setActiveSection(sectionId);

    if (selectedMovie) {
      setSelectedMovie(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) return;

    setActiveSection('catalogo');

    if (selectedMovie) {
      setSelectedMovie(null);
    }
  };

  const resetCatalogView = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedGenre('Todos');
    setCatalogSort('relevance');
  };

  const renderHeroView = () => (
    <div className="space-y-12">
      {featuredMovie && (
        <section
          id="hero"
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur md:p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/15 via-transparent to-amber-400/10" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1 text-sm text-sky-200">
                <Sparkles className="h-4 w-4" />
                Destaque da semana
              </div>
              <h2 className="mt-5 max-w-2xl text-4xl font-black tracking-tight md:text-5xl">
                Descubra o próximo filme que merece sua atenção.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Descubra o que assistir hoje, salve seus favoritos e compartilhe sua opinião sem complicação.
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
                  onClick={() => setActiveSection('recomendacoes')}
                  className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Ver recomendações
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('minha-lista')}
                  className="rounded-full border border-sky-400/30 bg-sky-400/10 px-6 py-3 font-semibold text-sky-100 transition hover:bg-sky-400/20"
                >
                  Abrir minha lista
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

      <section className="grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setActiveSection('catalogo')}
          className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-left transition hover:border-sky-400/30 hover:bg-slate-900/80"
        >
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Catálogo</p>
          <p className="mt-4 text-4xl font-black">{movies.length}</p>
          <p className="mt-2 text-slate-400">Encontre algo do seu jeito, com busca, filtros e sugestões.</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('avaliacoes')}
          className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-left transition hover:border-sky-400/30 hover:bg-slate-900/80"
        >
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Média geral</p>
          <p className="mt-4 text-4xl font-black">{averageCommunityRating.toFixed(1)}</p>
          <p className="mt-2 text-slate-400">Veja quais filmes estão agradando mais por aqui.</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('minha-lista')}
          className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-left transition hover:border-sky-400/30 hover:bg-slate-900/80"
        >
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Minha lista</p>
          <p className="mt-4 text-4xl font-black">{watchlistIds.length}</p>
          <p className="mt-2 text-slate-400">Guarde filmes interessantes para voltar depois com facilidade.</p>
        </button>
      </section>

      <MovieShelf
        title="Comece por aqui"
        description="Uma seleção rápida para entrar no clima e encontrar um bom filme logo de cara."
        movies={recommendedTonight}
        watchlistIds={watchlistIds}
        onSelectMovie={handleSelectMovie}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  );

  const renderRecommendationsView = () => (
    <section id="recomendacoes" className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-200/70">Recomendações</p>
          <h2 className="text-3xl font-black md:text-4xl">Coleções rápidas para navegar sem se perder</h2>
        </div>
        <p className="max-w-xl text-slate-400">
          Seleções pensadas para quem quer entrar e já sair com uma boa opção para assistir.
        </p>
      </div>

      <MovieShelf
        title="Para começar bem a noite"
        description="Os títulos com melhor nota média entre os filmes já carregados."
        movies={recommendedTonight}
        watchlistIds={watchlistIds}
        onSelectMovie={handleSelectMovie}
        onToggleWatchlist={handleToggleWatchlist}
      />

      <MovieShelf
        title="Em alta agora"
        description="Uma faixa com os filmes que estão chamando atenção no momento."
        movies={trendingShelf}
        watchlistIds={watchlistIds}
        onSelectMovie={handleSelectMovie}
        onToggleWatchlist={handleToggleWatchlist}
      />

      <MovieShelf
        title="Favoritos recentes"
        description="Uma seleção puxando filmes mais novos com boa nota para descoberta rápida."
        movies={recentFavorites}
        watchlistIds={watchlistIds}
        onSelectMovie={handleSelectMovie}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </section>
  );

  const renderWatchlistView = () => (
    <section id="minha-lista" className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-200/70">Minha Lista</p>
          <h2 className="text-3xl font-black md:text-4xl">Filmes salvos e histórico recente</h2>
        </div>
        <p className="max-w-xl text-slate-400">
          Um espaço para guardar o que chamou sua atenção e retomar filmes vistos recentemente.
        </p>
      </div>

      {watchlistMovies.length > 0 ? (
        <MovieShelf
          title="Salvos para depois"
          description="Os filmes que você marcou para revisitar durante a navegação."
          movies={watchlistMovies}
          watchlistIds={watchlistIds}
          onSelectMovie={handleSelectMovie}
          onToggleWatchlist={handleToggleWatchlist}
        />
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-white/15 bg-slate-900/40 p-8 text-slate-300">
          <h3 className="text-xl font-bold text-white">Sua lista ainda está vazia</h3>
          <p className="mt-2 max-w-2xl text-slate-400">
            Use o botão “Salvar” nos cards ou nos detalhes do filme para montar uma lista pessoal de títulos interessantes.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">Vistos recentemente</h3>
              <p className="mt-1 text-slate-400">Retome os últimos filmes que você abriu.</p>
            </div>
            {recentlyViewedMovies.length > 0 && (
              <button
                type="button"
                onClick={() => setRecentlyViewedIds([])}
                className="text-sm text-slate-300 underline underline-offset-4 hover:text-white"
              >
                Limpar histórico
              </button>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {recentlyViewedMovies.length > 0 ? (
              recentlyViewedMovies.map((movie, index) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => handleSelectMovie(movie)}
                  className="flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-left transition hover:border-sky-400/30 hover:bg-slate-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-white">{movie.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {movie.year} • {movie.duration} min • {movie.genre[0] ?? 'Filme'}
                    </p>
                  </div>
                  <div className="rounded-full bg-amber-400/10 px-3 py-1.5 text-sm font-semibold text-amber-300">
                    {movie.averageRating.toFixed(1)}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-6 text-slate-400">
                Ainda não há filmes no histórico. Abra alguns detalhes para preencher esta área.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Tudo em um só lugar</h3>
              <p className="text-slate-400">Tudo o que ajuda você a escolher melhor o próximo filme.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              Salve filmes interessantes para comparar com calma antes de decidir.
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              Volte aos últimos títulos vistos sem precisar buscar tudo de novo.
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              Deixe sua opinião e continue de onde parou na próxima visita.
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderRatingsView = () => (
    <section id="avaliacoes" className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-200/70">Avaliações</p>
          <h2 className="text-3xl font-black md:text-4xl">Como o público está reagindo aos filmes</h2>
        </div>
        <p className="max-w-xl text-slate-400">
          Veja rapidamente quais títulos estão recebendo mais atenção e melhores notas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Filmes no catálogo</p>
          <p className="mt-4 text-4xl font-black">{movies.length}</p>
          <p className="mt-2 text-slate-400">Uma seleção ampla para começar a explorar sem dificuldade.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Média geral</p>
          <p className="mt-4 text-4xl font-black">{averageCommunityRating.toFixed(1)}</p>
          <p className="mt-2 text-slate-400">Uma visão rápida do que está agradando mais entre os filmes mostrados.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Reviews da comunidade</p>
          <p className="mt-4 text-4xl font-black">{totalReviews}</p>
          <p className="mt-2 text-slate-400">Cada review ajuda outras pessoas a decidir melhor o que assistir.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-400/10 p-3 text-sky-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Destaques em review</h3>
              <p className="text-slate-400">Filmes que estão chamando mais atenção por aqui.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(highlightedReviews.length > 0 ? highlightedReviews : movies.slice(0, 3)).map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => handleSelectMovie(movie)}
                className="flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-left transition hover:border-sky-400/30 hover:bg-slate-900"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-lg font-black text-white">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-white">{movie.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {movie.userReviews.length > 0
                      ? `${movie.userReviews.length} review${movie.userReviews.length > 1 ? 's' : ''} enviada${movie.userReviews.length > 1 ? 's' : ''}`
                      : 'Ainda sem reviews. Seja a primeira pessoa a avaliar.'}
                  </p>
                </div>
                <div className="rounded-full bg-amber-400/10 px-3 py-1.5 text-sm font-semibold text-amber-300">
                  {movie.averageRating.toFixed(1)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Por que usar o CineReviews</h3>
              <p className="text-slate-400">Um jeito simples de descobrir, comparar e escolher melhor.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              Encontre filmes por nome, por gênero ou pelas sugestões que fazem mais sentido para o momento.
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              Compare opções com rapidez antes de abrir os detalhes completos de cada título.
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              Veja onde assistir, leia a sinopse e conte o que achou de cada filme.
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderCatalogView = () => (
    <section id="catalogo" className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-sky-200/70">Catálogo</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Busque por nome, filtre e ordene</h2>
          <p className="mt-3 text-slate-400">
            Use a busca, ajuste os filtros e encontre mais rápido algo que combine com seu momento.
          </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
              <span className="text-emerald-300">●</span>
                      {isSearching ? 'Buscando filmes...' : `${activeCatalogMovies.length} resultados encontrados`}
            </div>
            {(searchQuery || selectedGenre !== 'Todos' || catalogSort !== 'relevance') && (
              <button
                type="button"
                onClick={resetCatalogView}
                className="text-sm text-slate-300 underline underline-offset-4 hover:text-white"
              >
                Limpar busca, filtros e ordenação
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

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

            <label className="flex items-center gap-3 text-sm text-slate-300">
              Ordenar por
              <select
                value={catalogSort}
                onChange={(event) => setCatalogSort(event.target.value as CatalogSort)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-white outline-none transition focus:border-sky-400/40"
              >
                <option value="relevance">{searchQuery.trim().length >= 2 ? 'Relevância' : 'Ordem original'}</option>
                <option value="rating">Melhor nota</option>
                <option value="year">Mais recentes</option>
                <option value="title">Título (A-Z)</option>
              </select>
            </label>
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
        watchlistIds={watchlistIds}
        emptyMessage={
          searchQuery.trim().length >= 2
            ? 'Nenhum filme encontrado para essa busca. Tente outro título.'
            : 'Nenhum filme encontrado para esse gênero. Tente outro filtro.'
        }
        onSelectMovie={handleSelectMovie}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </section>
  );

  const renderAboutView = () => (
    <section id="sobre" className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-200/70">Sobre</p>
          <h2 className="text-3xl font-black md:text-4xl">O que é o CineReviews</h2>
        </div>
        <p className="max-w-xl text-slate-400">
          Um lugar para descobrir filmes, salvar favoritos e compartilhar suas impressões.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-white">Busca e descoberta</h3>
          <p className="mt-3 text-slate-400">
            O usuário encontra filmes pelo nome, filtra por gênero e navega por coleções curadas.
          </p>
        </div>

        <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
            <Star className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-white">Avaliação de filmes</h3>
          <p className="mt-3 text-slate-400">
            Cada filme pode receber sua nota e sua opinião para tornar a escolha mais pessoal.
          </p>
        </div>

        <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-white">Assistente CineBot</h3>
          <p className="mt-3 text-slate-400">
            Um apoio conversacional para recomendações, consulta de nota e orientação de descoberta.
          </p>
        </div>
      </div>
    </section>
  );

  const renderCurrentView = () => {
    switch (activeSection) {
      case 'recomendacoes':
        return renderRecommendationsView();
      case 'minha-lista':
        return renderWatchlistView();
      case 'avaliacoes':
        return renderRatingsView();
      case 'catalogo':
        return renderCatalogView();
      case 'sobre':
        return renderAboutView();
      case 'hero':
      default:
        return renderHeroView();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <Film className="mx-auto mb-2 h-8 w-8 text-blue-500" />
          <p className="text-lg font-medium text-slate-300">Carregando filmes da API...</p>
          <p className="mt-2 text-sm text-slate-500">Isso pode levar alguns segundos.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-white">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
          <h2 className="mb-3 text-2xl font-bold">Erro ao conectar com a API</h2>
          <p className="mb-4 text-slate-300">{error}</p>
          <div className="mb-6 rounded-lg bg-slate-800/50 p-4 text-left">
            <p className="mb-2 text-sm text-slate-400">Para corrigir:</p>
            <ol className="list-inside list-decimal space-y-1 text-sm text-slate-300">
              <li>Verifique se sua chave do TMDB está correta no arquivo `.env`.</li>
              <li>Certifique-se de que reiniciou o servidor após adicionar a chave.</li>
              <li>Verifique sua conexão com a internet.</li>
              <li>Se necessário, gere uma nova chave no site do TMDB.</li>
            </ol>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
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
        activeSection={activeSection}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onNavigate={handleNavigate}
        onOpenChat={() => setIsChatOpen(true)}
        isMovieSelected={Boolean(selectedMovie)}
      />

      <main className="container mx-auto px-4 py-8">
        {selectedMovie ? (
          <MovieDetails
            movie={selectedMovie}
            isInWatchlist={watchlistIds.includes(selectedMovie.id)}
            onBack={() => setSelectedMovie(null)}
            onAddReview={handleAddReview}
            onToggleWatchlist={handleToggleWatchlist}
          />
        ) : (
          renderCurrentView()
        )}
      </main>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 sm:h-14 sm:w-14 ${
          isChatOpen
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        }`}
        aria-label={isChatOpen ? 'Fechar chatbot' : 'Abrir chatbot'}
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
      >
        {isChatOpen ? (
          <X className="h-5 w-5 text-white sm:h-6 sm:w-6" />
        ) : (
          <MessageCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
        )}
      </button>

      <ChatBot movies={movies} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <footer className="mt-16 border-t border-slate-800 bg-slate-900/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-slate-400">CineReviews - Dados fornecidos por TMDB</p>
              <p className="mt-1 text-sm text-slate-500">
                Seu espaço para descobrir filmes, guardar favoritos e compartilhar opiniões.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
                alt="TMDB Logo"
                className="h-6 opacity-70"
              />
              <span className="text-sm text-slate-500">API v3</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
