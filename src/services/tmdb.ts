/// <reference types="vite/client" />
import axios from 'axios';

const TMDB_API_KEY = (import.meta.env.VITE_TMDB_API_KEY as string | undefined) ?? 'sua_chave_api_aqui';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

if (!TMDB_API_KEY || TMDB_API_KEY === 'sua_chave_api_aqui') {
  console.error(
    '❌ ERRO: Chave da API do TMDB não configurada!\n' +
    'Por favor, crie um arquivo .env na raiz do projeto com:\n' +
    'VITE_TMDB_API_KEY=sua_chave_aqui\n\n' +
    'Obtenha uma chave em: https://www.themoviedb.org/settings/api'
  );
}

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
  },
});

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: TMDBGenre[];
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
    }>;
  };
  production_companies: Array<{
    id: number;
    name: string;
  }>;
}

export interface TMDBWatchProvider {
  BR?: {
    flatrate?: Array<{
      provider_name: string;
      logo_path: string;
    }>;
    rent?: Array<{
      provider_name: string;
      logo_path: string;
    }>;
    buy?: Array<{
      provider_name: string;
      logo_path: string;
    }>;
  };
}

class TMDBService {
  async getPopularMovies(): Promise<TMDBMovie[]> {
    try {
      const response = await tmdbApi.get('/movie/popular');
      return response.data.results.slice(0, 12);
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error);
      return [];
    }
  }

  async getMoviesByGenre(genreId: number): Promise<TMDBMovie[]> {
    try {
      const response = await tmdbApi.get('/discover/movie', {
        params: {
          with_genres: genreId,
          sort_by: 'popularity.desc',
        },
      });
      return response.data.results.slice(0, 6);
    } catch (error) {
      console.error('Erro ao buscar filmes por gênero:', error);
      return [];
    }
  }

  async getMovieById(id: number): Promise<TMDBMovieDetails | null> {
    try {
      const response = await tmdbApi.get(`/movie/${id}`, {
        params: {
          append_to_response: 'credits',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filme por ID:', error);
      return null;
    }
  }

  async getWatchProviders(movieId: number): Promise<string[]> {
    try {
      const response = await tmdbApi.get<TMDBWatchProvider>(
        `/movie/${movieId}/watch/providers`
      );
      
      const providers = response.data.BR;
      const streamingServices: string[] = [];
      
      if (providers?.flatrate) {
        streamingServices.push(
          ...providers.flatrate.map(p => p.provider_name)
        );
      }
      if (providers?.rent) {
        streamingServices.push(
          ...providers.rent.map(p => p.provider_name)
        );
      }
      if (providers?.buy) {
        streamingServices.push(
          ...providers.buy.map(p => p.provider_name)
        );
      }
      
      return [...new Set(streamingServices)];
    } catch (error) {
      console.error('Erro ao buscar provedores:', error);
      return [];
    }
  }

  async searchMovies(query: string): Promise<TMDBMovie[]> {
    try {
      const response = await tmdbApi.get('/search/movie', {
        params: {
          query,
        },
      });
      return response.data.results;
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      return [];
    }
  }

  async getGenres(): Promise<TMDBGenre[]> {
    try {
      const response = await tmdbApi.get('/genre/movie/list');
      return response.data.genres;
    } catch (error) {
      console.error('Erro ao buscar gêneros:', error);
      return [];
    }
  }

  async getTrendingMovies(): Promise<TMDBMovie[]> {
    try {
      const response = await tmdbApi.get('/trending/movie/week');
      return response.data.results.slice(0, 8);
    } catch (error) {
      console.error('Erro ao buscar filmes em alta:', error);
      return [];
    }
  }
}

export const tmdbService = new TMDBService();