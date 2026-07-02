import { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';

interface MovieShelfProps {
  title: string;
  description: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export function MovieShelf({ title, description, movies, onSelectMovie }: MovieShelfProps) {
  if (movies.length === 0) return null;

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="mt-1 text-slate-400">{description}</p>
      </div>

      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex gap-4 px-1">
          {movies.map((movie) => (
            <div key={movie.id} className="min-w-[260px] max-w-[260px] flex-shrink-0">
              <MovieCard movie={movie} onClick={() => onSelectMovie(movie)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
