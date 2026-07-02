import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Movie } from '../types/movie';
import { Send, Bot, User, Loader2, RefreshCw, X } from 'lucide-react';

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

export function ChatBot({ movies, isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Olá! 👋 Sou seu assistente de filmes.\n\nPosso te ajudar com:\n• Recomendações\n• Informações sobre filmes\n• Onde assistir\n• Avaliações\n\nComo posso ajudar?`,
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

  // Fechar o chat ao clicar fora (apenas em mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && window.innerWidth < 640 && 
          chatContainerRef.current && 
          !chatContainerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.match(/(oi|olá|ola|hello|bom dia|boa tarde)/)) {
      return `Olá! Que bom ter você aqui! 🎬\n\nTemos ${movies.length} filmes incríveis. O que gostaria de saber?`;
    }
    
    if (msg.includes('recomend') || msg.includes('sugest') || msg.includes('indic')) {
      const top3 = [...movies]
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3);
      
      let response = '🎬 **TOP 3 RECOMENDAÇÕES**:\n\n';
      top3.forEach((movie, i) => {
        response += `${i+1}. **${movie.title}** ⭐ ${movie.averageRating.toFixed(1)}\n`;
      });
      response += '\nQual te interessou mais?';
      return response;
    }
    
    const generos = ['ação', 'comédia', 'drama', 'ficção científica', 'terror', 'aventura'];
    const generoEncontrado = generos.find(g => msg.includes(g));
    
    if (generoEncontrado) {
      const filmesDoGenero = movies
        .filter(m => m.genre.some(g => g.toLowerCase().includes(generoEncontrado)))
        .slice(0, 3);
      
      if (filmesDoGenero.length > 0) {
        let response = `🎭 **Filmes de ${generoEncontrado}**:\n\n`;
        filmesDoGenero.forEach((movie, i) => {
          response += `${i+1}. **${movie.title}** (${movie.year}) ⭐ ${movie.averageRating.toFixed(1)}\n`;
        });
        return response;
      }
    }
    
    for (const movie of movies) {
      if (msg.includes(movie.title.toLowerCase())) {
        let response = `🎥 **${movie.title}** (${movie.year})\n\n`;
        response += `**Diretor**: ${movie.director}\n`;
        response += `**Gêneros**: ${movie.genre.join(', ')}\n`;
        response += `**Duração**: ${movie.duration}min\n`;
        response += `**Nota**: ⭐ ${movie.averageRating.toFixed(1)}\n`;
        response += `**Disponível em**: ${movie.streamingPlatforms.join(', ')}\n\n`;
        response += `Quer saber mais sobre onde assistir ou ver reviews?`;
        return response;
      }
    }
    
    if (msg.includes('onde assistir') || msg.includes('streaming')) {
      for (const movie of movies) {
        if (msg.includes(movie.title.toLowerCase())) {
          return `📺 **${movie.title}** está disponível em:\n${movie.streamingPlatforms.map(p => `• ${p}`).join('\n')}`;
        }
      }
      return 'De qual filme você quer saber onde assistir? Me diga o nome!';
    }
    
    if (msg.includes('nota') || msg.includes('avalia') || msg.includes('review')) {
      for (const movie of movies) {
        if (msg.includes(movie.title.toLowerCase())) {
          return `⭐ **${movie.title}**: ${movie.averageRating.toFixed(1)}/5\n(${movie.userReviews.length} reviews)`;
        }
      }
      
      const top3 = [...movies]
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3);
      
      let response = '🏆 **TOP 3 MELHORES NOTAS**:\n\n';
      top3.forEach((movie, i) => {
        response += `${i+1}. **${movie.title}** ⭐ ${movie.averageRating.toFixed(1)}\n`;
      });
      return response;
    }
    
    if (msg.includes('ajuda') || msg === '?') {
      return `🆘 **COMO USAR**:\n
• "Recomende um filme"
• "Filmes de comédia"
• "Onde assistir Interestelar?"
• "Nota do Parasita"
• "Fale sobre Clube da Luta"
• "Melhores filmes"`;
    }
    
    return `Hmm, não entendi. Tente perguntar sobre:\n
• Recomendações de filmes
• Informações de um filme específico
• Onde assistir algum filme
• Avaliações e notas
• Filmes por gênero`;
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

    setMessages(prev => [...prev, userMessageObj]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 800);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Conversa reiniciada! Como posso ajudar?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={chatContainerRef}
      className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-24 w-full sm:w-72 h-full sm:h-[500px] bg-slate-900 sm:rounded-xl border border-slate-700 shadow-2xl flex flex-col z-40"
      style={{ 
        maxWidth: '100vw',
        overflow: 'hidden',
      }}
    >
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base">CineBot</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Assistente de filmes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearChat}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
              title="Limpar conversa"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
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
            className={`flex gap-2 sm:gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${
              message.sender === 'user' ? 'bg-blue-600' : 'bg-slate-700'
            }`}>
              {message.sender === 'user' ? (
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              ) : (
                <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
              )}
            </div>
            
            <div className={`max-w-[calc(100%-60px)] sm:max-w-[85%] rounded-lg p-2.5 ${
              message.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-200'
            }`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              <div className="text-sm whitespace-pre-line leading-relaxed">{message.text}</div>
              <div className="text-xs opacity-60 mt-1">
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

      <div className="p-3 border-t border-slate-800 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta..."
            className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            style={{ maxWidth: 'calc(100% - 44px)' }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            style={{ width: '44px', flexShrink: 0 }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
