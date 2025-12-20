// App.tsx
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetails } from './components/MovieDetails';
import { ChatBot } from './components/ChatBot';
import { Movie, Review } from './data/mockData';
import { MessageCircle, X } from 'lucide-react';
import { tmdbService } from './services/tmdb';
import { MovieAdapter } from './services/movieAdapter';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar filmes da API
  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar filmes populares do TMDB
        const tmdbMovies = await tmdbService.getPopularMovies();
        
        // Converter para o formato da nossa aplicação
        const convertedMovies: Movie[] = await Promise.all(
          tmdbMovies.map(async (tmdbMovie) => {
            const providers = await tmdbService.getWatchProviders(tmdbMovie.id);
            return MovieAdapter.fromTMDBToMovie(tmdbMovie, providers);
          })
        );
        
        setMovies(convertedMovies);
      } catch (err) {
        console.error('Erro ao carregar filmes:', err);
        setError('Não foi possível carregar os filmes. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  // Função para adicionar review a um filme
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

    // Atualiza o filme selecionado se for o mesmo
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

  // Função para buscar detalhes completos de um filme
  const handleSelectMovie = async (movie: Movie) => {
    try {
      // Buscar detalhes completos do filme
      const tmdbMovieDetails = await tmdbService.getMovieById(parseInt(movie.id));
      const providers = await tmdbService.getWatchProviders(parseInt(movie.id));
      
      if (tmdbMovieDetails) {
        const detailedMovie = MovieAdapter.fromTMDBToMovie(tmdbMovieDetails, providers);
        // Manter os reviews existentes
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

  // Função para voltar à lista de filmes
  const handleBackToList = () => {
    setSelectedMovie(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-300">Carregando filmes da API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar filmes</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {selectedMovie ? (
          <MovieDetails
            movie={selectedMovie}
            onBack={handleBackToList}
            onAddReview={handleAddReview}
          />
        ) : (
          <MovieGrid
            movies={movies}
            onSelectMovie={handleSelectMovie}
          />
        )}
      </main>

      {/* Botão do ChatBot */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isChatOpen 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        }`}
        aria-label={isChatOpen ? "Fechar ChatBot" : "Abrir ChatBot"}
      >
        {isChatOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* ChatBot Component */}
      <ChatBot 
        movies={movies} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      <footer className="mt-16 py-8 border-t border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">
            🎬 CineReviews - Dados fornecidos por TMDB
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Este site usa a API do The Movie Database mas não é endossado ou certificado pelo TMDB
          </p>
          <div className="mt-4">
            <img 
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" 
              alt="TMDB Logo" 
              className="h-8 mx-auto opacity-50"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}