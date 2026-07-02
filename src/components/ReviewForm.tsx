import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (review: { userName: string; rating: number; comment: string }) => void;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userName || !comment || rating === 0) {
      setError('Preencha todos os campos e escolha uma nota antes de publicar.');
      return;
    }

    onSubmit({ userName, rating, comment });
    setUserName('');
    setRating(0);
    setComment('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-6 rounded-3xl border border-slate-800">
      <h3 className="text-xl font-semibold text-white">Deixe seu review</h3>

      <div>
        <label htmlFor="userName" className="block text-white mb-2">
          Seu nome
        </label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          placeholder="Digite seu nome"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-white mb-2">Sua avaliação</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setRating(star);
                setError('');
              }}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
              aria-label={`Dar nota ${star}`}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-slate-400 text-sm mt-1">
          {rating > 0 ? `Você deu ${rating} estrela${rating > 1 ? 's' : ''}.` : 'Selecione uma nota de 1 a 5.'}
        </p>
      </div>

      <div>
        <label htmlFor="comment" className="block text-white mb-2">
          Seu review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Compartilhe sua opinião sobre o filme..."
          rows={4}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-2xl transition-colors"
      >
        Publicar review
      </button>
    </form>
  );
}
