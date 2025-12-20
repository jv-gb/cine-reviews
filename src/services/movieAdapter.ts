// src/services/movieAdapter.ts
import { Movie, Review } from '../data/mockData';
import { TMDBMovie, TMDBMovieDetails } from './tmdb';

export class MovieAdapter {
  static fromTMDBToMovie(
    tmdbMovie: TMDBMovie | TMDBMovieDetails,
    streamingPlatforms: string[] = []
  ): Movie {
    const director = 'tmdbMovie' in tmdbMovie && tmdbMovie.credits 
      ? tmdbMovie.credits.crew.find(person => person.job === 'Director')?.name || 'Desconhecido'
      : 'Desconhecido';

    const duration = 'runtime' in tmdbMovie 
      ? tmdbMovie.runtime 
      : 120; // Valor padrão

    const genres = 'genres' in tmdbMovie && tmdbMovie.genres
      ? tmdbMovie.genres.map(g => g.name)
      : ['Desconhecido'];

    return {
      id: tmdbMovie.id.toString(),
      title: tmdbMovie.title,
      year: new Date(tmdbMovie.release_date).getFullYear() || 2024,
      duration,
      genre: genres,
      director,
      officialSummary: tmdbMovie.overview || 'Sinopse não disponível.',
      poster: tmdbMovie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
        : 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop',
      averageRating: tmdbMovie.vote_average / 2, // TMDB usa 0-10, convertemos para 0-5
      userReviews: [], // Reviews serão adicionados localmente
      streamingPlatforms: streamingPlatforms.length > 0 
        ? streamingPlatforms 
        : ['Disponível para alugar/compra'],
    };
  }
}