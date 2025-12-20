import { Movie } from '../data/mockData';
import { Star, Clock, PlayCircle, Calendar } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <div
      className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-700 hover:border-blue-500"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop';
          }}
        />
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{movie.averageRating.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
          <span className="text-white text-xs font-medium">{movie.year}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <PlayCircle className="w-12 h-12 text-white mb-2 mx-auto" />
            <p className="text-white text-sm font-medium text-center">Ver detalhes</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-lg line-clamp-1">{movie.title}</h3>
          <span className="text-slate-400 text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {movie.year}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{movie.duration} min</span>
          </div>
          <span className="text-slate-400 text-sm truncate max-w-[120px]" title={movie.director}>
            {movie.director}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genre.slice(0, 2).map((g) => (
            <span key={g} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
              {g}
            </span>
          ))}
          {movie.genre.length > 2 && (
            <span className="px-2.5 py-1 bg-slate-900 text-slate-400 text-xs rounded-full">
              +{movie.genre.length - 2}
            </span>
          )}
        </div>
        
        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-slate-400 text-sm">
                {movie.streamingPlatforms.length > 0 
                  ? movie.streamingPlatforms[0]
                  : 'Não disponível'
                }
              </span>
            </div>
            {movie.streamingPlatforms.length > 1 && (
              <span className="text-slate-500 text-xs">
                +{movie.streamingPlatforms.length - 1}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}