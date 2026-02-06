
import React, { useState, useRef, useEffect } from 'react';
import { Classroom, Message, Student } from '../types';
import { Send, User, Sparkles, MessageCircle, Users, Check, CheckCheck, Loader2 } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';

interface ChatTabProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
  initialRecipientId?: string | null;
}

const ChatTab: React.FC<ChatTabProps> = ({ classroom, onUpdate, initialRecipientId }) => {
  const [inputText, setInputText] = useState('');
  const [isAiAnswering, setIsAiAnswering] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(initialRecipientId || null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRecipientId) {
      setActiveRecipientId(initialRecipientId);
    }
  }, [initialRecipientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [classroom.messages, activeRecipientId, isAiAnswering, isOtherTyping]);

  const filteredMessages = classroom.messages.filter(msg => {
    if (activeRecipientId === null) {
      return !msg.recipientId; // Class chat
    } else {
      // Private chat between teacher and activeRecipientId
      return (
        (msg.senderId === 'teacher-1' && msg.recipientId === activeRecipientId) ||
        (msg.senderId === activeRecipientId && msg.recipientId === 'teacher-1')
      );
    }
  });

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'teacher-1',
      senderName: 'Prof. Anderson',
      recipientId: activeRecipientId || undefined,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'teacher',
      status: 'read'
    };

    // Store the updated classroom locally to ensure subsequent updates in the same function
    // have the latest message, even if the prop hasn't refreshed yet due to React's async nature.
    const updatedClassroom = { ...classroom, messages: [...classroom.messages, newMessage] };
    onUpdate(updatedClassroom);
    setInputText('');

    // Simulated reply or AI trigger
    if (activeRecipientId === null && text.toLowerCase().includes('@ai')) {
      setIsAiAnswering(true);
      const aiReply = await getGeminiResponse(`A student asked: ${text.replace('@ai', '')}. Provide a helpful, concise educational answer.`);
      
      const aiMessage: Message = {
        id: `msg-ai-${Date.now()}`,
        senderId: 'ai',
        senderName: 'Study Buddy (AI)',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: 'teacher'
      };
      
      // Fix: onUpdate is a prop function, not a state setter. Pass the full classroom object.
      // Use updatedClassroom to include the user's message we just sent.
      onUpdate({ ...updatedClassroom, messages: [...updatedClassroom.messages, aiMessage] });
      setIsAiAnswering(false);
    } else if (activeRecipientId !== null) {
      // Simulate student typing after receiving a DM
      setTimeout(() => {
        setIsOtherTyping(true);
        setTimeout(() => {
          setIsOtherTyping(false);
        }, 3000);
      }, 800);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const activeStudent = classroom.students.find(s => s.id === activeRecipientId);

  return (
    <div className="flex h-[600px] bg-white overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Direct Messages</h4>
        </div>
        <div className="flex-1 overflow-y-auto">
          <button 
            onClick={() => setActiveRecipientId(null)}
            className={`w-full p-6 flex items-center gap-4 transition-all hover:bg-white relative ${activeRecipientId === null ? 'bg-white' : ''}`}
          >
            {activeRecipientId === null && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
            <div className={`p-3 rounded-2xl ${activeRecipientId === null ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-indigo-100 text-indigo-600'}`}>
              <Users size={20} />
            </div>
            <div className="text-left">
              <p className={`font-black text-sm ${activeRecipientId === null ? 'text-gray-900' : 'text-gray-500'}`}>Class Group</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Public Broadcast</p>
            </div>
          </button>

          {classroom.students.map(student => (
            <button 
              key={student.id}
              onClick={() => setActiveRecipientId(student.id)}
              className={`w-full p-6 flex items-center gap-4 transition-all hover:bg-white relative ${activeRecipientId === student.id ? 'bg-white' : ''}`}
            >
              {activeRecipientId === student.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
              <div className="relative">
                <img src={student.avatar} className={`w-12 h-12 rounded-2xl border-2 transition-all ${activeRecipientId === student.id ? 'border-indigo-600 p-0.5' : 'border-white'}`} alt="" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="text-left overflow-hidden">
                <p className={`font-black text-sm truncate ${activeRecipientId === student.id ? 'text-gray-900' : 'text-gray-500'}`}>{student.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Active Now</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            {activeRecipientId ? (
              <>
                <div className="relative">
                  <img src={activeStudent?.avatar} className="w-12 h-12 rounded-2xl shadow-sm" alt="" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 tracking-tight">{activeStudent?.name}</h4>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">Student ID: {activeStudent?.id}</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 tracking-tight">Classroom Board</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Public Channel • {classroom.students.length} Members</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!activeRecipientId && (
              <div className="flex -space-x-3">
                {classroom.students.slice(0, 4).map(s => (
                  <img key={s.id} src={s.avatar} className="w-8 h-8 rounded-xl border-2 border-white shadow-sm" />
                ))}
                {classroom.students.length > 4 && (
                  <div className="w-8 h-8 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400">
                    +{classroom.students.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
          {filteredMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-3xl flex items-center justify-center">
                <MessageCircle size={40} />
              </div>
              <div>
                <h5 className="font-black text-gray-400 uppercase text-xs tracking-widest">Quiet in here</h5>
                <p className="text-gray-300 text-xs mt-2 font-medium italic">"Education is the most powerful weapon..."</p>
              </div>
            </div>
          )}

          {filteredMessages.map((msg, idx) => {
            const isMe = msg.senderId === 'teacher-1';
            const showSender = !isMe && (idx === 0 || filteredMessages[idx - 1].senderId !== msg.senderId);

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {showSender && !msg.recipientId && (
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-1">{msg.senderName}</span>
                  )}
                  
                  <div className="flex items-end gap-2 group">
                    {!isMe && (
                      <div className="w-8 h-8 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden shadow-sm">
                        <img src={classroom.students.find(s => s.id === msg.senderId)?.avatar || "https://picsum.photos/seed/ai/100"} className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div className={`relative px-5 py-3.5 rounded-3xl shadow-sm text-sm font-medium leading-relaxed ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}>
                      {msg.text}
                      
                      <div className={`flex items-center gap-1.5 mt-1 justify-end ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                        <span className="text-[9px] font-bold opacity-70">{msg.timestamp}</span>
                        {isMe && (
                          <span className="flex items-center">
                            {msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isAiAnswering && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex flex-col items-start gap-2">
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest ml-1">Study Buddy (AI)</span>
                <div className="bg-purple-50 border border-purple-100 px-5 py-3 rounded-3xl rounded-tl-none flex items-center gap-3 text-purple-600 shadow-sm">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest">Brainstorming...</span>
                </div>
              </div>
            </div>
          )}

          {isOtherTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white border border-gray-100 px-5 py-3 rounded-3xl rounded-bl-none flex items-center gap-1 shadow-sm">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex items-center gap-4 bg-gray-50 p-2 rounded-[2rem] border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600 transition-all">
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={activeRecipientId ? `Message ${activeStudent?.name}...` : "Class broadcast (@ai for assistance)..."}
              className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-sm font-bold text-gray-700"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="bg-indigo-600 text-white p-3.5 rounded-full hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 disabled:opacity-30 disabled:shadow-none"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-3 px-2 flex items-center justify-between">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              {activeRecipientId ? "Secure Direct Channel" : "Class visible board"}
            </p>
            {!activeRecipientId && (
              <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest animate-pulse">
                Ask @ai anything!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
