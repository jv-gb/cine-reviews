export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  duration: number;
  genre: string[];
  director: string;
  officialSummary: string;
  poster: string;
  tmdbRating: number;
  averageRating: number;
  userReviews: Review[];
  streamingPlatforms: string[];
}
