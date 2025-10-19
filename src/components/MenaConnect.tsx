import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Bot, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import menaconnectLogo from '@/assets/menaconnect-logo.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface MenaConnectProps {
  onBack: () => void;
}

const MenaConnect: React.FC<MenaConnectProps> = ({ onBack }) => {
  const { t } = useTranslation(['menaconnect', 'common']);
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `${t('common:welcome')} ${profile?.first_name}! Je suis votre assistant MENACONNECT. Comment puis-je vous aider aujourd'hui?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('kpi') || lowerInput.includes('performance')) {
      return "Je peux vous aider avec vos KPIs! Consultez votre tableau de bord pour voir vos indicateurs de performance, l'indice de retour et le taux de recrutement.";
    }
    if (lowerInput.includes('visit') || lowerInput.includes('visite')) {
      return "Pour gérer vos visites, accédez à la section 'Indice de Retour' de votre tableau de bord. Vous pouvez y planifier et suivre toutes vos visites.";
    }
    if (lowerInput.includes('plan') || lowerInput.includes('action')) {
      return "Les plans d'action sont accessibles via la carte dédiée sur votre tableau de bord. Vous pouvez créer, consulter et gérer tous vos plans d'action.";
    }
    if (lowerInput.includes('help') || lowerInput.includes('aide')) {
      return "Je suis là pour vous aider! Vous pouvez me poser des questions sur vos KPIs, visites, plans d'action, ou toute autre fonctionnalité de la plateforme.";
    }
    
    return "Merci pour votre message. Comment puis-je vous assister avec vos activités de vente et vos performances?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white hover:bg-red-500/50"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t('common:back')}
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src={menaconnectLogo} 
                  alt="MENACONNECT" 
                  className="h-12 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">{t('menaconnect:title')}</h1>
                  <p className="text-sm text-red-100">{t('menaconnect:slogan')}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm">{t('menaconnect:online')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card className="bg-white shadow-2xl border-0 h-[calc(100vh-200px)]">
          <CardHeader className="border-b bg-gradient-to-r from-red-50 to-gray-50">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-red-600" />
              <span>{t('menaconnect:description')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-full">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        message.sender === 'user'
                          ? 'bg-red-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <UserIcon className="h-5 w-5 text-white" />
                      ) : (
                        <Bot className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div
                      className={`flex-1 p-4 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-red-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-red-500 to-red-600">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 p-4 rounded-lg bg-gray-100">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('menaconnect:chatPlaceholder')}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenaConnect;
