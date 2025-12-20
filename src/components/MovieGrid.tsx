import { Movie } from '../data/mockData';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export function MovieGrid({ movies, onSelectMovie }: MovieGridProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🎬 Filmes em Destaque</h2>
        <p className="text-slate-400">Explore, avalie e compartilhe suas opiniões sobre os melhores filmes</p>
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
      </div>
    </div>
  );
}