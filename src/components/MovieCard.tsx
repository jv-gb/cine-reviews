import { Movie } from '../data/mockData';
import { Star, Clock, PlayCircle } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <div
      className="bg-slate-900 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl border border-slate-800"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop';
          }}
        />
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{movie.averageRating.toFixed(1)}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <PlayCircle className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-semibold mb-1 line-clamp-1">{movie.title}</h3>
        <p className="text-slate-400 text-sm mb-3">{movie.year}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{movie.duration} min</span>
          </div>
          <span className="text-slate-400 text-sm">{movie.director}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {movie.genre.slice(0, 3).map((g) => (
            <span key={g} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full">
              {g}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span className="text-green-500">●</span>
          <span>Disponível em: {movie.streamingPlatforms.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}