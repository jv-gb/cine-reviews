import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Film, Star, Tv, User } from 'lucide-react';
import { Movie, Review } from '../types/movie';
import { ReviewForm } from './ReviewForm';

interface MovieDetailsProps {
  movie: Movie;
  onBack: () => void;
  onAddReview: (movieId: string, review: Review) => void;
}

export function MovieDetails({ movie, onBack, onAddReview }: MovieDetailsProps) {
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
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <button
        onClick={onBack}
        className="mb-6 text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar para o catálogo
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr] mb-10">
        <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-4 shadow-2xl">
          <div className="relative aspect-[2/3] overflow-hidden rounded-[1.3rem] bg-slate-800">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
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
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white">{movie.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-300" />
                <span>{movie.year}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-300" />
                <span>{movie.duration} minutos</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-sky-300" />
                <span>{movie.director}</span>
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
              <p className="mt-2 text-slate-400">Número de avaliações comunitárias associadas a este filme.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Tv className="w-5 h-5 text-green-400" />
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
                  activeTab === 'summary' ? 'text-white border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-5 h-5 inline-block mr-2" />
                Sinopse
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-5 py-3 font-medium transition-colors ${
                  activeTab === 'reviews' ? 'text-white border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-5 h-5 inline-block mr-2" />
                Reviews ({movie.userReviews.length})
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'summary' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Sinopse oficial</h3>
                  <p className="text-slate-300 leading-8 text-lg">{movie.officialSummary}</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                    <h3 className="text-2xl font-bold text-white">Reviews da comunidade</h3>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-2xl transition-colors"
                    >
                      {showReviewForm ? 'Cancelar' : 'Escrever review'}
                    </button>
                  </div>

                  {showReviewForm && <ReviewForm onSubmit={handleSubmitReview} />}

                  {movie.userReviews.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-8 text-center">
                      <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-300 text-lg">Seja a primeira pessoa a avaliar este filme.</p>
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
                              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{review.userName}</p>
                                <p className="text-slate-400 text-sm">{formatDate(review.date)}</p>
                              </div>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              <span className="text-white font-bold">{review.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="mt-4 text-slate-300 leading-7">{review.comment}</p>
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
