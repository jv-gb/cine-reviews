import { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (review: { userName: string; rating: number; comment: string }) => void;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName && rating > 0 && comment) {
      onSubmit({ userName, rating, comment });
      setUserName('');
      setRating(0);
      setComment('');
      alert('Review enviado com sucesso!');
    } else {
      alert('Por favor, preencha todos os campos e dê uma nota.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-6 rounded-lg border border-slate-800">
      <h3 className="text-xl font-semibold text-white">Deixe seu Review</h3>
      
      <div>
        <label htmlFor="userName" className="block text-white mb-2">Seu Nome</label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Digite seu nome"
          required
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-white mb-2">Sua Avaliação</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-slate-400 text-sm mt-1">{rating > 0 ? `Você deu ${rating} estrela${rating > 1 ? 's' : ''}` : 'Selecione uma nota'}</p>
      </div>

      <div>
        <label htmlFor="comment" className="block text-white mb-2">Seu Review</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Compartilhe sua opinião sobre o filme..."
          required
          rows={4}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        Publicar Review
      </button>
    </form>
  );
}