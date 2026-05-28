'use client';

import React, { useState, useRef } from 'react';
import { Camera } from '@/components/Camera';
import { ImageUploader } from '@/components/ImageUploader';

export default function Home() {
  const [modo, setModo] = useState<'camara' | 'archivo'>('camara');
  const [resultado, setResultado] = useState<any>(null);
  const [imagenCargada, setImagenCargada] = useState<string | null>(null);
  
  // Referencia para resetear el input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limpiarTodo = () => {
    setResultado(null);
    setImagenCargada(null);
    // Resetear el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ background: 'radial-gradient(circle at 20% 50%, #0A1A0F 0%, #050A07 100%)' }} className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3 animate-pulse" style={{ filter: 'drop-shadow(0 0 12px #00FF88)' }}>
            🌿
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
            Detector de Plantas
          </h1>
          <p className="text-sm" style={{ color: '#00D4FF' }}>
            Inteligencia artificial para clasificar Plantas
          </p>
          <div className="mt-3 h-px w-16 mx-auto" style={{ backgroundColor: '#00FF88' }}></div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setModo('camara');
              limpiarTodo();
            }}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              modo === 'camara' ? 'scale-105' : 'hover:scale-102'
            }`}
            style={{
              background: modo === 'camara' ? '#00FF88' : 'rgba(0, 255, 136, 0.1)',
              color: modo === 'camara' ? '#050A07' : '#00FF88',
              border: modo === 'camara' ? 'none' : '1px solid rgba(0, 255, 136, 0.3)'
            }}
          >
            📷 Cámara en Vivo
          </button>
          <button
            onClick={() => {
              setModo('archivo');
              limpiarTodo();
            }}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              modo === 'archivo' ? 'scale-105' : 'hover:scale-102'
            }`}
            style={{
              background: modo === 'archivo' ? '#00FF88' : 'rgba(0, 255, 136, 0.1)',
              color: modo === 'archivo' ? '#050A07' : '#00FF88',
              border: modo === 'archivo' ? 'none' : '1px solid rgba(0, 255, 136, 0.3)'
            }}
          >
            📁 Subir Imagen
          </button>
        </div>

        {/* Tarjeta principal */}
        <div 
          className="rounded-2xl overflow-hidden backdrop-blur-xl"
          style={{ 
            background: 'rgba(10, 20, 15, 0.7)',
            border: '1px solid rgba(0, 255, 136, 0.2)'
          }}
        >
          <div className="p-6">
            {modo === 'camara' ? (
              <Camera onDetection={setResultado} />
            ) : (
              <ImageUploader 
                onDetection={setResultado} 
                onImageChange={setImagenCargada}
                resetTrigger={resultado === null && imagenCargada === null}
                fileInputRef={fileInputRef}
              />
            )}

            {/* Botón limpiar - solo visible cuando hay resultado O imagen cargada */}
            {(resultado || imagenCargada) && (
              <>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={limpiarTodo}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255, 68, 0, 0.15)',
                      color: '#FF6600',
                      border: '1px solid rgba(255, 68, 0, 0.3)'
                    }}
                  >
                    🗑️ Limpiar
                  </button>
                </div>

                <div className="mt-4 p-5 rounded-xl text-center"
                     style={{
                       background: resultado?.isPlant 
                         ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 212, 255, 0.05))'
                         : resultado ? 'linear-gradient(135deg, rgba(255, 68, 0, 0.08), rgba(180, 0, 255, 0.04))'
                         : 'rgba(0, 255, 136, 0.05)',
                       border: resultado ? `2px solid ${resultado.isPlant ? '#00FF88' : '#FF6600'}` : '1px solid rgba(0, 255, 136, 0.15)'
                     }}>
                  
                  {resultado ? (
                    <>
                      <div className="text-6xl mb-3">
                        {resultado.isPlant ? '🌿' : '🍂'}
                      </div>
                      
                      <h2 className={`text-2xl font-bold mb-2 ${
                        resultado.isPlant ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {resultado.isPlant ? '¡Es una planta natural!' : 'No es una planta natural'}
                      </h2>
                      
                      <p className="text-sm mb-4" style={{ color: '#8899AA' }}>
                        {resultado.isPlant 
                          ? 'El modelo ha identificado esto como una planta natural'
                          : 'El modelo no reconoce esto como una planta natural'}
                      </p>
                      
                      {/* Barra de confianza */}
                      <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-sm mb-2">
                          <span style={{ color: '#8899AA' }}>Confianza</span>
                          <span className={`font-bold ${resultado.isPlant ? 'text-green-400' : 'text-orange-400'}`}>
                            {(resultado.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(0, 255, 136, 0.1)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${resultado.confidence * 100}%`,
                              background: resultado.isPlant 
                                ? 'linear-gradient(90deg, #00CC6B, #00FF88)'
                                : 'linear-gradient(90deg, #FF4400, #FF6600)'
                            }}
                          />
                        </div>
                      </div>
                    </>
                  ) : imagenCargada && (
                    <div className="text-center py-4">
                      <div className="text-4xl mb-2">⏳</div>
                      <p style={{ color: '#00D4FF' }}>Esperando análisis...</p>
                      <p className="text-xs mt-2" style={{ color: '#8899AA' }}>La imagen se analizará automáticamente</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.15)' }}>
            <div className="text-xl mb-1">🧠</div>
            <div className="text-xs font-semibold" style={{ color: '#00FF88' }}>CNN + Sigmoid</div>
            <div className="text-xs mt-0.5" style={{ color: '#8899AA' }}>Red neuronal</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.15)' }}>
            <div className="text-xl mb-1">📊</div>
            <div className="text-xs font-semibold" style={{ color: '#00FF88' }}>826 imágenes</div>
            <div className="text-xs mt-0.5" style={{ color: '#8899AA' }}>Plantas / No Planta</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.15)' }}>
            <div className="text-xl mb-1">🔒</div>
            <div className="text-xs font-semibold" style={{ color: '#00FF88' }}>Privacidad</div>
            <div className="text-xs mt-0.5" style={{ color: '#8899AA' }}>Procesamiento local</div>
          </div>
        </div>

        {/* Footer con créditos */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(0, 255, 136, 0.1)' }}>
          <div className="text-center">
            <div className="text-xs mb-3" style={{ color: '#00FF88' }}>DESARROLLADO POR</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div style={{ color: '#00D4FF' }}>Jerson Orozco</div>
              <div style={{ color: '#00D4FF' }}>Johnder Marcano</div>
              <div style={{ color: '#00D4FF' }}>Santiago Peña</div>
              <div style={{ color: '#00D4FF' }}>Ayleen Betancourt</div>
            </div>
            <div className="text-xs mt-3" style={{ color: '#3d6b4a' }}>
              <span>ONNX Runtime Web · Inferencia en tiempo real · v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}