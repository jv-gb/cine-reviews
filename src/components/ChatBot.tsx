import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Bot, Loader2, RefreshCw, Send, User, X } from 'lucide-react';
import { Movie } from '../types/movie';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  movies: Movie[];
  isOpen: boolean;
  onClose: () => void;
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function ChatBot({ movies, isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text:
        'Olá! Sou o CineBot.\n\n' +
        'Posso te ajudar com:\n' +
        '• recomendações\n' +
        '• informações sobre filmes\n' +
        '• onde assistir\n' +
        '• notas e reviews\n\n' +
        'Experimente perguntar: "me recomende um filme" ou "onde assistir Duna?"',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        window.innerWidth < 640 &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getBotResponse = (userMessage: string): string => {
    const normalizedMessage = normalizeText(userMessage);

    if (/(oi|ola|hello|bom dia|boa tarde|boa noite)/.test(normalizedMessage)) {
      return `Olá! Temos ${movies.length} filmes visíveis agora. Quer uma recomendação, detalhes de um filme ou ajuda para descobrir onde assistir?`;
    }

    if (
      normalizedMessage.includes('recomend') ||
      normalizedMessage.includes('sugest') ||
      normalizedMessage.includes('indica')
    ) {
      const top3 = [...movies].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3);

      if (top3.length === 0) {
        return 'Ainda não consegui carregar filmes suficientes para recomendar. Tente novamente em instantes.';
      }

      let response = 'Minhas recomendações do momento:\n\n';
      top3.forEach((movie, index) => {
        response += `${index + 1}. ${movie.title} (${movie.year}) - nota ${movie.averageRating.toFixed(1)}\n`;
      });
      response += '\nSe quiser, também posso sugerir por gênero.';
      return response;
    }

    const genres = ['acao', 'comedia', 'drama', 'ficcao cientifica', 'terror', 'aventura', 'romance', 'animacao'];
    const foundGenre = genres.find((genre) => normalizedMessage.includes(genre));

    if (foundGenre) {
      const genreMovies = movies
        .filter((movie) =>
          movie.genre.some((genre) => normalizeText(genre).includes(foundGenre))
        )
        .slice(0, 3);

      if (genreMovies.length > 0) {
        return (
          `Filmes de ${foundGenre} que podem te interessar:\n\n` +
          genreMovies
            .map(
              (movie, index) =>
                `${index + 1}. ${movie.title} (${movie.year}) - nota ${movie.averageRating.toFixed(1)}`
            )
            .join('\n')
        );
      }
    }

    for (const movie of movies) {
      if (normalizedMessage.includes(normalizeText(movie.title))) {
        return (
          `${movie.title} (${movie.year})\n\n` +
          `Direção: ${movie.director}\n` +
          `Gêneros: ${movie.genre.join(', ')}\n` +
          `Duração: ${movie.duration} min\n` +
          `Nota média: ${movie.averageRating.toFixed(1)}\n` +
          `Onde assistir: ${movie.streamingPlatforms.join(', ')}\n\n` +
          'Se quiser, abra os detalhes do filme para ver sinopse e publicar uma review.'
        );
      }
    }

    if (normalizedMessage.includes('onde assistir') || normalizedMessage.includes('streaming')) {
      return 'Me diga o nome do filme e eu tento te mostrar onde ele está disponível.';
    }

    if (
      normalizedMessage.includes('nota') ||
      normalizedMessage.includes('avaliacao') ||
      normalizedMessage.includes('review')
    ) {
      const top3 = [...movies].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3);
      return (
        'Top notas da vitrine atual:\n\n' +
        top3
          .map((movie, index) => `${index + 1}. ${movie.title} - nota ${movie.averageRating.toFixed(1)}`)
          .join('\n')
      );
    }

    if (normalizedMessage.includes('ajuda') || normalizedMessage === '?') {
      return (
        'Você pode me pedir:\n\n' +
        '• "me recomende um filme"\n' +
        '• "filmes de ação"\n' +
        '• "onde assistir Oppenheimer?"\n' +
        '• "nota de Parasita"\n' +
        '• "fale sobre Clube da Luta"'
      );
    }

    return (
      'Não entendi muito bem. Tente uma destas opções:\n\n' +
      '• pedir uma recomendação\n' +
      '• buscar um gênero\n' +
      '• perguntar sobre um filme específico\n' +
      '• perguntar onde assistir'
    );
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMessageObj: Message = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userMessage),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 700);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Conversa reiniciada. Me peça recomendações, detalhes de um filme ou ajuda para encontrar algo.',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={chatContainerRef}
      className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-24 w-full sm:w-80 h-full sm:h-[540px] bg-slate-950 sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col z-40"
      style={{ maxWidth: '100vw', overflow: 'hidden' }}
    >
      <div className="p-4 border-b border-white/10 bg-slate-950/95 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/10">
              <Bot className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">CineBot</h3>
              <p className="text-slate-400 text-sm">Assistente de descoberta</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Limpar conversa"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Fechar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3" style={{ overflowX: 'hidden' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                message.sender === 'user' ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              {message.sender === 'user' ? (
                <User className="w-3.5 h-3.5 text-white" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-sky-300" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3 ${
                message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-200'
              }`}
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              <div className="text-sm whitespace-pre-line leading-relaxed">{message.text}</div>
              <div className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/10 flex-shrink-0 bg-slate-950">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
