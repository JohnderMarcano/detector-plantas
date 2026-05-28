  import * as ort from 'onnxruntime-web';

class ModelLoader {
  private session: ort.InferenceSession | null = null;

  async loadModel() {
    if (this.session) return this.session;
    
    console.log("🔄 Cargando el robot...");
    this.session = await ort.InferenceSession.create('/modelo_plantas.onnx');
    console.log("✅ Robot listo para usar!");
    return this.session;
  }

  async predict(imageData: ImageData) {
    if (!this.session) {
      throw new Error('El robot no está listo');
    }

    const inputTensor = this.preprocessImage(imageData);
    const feeds = { 'cam_input': inputTensor };
    const results = await this.session.run(feeds);
    const score = results['confidence_score'].data[0] as number;
    
    console.log("Score del robot:", score);
    
    return {
      isPlant: score > 0.5,
      confidence: score > 0.5 ? score : 1 - score,
      rawScore: score
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
        
        // IMPORTANTE: Enviamos valores de 0 a 255 (SIN dividir)
        // El modelo tiene su propio Rescaling(1./255)
        data[tensorIndex + 0] = imageDataRedimensionada!.data[pixelIndex];      // R
        data[tensorIndex + 1] = imageDataRedimensionada!.data[pixelIndex + 1];  // G
        data[tensorIndex + 2] = imageDataRedimensionada!.data[pixelIndex + 2];  // B
      }
    }
    
    return new ort.Tensor('float32', data, [1, tamaño, tamaño, 3]);
  }
}

export const modelLoader = new ModelLoader();  
