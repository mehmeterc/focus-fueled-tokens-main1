
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { X, QrCode, ArrowRightLeft } from 'lucide-react';

interface QRDisplayProps {
  cafeId: string;
  cafeName: string;
  onClose: () => void;
  type?: 'check-in' | 'check-out';
}

const QRDisplay = ({ cafeId, cafeName, onClose, type = 'check-in' }: QRDisplayProps) => {
  const [qrValue, setQrValue] = useState<string>('');
  const [displayType, setDisplayType] = useState<'check-in' | 'check-out'>(type);

  useEffect(() => {
    // Create a unique URL with the cafe ID, type, and timestamp
    // This makes each QR code unique for each session
    const timestamp = new Date().getTime();
    const value = `antiapp://${displayType}/${cafeId}?t=${timestamp}`;
    setQrValue(value);
  }, [cafeId, displayType]);

  const toggleType = () => {
    setDisplayType(displayType === 'check-in' ? 'check-out' : 'check-in');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4">
      <div className="relative bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-bold text-center text-antiapp-purple">
            {displayType === 'check-in' ? 'Check In' : 'Check Out'} QR Code
          </h3>
          <p className="text-center text-gray-600 mt-1">{cafeName}</p>
        </div>
        
        <div className="flex flex-col items-center justify-center p-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {qrValue && (
              <QRCodeSVG
                value={qrValue}
                size={200}
                level="H"
                includeMargin
                bgColor="#FFFFFF"
                fgColor={displayType === 'check-in' ? '#0D9488' : '#F97066'}
              />
            )}
          </div>
          
          <p className="mt-4 text-center text-gray-600">
            Community members can scan this QR code to {displayType === 'check-in' ? 'check in at' : 'check out from'} your cafe
          </p>
          
          <Button 
            onClick={toggleType} 
            variant="outline" 
            className="mt-4 flex items-center gap-2"
          >
            <ArrowRightLeft size={16} />
            Switch to {displayType === 'check-in' ? 'Check Out' : 'Check In'} QR
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRDisplay;
