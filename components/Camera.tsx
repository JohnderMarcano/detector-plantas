import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { modelLoader } from '@/utils/modelLoader';

export const Camera = ({ onDetection }: { onDetection: (result: any) => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const [robotListo, setRobotListo] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<any>(null);

  useEffect(() => {
    modelLoader.loadModel().then(() => {
      setRobotListo(true);
    });
  }, []);

  const tomarFotoYPreguntar = async () => {
    if (!robotListo || analizando) return;
    setAnalizando(true);
    try {
      const foto = webcamRef.current?.getScreenshot();
      if (!foto) return;
      const img = new Image();
      img.src = foto;
      await new Promise((resolve) => { img.onload = resolve; });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const imageData = ctx?.getImageData(0, 0, img.width, img.height);
      if (imageData) {
        const resultado = await modelLoader.predict(imageData);
        setUltimoResultado(resultado);
        onDetection(resultado);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAnalizando(false);
    }
  };

  useEffect(() => {
    if (!robotListo) return;
    const intervalo = setInterval(tomarFotoYPreguntar, 1500);
    return () => clearInterval(intervalo);
  }, [robotListo]);

  return (
    <div className="relative">
      <div className="relative rounded-xl overflow-hidden" style={{ background: '#0A0F0D' }}>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full rounded-xl"
          videoConstraints={{ width: 640, height: 480, facingMode: "environment" }}
        />
        
        {/* Efecto de escaneo sutil */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, rgba(0, 255, 136, 0.03) 0px, rgba(0, 255, 136, 0.03) 2px, transparent 2px, transparent 8px)'
        }} />
        
        {/* Bounding Box cuando detecta planta */}
        {ultimoResultado && ultimoResultado.isPlant && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="absolute rounded-lg" style={{
              top: '12%', left: '12%', right: '12%', bottom: '12%',
              border: '2px solid #00FF88',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              borderRadius: '12px'
            }}>
              <div style={{ position: 'absolute', top: '-3px', left: '-3px', width: '16px', height: '16px', borderTop: '3px solid #00FF88', borderLeft: '3px solid #00FF88' }}></div>
              <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '16px', height: '16px', borderTop: '3px solid #00FF88', borderRight: '3px solid #00FF88' }}></div>
              <div style={{ position: 'absolute', bottom: '-3px', left: '-3px', width: '16px', height: '16px', borderBottom: '3px solid #00FF88', borderLeft: '3px solid #00FF88' }}></div>
              <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '16px', height: '16px', borderBottom: '3px solid #00FF88', borderRight: '3px solid #00FF88' }}></div>
              <div className="absolute font-semibold text-xs px-2 py-0.5 rounded" style={{ top: '-28px', left: '8px', background: '#00FF88', color: '#050A07' }}>
                🌿 Planta detectada {(ultimoResultado.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
        
        {/* Indicador de estado */}
        <div className="absolute bottom-3 right-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className={`w-2 h-2 rounded-full ${analizando ? 'animate-pulse' : ''}`} style={{ background: analizando ? '#00FF88' : '#8899AA' }}></div>
            <span className="text-xs" style={{ color: '#00D4FF' }}>{analizando ? 'Analizando...' : 'Listo'}</span>
          </div>
        </div>
      </div>
      
      {!robotListo && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: 'rgba(5, 10, 7, 0.9)' }}>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full animate-spin border-2 mx-auto mb-2" style={{ borderColor: '#00FF88', borderTopColor: 'transparent' }}></div>
            <span className="text-xs" style={{ color: '#00FF88' }}>Cargando modelo...</span>
          </div>
        </div>
      )}
    </div>
  );
};