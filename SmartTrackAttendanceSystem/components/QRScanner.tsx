
import React, { useState } from 'react';
import { Course } from '../types';

interface QRScannerProps {
  onScan: (courseId: string) => void;
  onClose: () => void;
  availableCourses: Course[];
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, availableCourses }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = (courseId: string) => {
    setIsScanning(true);
    setTimeout(() => {
      onScan(courseId);
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <div className="bg-emerald-600 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-xl font-bold">Check-in Scanner</h3>
          <p className="text-emerald-100 text-sm mt-1">Point your camera at the teacher's QR code</p>
        </div>
        
        <div className="p-6">
          <div className="border-4 border-emerald-500/20 rounded-2xl h-72 flex flex-col items-center justify-center bg-slate-900 mb-6 overflow-hidden relative group">
            <div className="absolute inset-0 border-[40px] border-black/40"></div>
            {/* Scanner corner markers */}
            <div className="absolute top-10 left-10 w-8 h-8 border-t-4 border-l-4 border-emerald-400"></div>
            <div className="absolute top-10 right-10 w-8 h-8 border-t-4 border-r-4 border-emerald-400"></div>
            <div className="absolute bottom-10 left-10 w-8 h-8 border-b-4 border-l-4 border-emerald-400"></div>
            <div className="absolute bottom-10 right-10 w-8 h-8 border-b-4 border-r-4 border-emerald-400"></div>
            
            {/* Scanning line animation */}
            <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-bounce"></div>

            {isScanning ? (
              <div className="flex flex-col items-center z-10">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-white font-medium tracking-wide">VERIFYING...</p>
              </div>
            ) : (
              <div className="text-center z-10">
                <svg className="w-16 h-16 text-emerald-400/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-emerald-400/80 text-xs font-mono">SCANNING ACTIVE</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Class to Scan</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {availableCourses.map(course => (
                <button 
                  key={course.id}
                  onClick={() => handleSimulateScan(course.id)} 
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 rounded-xl text-sm font-semibold transition-all border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex flex-col items-start">
                    <span>{course.name}</span>
                    <span className="text-[10px] text-slate-400">{course.code}</span>
                  </div>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              ))}
            </div>
            
            <label className="block w-full text-center py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold cursor-pointer transition-all shadow-lg shadow-emerald-100 mt-2">
              Use Camera
              <input type="file" accept="image/*" capture="environment" className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
