import { AlertCircle } from 'lucide-react';
import { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  title: string;
  description: string;
  movies: Movie[];
  emptyMessage: string;
  onSelectMovie: (movie: Movie) => void;
}

export function MovieGrid({ title, description, movies, emptyMessage, onSelectMovie }: MovieGridProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white">{title}</h2>
        <p className="mt-2 text-slate-400">{description}</p>
      </div>

      {movies.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-slate-300">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-300" />
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={() => onSelectMovie(movie)} />
          ))}
        </div>
      )}
    </section>
  );
}
