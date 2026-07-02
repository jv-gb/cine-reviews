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
        .filter((movie) => movie.genre.some((genre) => normalizeText(genre).includes(foundGenre)))
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
      className="fixed inset-0 z-40 flex h-full w-full max-w-full flex-col overflow-hidden border border-white/10 bg-slate-950 shadow-2xl sm:inset-auto sm:bottom-6 sm:right-24 sm:h-[540px] sm:w-80 sm:rounded-3xl"
    >
      <div className="flex-shrink-0 border-b border-white/10 bg-slate-950/95 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/10">
              <Bot className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">CineBot</h3>
              <p className="text-sm text-slate-400">Assistente de descoberta</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearChat}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              title="Limpar conversa"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              title="Fechar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                message.sender === 'user' ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              {message.sender === 'user' ? (
                <User className="h-3.5 w-3.5 text-white" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-sky-300" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3 ${
                message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-200'
              }`}
              style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
            >
              <div className="whitespace-pre-line text-sm leading-relaxed">{message.text}</div>
              <div className="mt-2 text-xs opacity-60">
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

      <div className="flex-shrink-0 border-t border-white/10 bg-slate-950 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:border-transparent focus:outline-none focus:ring-1 focus:ring-sky-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
