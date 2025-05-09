
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, ZapOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QRScannerProps {
  onScan: (result: string, cafeId: string, scanType: 'check-in' | 'check-out') => void;
  onClose: () => void;
  expectedType?: 'check-in' | 'check-out'; // The expected type of QR code to scan
}

const QRScanner = ({ onScan, onClose, expectedType }: QRScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast: toastHook } = useToast();
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
        
        // In a real implementation with a QR scanner library, we would process video frames here
        // For demo purposes, we'll simulate a successful scan
        const urlParts = window.location.pathname.split('/');
        const cafeId = urlParts[urlParts.length - 1];
        
        // Simulate QR code detection after a delay
        if (scanning) {
          const timer = setTimeout(() => {
            // For demo purposes, we'll create a mock QR value
            // In a real app, this would come from scanning
            const mockType = expectedType || 'check-in';
            const mockQrValue = `antiapp://${mockType}/${cafeId}?t=${Date.now()}`;
            validateQrCode(mockQrValue, cafeId);
          }, 3000);
          
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please make sure you have granted camera permissions.');
        setHasCamera(false);
      }
    };
    
    if (scanning) {
      startCamera();
    }
    
    return () => {
      // Stop the camera stream when component unmounts or scanning stops
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [scanning, expectedType]);

  const validateQrCode = async (qrValue: string, cafeId: string) => {
    try {
      setScanning(false);
      
      // Check if it's a valid AntiApp QR code
      if (!qrValue.startsWith('antiapp://check-in/') && !qrValue.startsWith('antiapp://check-out/')) {
        toast.error("Invalid QR code format. Please scan an AntiApp cafe QR code");
        return;
      }
      
      // Extract scan type and cafe ID from QR code
      const isCheckIn = qrValue.startsWith('antiapp://check-in/');
      const scanType = isCheckIn ? 'check-in' : 'check-out';
      
      // If an expected type was provided, validate against it
      if (expectedType && scanType !== expectedType) {
        toast.error(`This is a ${scanType} QR code. Please scan a ${expectedType} QR code.`);
        return;
      }
      
      // Extract cafe ID from QR code
      const qrCafeId = qrValue.split(`antiapp://${scanType}/`)[1].split('?')[0];
      
      // Validate cafe exists in our database
      const { data, error } = await supabase
        .from('cafes')
        .select('id, name')
        .eq('id', qrCafeId)
        .single();
      
      if (error || !data) {
        toast.error("The scanned cafe could not be found");
        return;
      }
      
      // Success - call onScan with the result
      toast.success(`Successfully scanned ${scanType} code for ${data.name}`);
      onScan(qrValue, qrCafeId, scanType);
      
    } catch (error) {
      console.error('Error validating QR code:', error);
      toastHook({
        title: "QR Validation Failed",
        description: "Could not validate the QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  // For demo purposes only - you would use a real QR scanner in production
  const handleManualCafeSelection = () => {
    const urlParts = window.location.pathname.split('/');
    const cafeId = urlParts[urlParts.length - 1];
    const mockType = expectedType || 'check-in';
    const mockQrValue = `antiapp://${mockType}/${cafeId}?t=${Date.now()}`;
    validateQrCode(mockQrValue, cafeId);
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
            Scan {expectedType || 'QR'} Code
          </h3>
          <p className="text-center text-gray-600 mt-1">
            Scan the {expectedType ? expectedType : 'QR'} code displayed at the cafe
          </p>
        </div>
        
        {error || !hasCamera ? (
          <div className="p-6 text-center">
            <div className="mb-4 flex flex-col items-center">
              <ZapOff className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-red-500">{error || "Camera access required for scanning"}</p>
            </div>
            <p className="mb-4 text-gray-600">For demo purposes, you can simulate scanning:</p>
            <Button onClick={handleManualCafeSelection} className="mb-2 bg-antiapp-teal">
              Simulate QR Scan
            </Button>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        ) : (
          <div className="relative">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Scan area indicator */}
                <div className="w-48 h-48 border-2 border-antiapp-teal rounded-lg relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-antiapp-teal"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-antiapp-teal"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-antiapp-teal"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-antiapp-teal"></div>
                </div>
                
                {/* Animated scanner line */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-1 bg-antiapp-teal opacity-70 animate-[scanner_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
            
            <div className="p-4 text-center">
              <p className="text-gray-600 mb-2">Position the cafe's QR code within the frame</p>
              <div className="animate-pulse flex justify-center">
                <Camera className="h-6 w-6 text-antiapp-teal" />
              </div>
              
              <p className="mt-4 text-xs text-gray-500">
                For demo purposes, scanning will be simulated in a few seconds
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
