import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface ProcessStatus {
  is_connected: boolean;
  last_command: string | null;
  last_command_time: string | null;
  processing_status: string | null;
  error_message: string | null;
}

const CommandProcess: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [status, setStatus] = useState<ProcessStatus>({
    is_connected: false,
    last_command: null,
    last_command_time: null,
    processing_status: null,
    error_message: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [messages]);

  const fetchStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/status');
      setStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const response = await axios.post('http://localhost:5000/api/command', {
        command: inputMessage
      });

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: response.data.message,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, there was an error processing your command.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Status Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${status.is_connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {status.is_connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={fetchStatus}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {status.last_command && (
          <div className="mt-2 text-sm text-gray-600">
            Last command: {status.last_command}
            <span className="ml-2 text-gray-400">
              ({new Date(status.last_command_time!).toLocaleTimeString()})
            </span>
          </div>
        )}
        {status.processing_status && (
          <div className="mt-1 text-sm text-gray-600">
            Status: {status.processing_status}
          </div>
        )}
        {status.error_message && (
          <div className="mt-1 text-sm text-red-600">
            Error: {status.error_message}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white shadow rounded-lg p-4 mb-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your command here..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isProcessing ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommandProcess;