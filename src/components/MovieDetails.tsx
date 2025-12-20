import { useState } from 'react';
import { Movie, Review } from '../data/mockData';
import { ArrowLeft, Star, Clock, Film, Tv, Calendar, User } from 'lucide-react';
import { ReviewForm } from './ReviewForm';

interface MovieDetailsProps {
  movie: Movie;
  onBack: () => void;
  onAddReview: (movieId: string, review: Review) => void;
}

export function MovieDetails({ movie, onBack, onAddReview }: MovieDetailsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const handleSubmitReview = (review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: `r${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    onAddReview(movie.id, newReview);
    setShowReviewForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <button
        onClick={onBack}
        className="mb-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar para a lista
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-800 shadow-2xl">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop';
              }}
            />
            <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-white font-bold">{movie.averageRating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{movie.year}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{movie.duration} minutos</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{movie.director}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genre.map((g) => (
                <span key={g} className="px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-800">
                  {g}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{movie.averageRating.toFixed(1)}</div>
                <div className="text-slate-400 text-sm">Nota média</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{movie.userReviews.length}</div>
                <div className="text-slate-400 text-sm">Reviews</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <Tv className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold text-white">Onde Assistir</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {movie.streamingPlatforms.map((platform) => (
                <span key={platform} className="px-4 py-2 bg-green-900/20 text-green-300 rounded-lg border border-green-800">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'summary' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
          >
            <Film className="w-5 h-5 inline-block mr-2" />
            Sinopse
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'reviews' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
          >
            <Star className="w-5 h-5 inline-block mr-2" />
            Reviews ({movie.userReviews.length})
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'summary' && (
            <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
              <h3 className="text-2xl font-semibold text-white mb-4">Sinopse</h3>
              <p className="text-slate-300 leading-relaxed text-lg">{movie.officialSummary}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-white">Reviews da Comunidade</h3>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  {showReviewForm ? 'Cancelar' : 'Escrever Review'}
                </button>
              </div>

              {showReviewForm && (
                <div className="mb-8">
                  <ReviewForm onSubmit={handleSubmitReview} />
                </div>
              )}

              {movie.userReviews.length === 0 ? (
                <div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-800">
                  <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    Seja o primeiro a escrever um review para este filme!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {movie.userReviews.map((review) => (
                    <div key={review.id} className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{review.userName}</p>
                              <p className="text-slate-400 text-sm">{formatDate(review.date)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-white font-bold">{review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-slate-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}