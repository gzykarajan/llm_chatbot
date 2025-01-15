import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatApp = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 格式化时间
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  // 自动调整文本框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 重置文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 模拟机器人回复
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const botMessage: Message = {
        id: Date.now() + 1,
        content: `这是对 "${userMessage.content}" 的回复。这是一个模拟的回复消息，可以根据实际需求修改回复的内容和逻辑。`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 清空聊天
  const handleClear = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 标题栏 */}
      <header className="flex items-center justify-center py-6 bg-white shadow-sm">
        <div className="flex items-end">
          <img
            src="/avatars/bot-avatar.png"
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <h1 className="ml-6 text-3xl font-semibold text-gray-800">
            暗夜精"凌"
          </h1>
        </div>
      </header>

      {/* 聊天内容区域 */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end ${
                message.isUser ? 'justify-end' : 'justify-start'
              } animate-fade-in`}
            >
              {/* 用户消息 */}
              {message.isUser ? (
                <div className="flex items-end">
                  <div className="flex flex-col items-end mr-2">
                    <div className="bg-blue-500 text-white p-3 rounded-lg rounded-br-none max-w-lg">
                      {message.content}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <img
                    src="/avatars/user-avatar.png"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
              ) : (
                /* 机器人消息 */
                <div className="flex items-end">
                  <img
                    src="/avatars/bot-avatar.png"
                    alt="Bot Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col ml-2">
                    <div className="bg-white text-gray-800 p-3 rounded-lg rounded-bl-none max-w-lg">
                      {message.content}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 输入区域 */}
      <footer className="bg-white p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="输入消息... (Ctrl + Enter 发送)"
            rows={1}
            style={{ minHeight: '40px' }}
          />
          <div className="flex flex-col ml-2 space-y-2">
            <button
              onClick={handleSend}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoading ? '发送中...' : '发送'}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              清空
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatApp;