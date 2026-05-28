import React, { useState, useEffect, useRef } from 'react';
import { modelLoader } from '@/utils/modelLoader';

export const ImageUploader = ({ 
  onDetection, 
  onImageChange,
  resetTrigger,
  fileInputRef 
}: { 
  onDetection: (result: any) => void;
  onImageChange: (url: string | null) => void;
  resetTrigger?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
}) => {
  const [analizando, setAnalizando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = fileInputRef || internalFileInputRef;

  // Resetear cuando se limpia
  useEffect(() => {
    if (resetTrigger) {
      setVistaPrevia(null);
      setNombreArchivo('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [resetTrigger]);

  const manejarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    
    setAnalizando(true);
    setNombreArchivo(archivo.name);
    const urlVistaPrevia = URL.createObjectURL(archivo);
    setVistaPrevia(urlVistaPrevia);
    onImageChange(urlVistaPrevia);
    
    try {
      const img = new Image();
      img.src = urlVistaPrevia;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const imageData = ctx?.getImageData(0, 0, img.width, img.height);
      
      if (imageData) {
        const resultado = await modelLoader.predict(imageData);
        onDetection(resultado);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed rounded-xl p-10 text-center transition-all hover:border-green-500/50 cursor-pointer"
        style={{ 
          borderColor: 'rgba(0, 255, 136, 0.3)',
          background: 'rgba(0, 255, 136, 0.03)'
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={manejarImagen}
          className="hidden"
          id="subir-imagen"
        />
        <label htmlFor="subir-imagen" className="cursor-pointer inline-block">
          <div className="text-5xl mb-3 transition-transform hover:scale-110 inline-block">📸</div>
          <div className="text-base font-semibold mb-1" style={{ color: '#00FF88' }}>
            Sube tu imagen
          </div>
          <div className="text-xs" style={{ color: '#8899AA' }}>
            JPG, PNG o WebP · Tamaño máximo 10MB
          </div>
        </label>
      </div>

      {nombreArchivo && (
        <div className="text-center text-sm py-2 px-4 rounded-full inline-block w-auto mx-auto" 
             style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00FF88' }}>
          📄 {nombreArchivo}
        </div>
      )}

      {vistaPrevia && (
        <div className="mt-3">
          <img 
            src={vistaPrevia} 
            alt="Vista previa" 
            className="max-w-full max-h-80 mx-auto rounded-xl shadow-lg"
            style={{ border: '2px solid rgba(0, 255, 136, 0.3)' }}
          />
        </div>
      )}

      {analizando && (
        <div className="text-center py-6">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full animate-spin border-2"
                style={{ borderColor: '#00FF88', borderTopColor: 'transparent' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-sm">🌿</div>
            </div>
            <span className="text-sm" style={{ color: '#00D4FF' }}>Analizando imagen...</span>
          </div>
        </div>
      )}
    </div>
  );
};