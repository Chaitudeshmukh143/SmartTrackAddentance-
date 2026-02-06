
import React, { useState } from 'react';
import { Classroom, Note } from '../types';
import { Upload, FileText, Search, Plus, Sparkles, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const filteredNotes = classroom.notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedNotes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNotes(newSet);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.title && newNote.content) {
      const note: Note = {
        id: `note-${Date.now()}`,
        title: newNote.title,
        content: newNote.content,
        uploadDate: new Date().toISOString().split('T')[0],
        author: 'Prof. Anderson'
      };
      onUpdate({ ...classroom, notes: [note, ...classroom.notes] });
      setNewNote({ title: '', content: '' });
      setIsUploading(false);
    }
  };

  const handleAiSummary = async (noteId: string, content: string) => {
    setAiLoading(noteId);
    try {
      const summary = await getGeminiResponse(`Create a concise bullet-point summary of the following educational content. Use a few clear bullet points: ${content}`);
      
      const updatedNotes = classroom.notes.map(n => 
        n.id === noteId ? { ...n, summary: summary } : n
      );
      onUpdate({ ...classroom, notes: updatedNotes });
      
      // Auto-expand to show the new summary
      setExpandedNotes(prev => new Set(prev).add(noteId));
    } catch (error) {
      console.error("AI Summary failed", error);
    } finally {
      setAiLoading(null);
    }
  };

  const deleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onUpdate({ ...classroom, notes: classroom.notes.filter(n => n.id !== id) });
    }
  };

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-white/50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          Upload New Note
        </button>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
              <h3 className="text-2xl font-black tracking-tight">Post New Resource</h3>
              <button onClick={() => setIsUploading(false)} className="opacity-70 hover:opacity-100 transition-opacity">
                <Plus size={28} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Topic Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newNote.title}
                  onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700"
                  placeholder="e.g. Introduction to Quantum Computing"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Content / Full Text</label>
                <textarea 
                  value={newNote.content}
                  onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full h-48 px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-bold text-gray-700"
                  placeholder="Enter detailed notes or transcript here..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Publish To Classroom
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredNotes.map(note => {
          const isExpanded = expandedNotes.has(note.id);
          return (
            <div key={note.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-xl hover:border-indigo-100 transition-all space-y-6 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">{note.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Calendar size={12} /> {note.uploadDate}
                      </span>
                      <span className="text-gray-200">|</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">By {note.author}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAiSummary(note.id, note.content)}
                    disabled={!!aiLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${note.summary ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'} disabled:opacity-50`}
                  >
                    <Sparkles size={16} className={aiLoading === note.id ? 'animate-spin' : ''} />
                    {aiLoading === note.id ? 'Processing...' : note.summary ? 'Summary Ready' : 'Generate Summary'}
                  </button>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                    title="Delete Note"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className={`text-gray-600 text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                  {note.content}
                </div>
                {note.content.length > 200 && (
                  <button 
                    onClick={() => toggleExpand(note.id)}
                    className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    {isExpanded ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Read Full Content</>}
                  </button>
                )}
              </div>

              {/* AI Summary Display Section */}
              {note.summary && (
                <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 rounded-3xl p-6 border border-indigo-100/50 shadow-inner relative overflow-hidden group/summary">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-600 group-hover/summary:scale-125 transition-transform duration-700">
                      <Sparkles size={48} />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Sparkles size={16} />
                      </div>
                      <h5 className="font-black text-xs uppercase tracking-widest text-indigo-900">AI-Generated Summary</h5>
                    </div>
                    
                    <div className="text-sm text-indigo-900/80 font-medium leading-relaxed prose prose-indigo max-w-none">
                      {note.summary.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0 flex gap-2">
                          <span className="text-indigo-400 flex-shrink-0">•</span>
                          {line.replace(/^[*-]\s*/, '')}
                        </p>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300">
                      <span>Powered by Gemini AI</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {filteredNotes.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200">
              <FileText size={48} />
            </div>
            <div>
              <h5 className="text-xl font-black text-gray-400 tracking-tight">No Resources Available</h5>
              <p className="text-gray-300 text-sm mt-1">Upload study materials to help your students learn faster.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesTab;
