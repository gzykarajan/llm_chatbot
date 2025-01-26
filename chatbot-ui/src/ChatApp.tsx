import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import './markdown.css';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentBufferRef = useRef<string>('');

  // 初始化欢迎消息
  useEffect(() => {
    const welcomeMessage: Message = {
      id: Date.now(),
      content: "你好呀，心凌来回答你的问题哦❤️\n",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []); 

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

  // 将消息转换为API所需的格式
  const convertMessagesToApiFormat = (messages: Message[]) => {
    return messages
      .filter(msg => msg.content.trim() !== '') // 过滤掉空消息
      .map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));
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
  
    // 重置内容缓冲区
    contentBufferRef.current = '';
  
    // 重置文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  
    try {
      // 创建一个临时的机器人消息用于流式更新
      const botMessage: Message = {
        id: Date.now() + 1,
        content: '',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);

      // 获取历史消息并转换格式（不包括欢迎消息和空消息）
      const chatHistory = convertMessagesToApiFormat(
        messages.filter(msg => msg.content.trim() !== '' && !msg.content.includes('你好呀，心凌来回答你的问题哦'))
      );
      // 添加当前用户消息
      chatHistory.push({ role: 'user', content: userMessage.content });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('Response body is null');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6).trim();
            if (content && content !== '') {
              try {
                // 检查是否是错误消息
                if (content.startsWith('Error:')) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    lastMessage.content = content;
                    return newMessages;
                  });
                  break;
                }

                // 检查是否是结束标记
                if (content === '[DONE]') {
                  console.log('Stream completed');
                  break;
                }

                  // 将新内容添加到缓冲区
                contentBufferRef.current += content;

                  // 更新最后一条消息的内容
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    lastMessage.content = contentBufferRef.current;
                    return newMessages;
                  });
              } catch (e) {
                console.error('Error handling content:', e);
              }
            }
          }
        }
      }
  
    } catch (error) {
      console.error('Error:', error);
      // 添加错误提示
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: "抱歉，发生了错误，请稍后重试。",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
  const handleClear = async () => {
    try {
      // 调用后端初始化接口
      const response = await fetch('/api/chat/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 显示欢迎消息
      const welcomeMessage: Message = {
        id: Date.now(),
        content: "你好呀，心凌来回答你的问题哦❤️\n",
        isUser: false,
        timestamp: new Date(),
      };
      
      // 重置状态
      setMessages([welcomeMessage]);
      setInputValue('');
      setIsLoading(false);
      contentBufferRef.current = '';

    } catch (error) {
      console.error('Error clearing chat:', error);
      // 可以选择添加一个错误提示
      const errorMessage: Message = {
        id: Date.now(),
        content: "清空聊天记录时发生错误，请稍后重试。",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
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
                    <div className="bg-white text-gray-800 p-3 rounded-lg rounded-bl-none max-w-lg whitespace-pre-wrap markdown-body">
                      {/* 先显示原始文本，保留 ~ 符号 */}
                      {message.content.split(/(\~|\*\*|\*|\`|__|\[.*?\]\(.*?\))/).map((part, index) => {
                        // 如果是 ~ 符号，直接显示
                        if (part === '~') {
                          return <span key={index}>{part}</span>;
                        }
                        // 其他部分使用 Markdown 渲染
                        return (
                          <ReactMarkdown
                            key={index}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            components={{
                              p: ({children}: {children: React.ReactNode}) => <span>{children}</span>,
                              del: ({children}: {children: React.ReactNode}) => <span>{children}</span>,
                              code: ({ inline, className, children, ...props }: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                return (
                                  <code
                                    className={`${className || ''} ${
                                      inline ? 'bg-gray-100 px-1 rounded' : 'block bg-gray-100 p-2 rounded'
                                    }`}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              a: ({ children, href, ...props }: any) => (
                                <a
                                  className="text-blue-500 hover:underline"
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {part}
                          </ReactMarkdown>
                        );
                      })}
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
            disabled={isLoading}
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