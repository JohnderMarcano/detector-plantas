import * as ort from 'onnxruntime-web';

class ModelLoader {
  private session: ort.InferenceSession | null = null;
  private loading: boolean = false;
  
  // 👇 AJUSTA ESTE VALOR SEGÚN NECESITES:
  // 0.5 = normal
  // 0.4 = más sensible (detecta más plantas, pero puede confundirse)
  // 0.6 = más estricto (menos errores, pero puede fallar plantas reales)
  private umbral: number = 0.45;  // <--- CAMBIA ESTE NÚMERO PARA PROBAR

  async loadModel() {
    if (this.session) return this.session;
    if (this.loading) {
      while (this.loading) await new Promise(r => setTimeout(r, 100));
      return this.session;
    }

    this.loading = true;
    try {
      console.log("[ROBOT] Cargando modelo desde:", '/modelo_plantas.onnx');
      this.session = await ort.InferenceSession.create('/modelo_plantas.onnx', {
        executionProviders: ['wasm'],
      });
      
      console.log("[ROBOT] ✅ Modelo listo!");
      console.log(`[ROBOT] 📊 Umbral actual: ${this.umbral} (${this.umbral > 0.5 ? 'modo estricto' : this.umbral < 0.5 ? 'modo sensible' : 'modo normal'})`);
      return this.session;
    } catch (error) {
      console.error("[ROBOT] Error cargando modelo:", error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async predict(imageData: ImageData) {
    if (!this.session) {
      throw new Error('El robot no está listo');
    }

    const inputTensor = this.preprocessImage(imageData);
    const feeds = { 'cam_input': inputTensor };
    const results = await this.session.run(feeds);
    const score = results['confidence_score'].data[0] as number;
    
    // Aplicar el umbral personalizado
    const esPlanta = score > this.umbral;
    
    console.log(`[ROBOT] Score: ${score.toFixed(4)} | Umbral: ${this.umbral} | Decisión: ${esPlanta ? '🌿 PLANTA' : '❌ NO PLANTA'}`);
    
    return {
      isPlant: esPlanta,
      confidence: esPlanta ? score : 1 - score,
      rawScore: score,
      umbral: this.umbral
    };
  }

  private preprocessImage(imageData: ImageData): ort.Tensor {
    const tamaño = 224;
    
    const canvas = document.createElement('canvas');
    canvas.width = tamaño;
    canvas.height = tamaño;
    const ctx = canvas.getContext('2d');
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx?.putImageData(imageData, 0, 0);
    
    ctx?.drawImage(tempCanvas, 0, 0, tamaño, tamaño);
    const imageDataRedimensionada = ctx?.getImageData(0, 0, tamaño, tamaño);
    
    const data = new Float32Array(1 * tamaño * tamaño * 3);
    
    for (let y = 0; y < tamaño; y++) {
      for (let x = 0; x < tamaño; x++) {
        const pixelIndex = (y * tamaño + x) * 4;
        const tensorIndex = (y * tamaño + x) * 3;
        
        // Enviamos valores de 0 a 255 (el modelo tiene su propio Rescaling)
        data[tensorIndex + 0] = imageDataRedimensionada!.data[pixelIndex];
        data[tensorIndex + 1] = imageDataRedimensionada!.data[pixelIndex + 1];
        data[tensorIndex + 2] = imageDataRedimensionada!.data[pixelIndex + 2];
      }
    }
    
    return new ort.Tensor('float32', data, [1, tamaño, tamaño, 3]);
  }

  // Método para cambiar el umbral desde la interfaz (opcional)
  setUmbral(nuevoUmbral: number) {
    if (nuevoUmbral >= 0 && nuevoUmbral <= 1) {
      this.umbral = nuevoUmbral;
      console.log(`[ROBOT] Umbral cambiado a: ${this.umbral}`);
    }
  }
}

export const modelLoader = new ModelLoader();
