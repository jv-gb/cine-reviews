import { useEffect, useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  draftKey?: string;
  onSubmit: (review: { userName: string; rating: number; comment: string }) => void;
}

interface ReviewDraft {
  userName: string;
  rating: number;
  comment: string;
}

export function ReviewForm({ draftKey, onSubmit }: ReviewFormProps) {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!draftKey) return;

    const savedDraft = window.localStorage.getItem(draftKey);
    if (!savedDraft) return;

    try {
      const parsedDraft = JSON.parse(savedDraft) as ReviewDraft;
      setUserName(parsedDraft.userName ?? '');
      setRating(parsedDraft.rating ?? 0);
      setComment(parsedDraft.comment ?? '');
    } catch (error) {
      console.error('Não foi possível recuperar o rascunho da review:', error);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey) return;

    const draft: ReviewDraft = { userName, rating, comment };
    const hasContent = userName.trim() || comment.trim() || rating > 0;

    if (!hasContent) {
      window.localStorage.removeItem(draftKey);
      return;
    }

    window.localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [comment, draftKey, rating, userName]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userName.trim() || !comment.trim() || rating === 0) {
      setError('Preencha todos os campos e escolha uma nota antes de publicar.');
      return;
    }

    onSubmit({
      userName: userName.trim(),
      rating,
      comment: comment.trim(),
    });

    setUserName('');
    setRating(0);
    setComment('');
    setError('');

    if (draftKey) {
      window.localStorage.removeItem(draftKey);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-white">Deixe seu review</h3>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Rascunho automático</span>
      </div>

      <div>
        <label htmlFor="userName" className="mb-2 block text-white">
          Seu nome
        </label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          placeholder="Digite seu nome"
          className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-white">Sua avaliação</label>
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
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="mt-1 text-sm text-slate-400">
          {rating > 0 ? `Você deu ${rating} estrela${rating > 1 ? 's' : ''}.` : 'Selecione uma nota de 1 a 5.'}
        </p>
      </div>

      <div>
        <label htmlFor="comment" className="mb-2 block text-white">
          Seu review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Compartilhe sua opinião sobre o filme..."
          rows={4}
          className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-2 text-right text-xs text-slate-500">{comment.length} caracteres</p>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Publicar review
      </button>
    </form>
  );
}
