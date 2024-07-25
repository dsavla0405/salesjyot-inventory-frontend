import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected }) => {
    const scannerRef = useRef(null);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (scanning) {
            Quagga.init({
                inputStream: {
                    type: 'LiveStream',
                    target: scannerRef.current,
                    constraints: {
                        width: 640,
                        height: 480,
                        facingMode: 'environment' // or 'user' for the front camera
                    }
                },
                decoder: {
                    readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'code_39_reader', 'code_39_vin_reader', 'codabar_reader', 'upc_reader', 'upc_e_reader', 'i2of5_reader']
                }
            }, (err) => {
                if (err) {
                    console.error('Error initializing Quagga:', err);
                    return;
                }
                Quagga.start();
            });
            

            Quagga.onDetected(detected);
        }

        return () => {
            if (scanning) {
                Quagga.stop();
                Quagga.offDetected(detected);
            }
        };
    }, [scanning]);

    const detected = (result) => {
        onDetected(result.codeResult.code);
        setScanning(false);
    };

    return (
        <div>
            <button onClick={() => setScanning(!scanning)}>
                {scanning ? 'Stop Scanning' : 'Start Scanning'}
            </button>
            <div ref={scannerRef} style={{ width: '100%', height: '400px' }} />
        </div>
    );
};

export default BarcodeScanner;
