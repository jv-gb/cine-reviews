import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Film, Star, Tv, User } from 'lucide-react';
import { Movie, Review } from '../types/movie';
import { ReviewForm } from './ReviewForm';

interface MovieDetailsProps {
  movie: Movie;
  isInWatchlist: boolean;
  onBack: () => void;
  onAddReview: (movieId: string, review: Review) => void;
  onToggleWatchlist: (movieId: string) => void;
}

export function MovieDetails({
  movie,
  isInWatchlist,
  onBack,
  onAddReview,
  onToggleWatchlist,
}: MovieDetailsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'reviews'>('summary');

  const handleSubmitReview = (review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: `r${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    onAddReview(movie.id, newReview);
    setShowReviewForm(false);
    setActiveTab('reviews');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="mx-auto max-w-6xl animate-fadeIn">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-300 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        Voltar para o catálogo
      </button>

      <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-4 shadow-2xl">
          <div className="relative aspect-[2/3] overflow-hidden rounded-[1.3rem] bg-slate-800">
            <img
              src={movie.poster}
              alt={movie.title}
              className="h-full w-full object-cover"
              onError={(event) => {
                (event.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop';
              }}
            />
          </div>
          <div className="mt-4 rounded-2xl bg-amber-400/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200/70">Nota média</p>
            <p className="mt-2 text-3xl font-black text-amber-300">{movie.averageRating.toFixed(1)}</p>
          </div>
          <button
            type="button"
            onClick={() => onToggleWatchlist(movie.id)}
            className={`mt-4 w-full rounded-2xl px-4 py-3 font-medium transition ${
              isInWatchlist
                ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                : 'border border-white/10 bg-slate-950/60 text-white hover:bg-white/10'
            }`}
          >
            {isInWatchlist ? 'Remover da minha lista' : 'Salvar na minha lista'}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-4xl font-black text-white md:text-5xl">{movie.title}</h1>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-sky-300" />
                    <span>{movie.year}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-sky-300" />
                    <span>{movie.duration} minutos</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-sky-300" />
                    <span>{movie.director}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                Base TMDB: <span className="font-semibold text-white">{movie.tmdbRating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {movie.genre.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-100"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Reviews</p>
              <p className="mt-3 text-3xl font-black text-white">{movie.userReviews.length}</p>
              <p className="mt-2 text-slate-400">Número de avaliações comunitárias registradas para este filme.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <div className="mb-3 flex items-center gap-3">
                <Tv className="h-5 w-5 text-green-400" />
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Onde assistir</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {movie.streamingPlatforms.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-2 text-sm text-green-100"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-6">
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-5 py-3 font-medium transition-colors ${
                  activeTab === 'summary' ? 'border-b-2 border-sky-400 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="mr-2 inline-block h-5 w-5" />
                Sinopse
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-5 py-3 font-medium transition-colors ${
                  activeTab === 'reviews' ? 'border-b-2 border-sky-400 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Star className="mr-2 inline-block h-5 w-5" />
                Reviews ({movie.userReviews.length})
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'summary' && (
                <div>
                  <h3 className="mb-4 text-2xl font-bold text-white">Sinopse oficial</h3>
                  <p className="text-lg leading-8 text-slate-300">{movie.officialSummary}</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Reviews da comunidade</h3>
                      <p className="mt-1 text-sm text-slate-400">As reviews ficam salvas localmente neste navegador.</p>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      {showReviewForm ? 'Cancelar' : 'Escrever review'}
                    </button>
                  </div>

                  {showReviewForm && (
                    <ReviewForm draftKey={`cine-reviews-draft-${movie.id}`} onSubmit={handleSubmitReview} />
                  )}

                  {movie.userReviews.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-8 text-center">
                      <Star className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                      <p className="text-lg text-slate-300">Seja a primeira pessoa a avaliar este filme.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {movie.userReviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 transition hover:border-white/20"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                                <User className="h-5 w-5 text-slate-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{review.userName}</p>
                                <p className="text-sm text-slate-400">{formatDate(review.date)}</p>
                              </div>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2">
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold text-white">{review.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="mt-4 leading-7 text-slate-300">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
