import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  id: number;
  text: string;
  type: 'user' | 'system';
  status?: 'success' | 'error';
  timestamp: Date;
}

interface CommandResponse {
  success: boolean;
  action?: string;
  message?: string;
  error?: string;
}

const CommandProcess: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const response = await axios.post<CommandResponse>('http://localhost:5000/api/command', {
        command: inputValue
      });

      const systemMessage: Message = {
        id: Date.now() + 1,
        text: response.data.message || response.data.error || 'Command processed successfully',
        type: 'system',
        status: response.data.success ? 'success' : 'error',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Failed to process command. Please try again.',
        type: 'system',
        status: 'error',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4 sm:px-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white shadow-lg sm:rounded-3xl px-4 py-10 sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Lightroom Command Center</h2>
                
                {/* Messages Container */}
                <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`mb-4 ${
                        message.type === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : message.status === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your command..."
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isProcessing}
                    />
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`px-4 py-2 bg-blue-500 text-white rounded-r-lg transition duration-300 ease-in-out ${
                        isProcessing
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-blue-600'
                      }`}
                    >
                      {isProcessing ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
                    </button>
                  </div>
                </form>

                {/* Help Text */}
                <div className="mt-4 text-sm text-gray-500">
                  <p>Try commands like:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>"adjust exposure to 1.5"</li>
                    <li>"apply preset warm sunset"</li>
                    <li>"export photo"</li>
                    <li>Type "help" for more commands</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandProcess;