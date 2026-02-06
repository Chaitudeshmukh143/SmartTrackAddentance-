
import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface ScannerModalProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onScan, onClose, title = "Scan QR Code" }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize the scanner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Stop scanner on success
        if (scannerRef.current) {
          scannerRef.current.clear().then(() => {
            onScan(decodedText);
          }).catch(err => {
            console.error("Failed to clear scanner", err);
            onScan(decodedText);
          });
        }
      },
      (errorMessage) => {
        // Too verbose for console
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.warn(err));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <Camera size={24} />
            <h3 className="text-xl font-black tracking-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
            <X size={28} />
          </button>
        </div>
        
        <div className="p-6">
          <div id="qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50"></div>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm font-bold text-gray-500">Position the QR code within the frame</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Access to camera is required</p>
          </div>
        </div>

        <div className="p-8 pt-0">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
