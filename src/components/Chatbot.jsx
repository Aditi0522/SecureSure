import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { io } from 'socket.io-client';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('https://real-stephana-nightswatch-d7e653b8.koyeb.app/', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      // Add initial message on connection error
      setMessages([{
        text: "I'm currently offline. Please try again later.",
        sender: 'bot'
      }]);
    });

    socketRef.current.on('set_user_id', (data) => {
      setUserId(data.user_id);
      socketRef.current.emit('join', { user_id: data.user_id });
      // Add welcome message
      setMessages([{
        text: "Hello! I'm your insurance claim assistant. How can I help you today?",
        sender: 'bot'
      }]);
    });

    socketRef.current.on('bot_response', (message) => {
      addMessage(message.data, 'bot');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && userId) {
      addMessage(inputMessage.trim(), 'user');
      socketRef.current.emit('user_message', {
        data: inputMessage.trim(),
        user_id: userId
      });
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle animation classes
  const chatbotClasses = `fixed bottom-4 right-4 z-50 ${
    isOpen ? 'animate-in slide-in-from-bottom-5' : ''
  }`;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-50 flex items-center gap-2"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-sm font-medium">Need Help?</span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className={chatbotClasses}>
          <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-medium">Insurance Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none h-10 min-h-[2.5rem] max-h-[2.5rem]"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;