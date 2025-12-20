import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetails } from './components/MovieDetails';
import { ChatBot } from './components/ChatBot';
import { Movie, Review } from './types/movie';
import { MessageCircle, X, AlertCircle, Film } from 'lucide-react';
import { tmdbService } from './services/tmdb';
import { MovieAdapter } from './services/movieAdapter';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Carregando filmes da API TMDB...');
        
        const tmdbMovies = await tmdbService.getPopularMovies();
        
        if (tmdbMovies.length === 0) {
          throw new Error('A API não retornou nenhum filme');
        }
        
        const convertedMovies: Movie[] = await Promise.all(
          tmdbMovies.map(async (tmdbMovie) => {
            const providers = await tmdbService.getWatchProviders(tmdbMovie.id);
            return MovieAdapter.fromTMDBToMovie(tmdbMovie, providers);
          })
        );
        
        setMovies(convertedMovies);
        console.log(`Carregados ${convertedMovies.length} filmes da API`);
        
      } catch (err: any) {
        console.error('Erro ao carregar filmes:', err);
        setError(`Falha ao carregar filmes da API: ${err.message || 'Verifique sua chave do TMDB'}`);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  const handleAddReview = (movieId: string, review: Review) => {
    setMovies(prevMovies =>
      prevMovies.map(movie =>
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
      setSelectedMovie(prev => {
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
      const tmdbMovieDetails = await tmdbService.getMovieById(parseInt(movie.id));
      const providers = await tmdbService.getWatchProviders(parseInt(movie.id));
      
      if (tmdbMovieDetails) {
        const detailedMovie = MovieAdapter.fromTMDBToMovie(tmdbMovieDetails, providers);
        detailedMovie.userReviews = movie.userReviews;
        setSelectedMovie(detailedMovie);
      } else {
        setSelectedMovie(movie);
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do filme:', err);
      setSelectedMovie(movie);
    }
  };

  const handleBackToList = () => {
    setSelectedMovie(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Film className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-slate-300 text-lg font-medium">Carregando filmes da API...</p>
          <p className="text-slate-500 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-3">Erro ao conectar com a API</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-slate-400 text-sm mb-2">Para corrigir:</p>
            <ol className="text-slate-300 text-sm list-decimal list-inside space-y-1">
              <li>Verifique se sua chave do TMDB está correta no arquivo .env</li>
              <li>Certifique-se de que reiniciou o servidor após adicionar a chave</li>
              <li>Verifique sua conexão com a internet</li>
              <li>A chave pode ter expirado - gere uma nova no site do TMDB</li>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {selectedMovie ? (
          <MovieDetails
            movie={selectedMovie}
            onBack={handleBackToList}
            onAddReview={handleAddReview}
          />
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">🎬 Filmes Populares</h2>
                  <p className="text-slate-400">Dados em tempo real do The Movie Database</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-sm">
                    <span className="text-green-400">●</span> API Conectada
                  </p>
                  <p className="text-slate-500 text-xs">
                    {movies.length} filmes carregados
                  </p>
                </div>
              </div>
            </div>
            
            <MovieGrid
              movies={movies}
              onSelectMovie={handleSelectMovie}
            />
          </>
        )}
      </main>

<button
  onClick={() => setIsChatOpen(!isChatOpen)}
  className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
    isChatOpen 
      ? 'bg-red-600 hover:bg-red-700' 
      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
  }`}
  aria-label={isChatOpen ? "Fechar ChatBot" : "Abrir ChatBot"}
  style={{ 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  }}
>
  {isChatOpen ? (
    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
  ) : (
    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
  )}
</button>

      <ChatBot 
        movies={movies} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      <footer className="mt-16 py-8 border-t border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-slate-400">
                🎬 CineReviews - Dados fornecidos por TMDB
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Aplicação React/TypeScript com integração de API
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