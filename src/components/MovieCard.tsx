import { Calendar, Clock, PlayCircle, Star } from 'lucide-react';
import { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <button
      type="button"
      className="group w-full overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-900/70 text-left transition duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:shadow-2xl hover:shadow-sky-950/30"
      onClick={onClick}
      aria-label={`Ver detalhes de ${movie.title}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(event) => {
            (event.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop';
          }}
        />

        <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between">
          <div className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {movie.year}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {movie.averageRating.toFixed(1)}
          </div>
        </div>

        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="mb-6 text-center text-white">
            <PlayCircle className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm font-medium">Abrir detalhes</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white line-clamp-2">{movie.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">{movie.officialSummary}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {movie.year}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {movie.duration} min
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {movie.genre.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-white/10 bg-slate-800/70 px-3 py-1 text-xs text-slate-200"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Direção</p>
            <p className="mt-1 text-sm text-slate-200 truncate max-w-[160px]" title={movie.director}>
              {movie.director}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Streaming</p>
            <p className="mt-1 text-sm text-slate-200">
              {movie.streamingPlatforms.length > 0 ? movie.streamingPlatforms[0] : 'Não disponível'}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
