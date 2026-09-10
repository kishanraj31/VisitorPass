import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./QRScanner.css";

const QRScanner = ({ onScan, label = "Point camera at QR code" }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanned, setScanned] = useState(null);

  const startScanner = async () => {
    setError(null);
    setScanned(null);
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScanned(decodedText);
          stopScanner();
          onScan(decodedText);
        },
        undefined
      );
      setScanning(true);
    } catch (err) {
      setError("Camera access denied or not available: " + err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="qr-scanner-wrapper">
      <p className="qr-label">{label}</p>
      <div id="qr-reader" className="qr-reader-box" />
      {error && <p className="qr-error">{error}</p>}
      {scanned && <p className="qr-result">✔ Scanned: {scanned.slice(0, 20)}...</p>}
      <div className="qr-controls">
        {!scanning ? (
          <button id="btn-start-scan" className="btn-primary" onClick={startScanner}>
            📷 Start Camera Scan
          </button>
        ) : (
          <button id="btn-stop-scan" className="btn-secondary" onClick={stopScanner}>
            ⏹ Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
