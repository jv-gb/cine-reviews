import { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';
import { Film, AlertCircle } from 'lucide-react';

interface MovieGridProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export function MovieGrid({ movies, onSelectMovie }: MovieGridProps) {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Film className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-3xl font-bold text-white">🎬 Catálogo de Filmes</h2>
            <p className="text-slate-400">Explore, avalie e compartilhe suas opiniões</p>
          </div>
        </div>
        
        {movies.length === 0 && (
          <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className="text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Nenhum filme encontrado. Tente recarregar a página.
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => onSelectMovie(movie)}
          />
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-slate-400">
          Mostrando {movies.length} filmes • Total de {movies.reduce((acc, movie) => acc + movie.userReviews.length, 0)} reviews
        </p>
        <p className="text-slate-500 text-sm mt-2">
          {movies.some(m => m.year > 2020) 
            ? 'Filmes atualizados em tempo real' 
            : 'Dados de demonstração'}
        </p>
      </div>
    </div>
  );
}