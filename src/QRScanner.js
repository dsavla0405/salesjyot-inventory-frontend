import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const QRScanner = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);

  const handleStartScan = () => {
    setScanning(true);
  };

  const handleStopScan = () => {
    setScanning(false);
  };

  return (
    <div style={{ width: '50%' }}>
      {/* Conditionally render the Scanner component based on the scanning state */}
      {scanning && (
        <Scanner
          onScan={onScan} // Pass the onScan prop
          onError={(error) => console.log(error?.message)}
          active={scanning}
        />
      )}
      {/* Render start and stop buttons */}
      <div>
        <button onClick={handleStartScan} disabled={scanning}>
          Start Scanning
        </button>
        <button onClick={handleStopScan} disabled={!scanning}>
          Stop Scanning
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
