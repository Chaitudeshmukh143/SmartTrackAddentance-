import React, { useState, useRef, useEffect } from 'react';
import { Classroom, Message } from '../types';
import { Send, Users } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { socketClient } from '../services/socket';

interface ChatTabProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
  initialRecipientId?: string | null;
}

const ChatTab: React.FC<ChatTabProps> = ({ classroom, onUpdate, initialRecipientId }) => {

  const [inputText, setInputText] = useState('');
  const [isAiAnswering, setIsAiAnswering] = useState(false);
  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(initialRecipientId || null);
  const [isConnected, setIsConnected] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [classroom.messages, isAiAnswering]);

  // WebSocket connect
  useEffect(() => {

    socketClient.onConnect = () => {
      console.log("WebSocket Connected");
      setIsConnected(true);

      socketClient.subscribe("/topic/messages", (message) => {
        const receivedMessage: Message = JSON.parse(message.body);

        if ((receivedMessage as any).classroomId === classroom.id) {
          onUpdate({
            ...classroom,
            messages: [...(classroom.messages || []), receivedMessage]
          });
        }
      });
    };

    socketClient.onStompError = (frame) => {
      console.error("Broker error:", frame.headers["message"]);
    };

    socketClient.activate();

    return () => {
      socketClient.deactivate();
      setIsConnected(false);
    };

  }, [classroom]);

  // Filter messages
  const filteredMessages = (classroom.messages || []).filter(msg => {
    if (activeRecipientId === null) return !msg.recipientId;

    return (
      (msg.senderId === 'teacher-1' && msg.recipientId === activeRecipientId) ||
      (msg.senderId === activeRecipientId && msg.recipientId === 'teacher-1')
    );
  });

  // Send message
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (!isConnected) {
      alert("Chat is still connecting. Please wait a moment.");
      return;
    }

    const newMessage: any = {
      id: `msg-${Date.now()}`,
      classroomId: classroom.id,
      senderId: 'teacher-1',
      senderName: 'Prof. Anderson',
      recipientId: activeRecipientId || null,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'teacher'
    };

    socketClient.publish({
      destination: "/app/send",
      body: JSON.stringify(newMessage)
    });

    setInputText('');

    // AI reply
    if (activeRecipientId === null && text.toLowerCase().includes('@ai')) {
      setIsAiAnswering(true);

      const aiReply = await getGeminiResponse(
        `Student asked: ${text}. Provide helpful educational answer.`
      );

      const aiMessage: any = {
        id: `msg-ai-${Date.now()}`,
        classroomId: classroom.id,
        senderId: 'ai',
        senderName: 'Study Buddy (AI)',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: 'teacher'
      };

      socketClient.publish({
        destination: "/app/send",
        body: JSON.stringify(aiMessage)
      });

      setIsAiAnswering(false);
    }
  };

  return (
    <div className="flex h-[600px] bg-white overflow-hidden font-sans">

      {/* Sidebar */}
      <div className="w-72 border-r border-gray-100 flex flex-col bg-gray-50/50">

        <button
          onClick={() => setActiveRecipientId(null)}
          className={`w-full p-6 flex items-center gap-4 transition-all ${activeRecipientId === null ? 'bg-white' : ''}`}
        >
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
            <Users size={20} />
          </div>
          <div className="text-left font-black text-sm">Class Group</div>
        </button>

        {(classroom.students || []).map(student => (
          <button
            key={student.id}
            onClick={() => setActiveRecipientId(student.id)}
            className={`w-full p-6 flex items-center gap-4 transition-all ${activeRecipientId === student.id ? 'bg-white' : ''}`}
          >
            <img
              src={student.avatar}
              className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm"
              alt=""
            />
            <div className="text-left font-black text-sm truncate">{student.name}</div>
          </button>
        ))}

      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white">

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">

          {filteredMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === 'teacher-1' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-5 py-3.5 rounded-3xl shadow-sm text-sm font-medium ${
                  msg.senderId === 'teacher-1'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isAiAnswering && (
            <div className="text-indigo-600 font-black text-xs animate-pulse">
              AI is thinking...
            </div>
          )}

        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t border-gray-100">

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputText);
            }}
            className="flex items-center gap-4 bg-gray-50 p-2 rounded-[2rem] border border-gray-200"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Message..."
              className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-sm font-bold"
            />

            <button
              disabled={!isConnected}
              type="submit"
              className="bg-indigo-600 text-white p-3.5 rounded-full shadow-lg disabled:opacity-50"
            >
              <Send size={20} />
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

export default ChatTab;
