import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MenaConnectProps {
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MenaConnect: React.FC<MenaConnectProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Bonjour ${profile?.first_name || ''} ! Je suis MENACONNECT, votre assistant intelligent Menarini. Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response - Replace with actual AI integration later
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Je suis en cours de développement. Bientôt, je pourrai vous aider avec vos questions sur les visites, les produits, et bien plus encore !",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-red-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-red-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-700">MENACONNECT</h1>
                <p className="text-sm text-red-600 italic font-semibold">
                  Connecter. Vendre. Performer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card className="h-[calc(100vh-200px)] flex flex-col bg-white/80 backdrop-blur-sm border-2 border-red-100 shadow-lg">
          <CardHeader className="border-b border-red-100 bg-gradient-to-r from-red-50 to-white">
            <CardTitle className="text-lg text-gray-700">
              Assistant Intelligent Menarini
            </CardTitle>
          </CardHeader>
          
          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-red-50 text-gray-800 border border-red-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-red-100 p-4 bg-gradient-to-r from-white to-red-50">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 border-red-200 focus:border-red-400 focus:ring-red-400"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MenaConnect;
