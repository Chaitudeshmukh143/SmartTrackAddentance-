
import React, { useState } from 'react';
import { Classroom, Note } from '../types';
import { FileText, Plus, Sparkles, Loader2, Search, Calendar, User, X } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';

interface NotesTabProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
}

const NotesTab: React.FC<NotesTabProps> = ({ classroom, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const filteredNotes = classroom.notes.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAiSummary = async (noteId: string, content: string) => {
    setAiLoading(noteId);
    try {
      const summary = await getGeminiResponse(`Summarize in 3 bold points: ${content}`);
      const updatedNotes = classroom.notes.map(n => n.id === noteId ? { ...n, summary } : n);
      onUpdate({ ...classroom, notes: updatedNotes });
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 max-w-xl w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search resources..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
          />
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} /> New Resource
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredNotes.map(note => (
          <div key={note.id} className="group bg-white rounded-[3rem] border border-gray-100 p-10 hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-2">{note.title}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {note.uploadDate}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span className="flex items-center gap-1.5"><User size={14} /> {note.author}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-gray-600 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                  {note.content}
                </div>
              </div>

              <div className="lg:w-96 space-y-6">
                {!note.summary ? (
                  <button 
                    onClick={() => handleAiSummary(note.id, note.content)}
                    disabled={!!aiLoading}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-50 text-indigo-600 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    {aiLoading === note.id ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {aiLoading === note.id ? 'Analyzing...' : 'Generate AI Summary'}
                  </button>
                ) : (
                  <div className="relative p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 overflow-hidden group/summary animate-in zoom-in-95 duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles size={48} className="animate-pulse" />
                    </div>
                    <h5 className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 text-indigo-200 flex items-center gap-2">
                      <Sparkles size={14} /> Smart Summary
                    </h5>
                    <div className="text-sm font-medium leading-relaxed italic opacity-95">
                      {note.summary}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0a0c]/80 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-500 overflow-hidden relative">
            <div className="p-12 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Share Resource</h3>
              {/* Added missing X component below */}
              <button onClick={() => setIsUploading(false)} className="p-4 bg-gray-50 rounded-3xl text-gray-400"><X size={24} className="rotate-45" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newNote.title && newNote.content) {
                onUpdate({ ...classroom, notes: [{ id: `n-${Date.now()}`, ...newNote, uploadDate: new Date().toISOString().split('T')[0], author: 'Teacher' }, ...classroom.notes] });
                setIsUploading(false);
              }
            }} className="p-12 space-y-8">
              <input type="text" value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} className="w-full px-8 py-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-600 font-bold text-lg outline-none" placeholder="Resource Title" />
              <textarea value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} className="w-full h-48 px-8 py-6 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-600 font-bold text-lg outline-none resize-none" placeholder="Drop the knowledge here..." />
              <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Publish Resource</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesTab;
