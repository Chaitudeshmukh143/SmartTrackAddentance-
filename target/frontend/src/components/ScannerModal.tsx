
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
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scannerRef.current.render(
      (decodedText) => {
        if (scannerRef.current) {
          scannerRef.current.clear().then(() => onScan(decodedText)).catch(() => onScan(decodedText));
        }
      },
      () => {}
    );
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
          <h3 className="text-xl font-black tracking-tight">{title}</h3>
          <button onClick={onClose}><X size={28} /></button>
        </div>
        <div className="p-6">
          <div id="qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50"></div>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
