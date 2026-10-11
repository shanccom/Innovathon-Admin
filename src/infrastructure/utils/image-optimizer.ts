export interface OptimizedImageResult {
  base64: string;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
  originalSizeBytes: number;
  reductionPercent: number;
  width: number;
  height: number;
}

/**
 * Optimiza y redimensiona una imagen en el navegador del cliente antes de enviarla
 * para evitar colapsar la memoria de Apps Script y reducir el riesgo de ser marcado como Spam.
 */
export async function optimizeImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.82
): Promise<OptimizedImageResult> {
  const originalSizeBytes = file.size;

  // Validación de entorno de navegador con soporte de Image y Canvas
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return {
      base64,
      mimeType: file.type || 'image/jpeg',
      fileName: file.name,
      sizeBytes: originalSizeBytes,
      originalSizeBytes,
      reductionPercent: 0,
      width: 800,
      height: 600,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('El archivo no es una imagen válida o está dañado.'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular escalado proporcional manteniendo la relación de aspecto
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto 2D de Canvas.'));
          return;
        }

        // Renderizado nítido
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG (o PNG si tiene transparencia)
        const isPng = file.type === 'image/png';
        const targetMime = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(targetMime, quality);

        // Extraer payload base64 puro
        const base64 = dataUrl.split(',')[1] || dataUrl;
        const sizeBytes = Math.round((base64.length * 3) / 4);
        const reductionPercent = Math.max(
          0,
          Math.round(((originalSizeBytes - sizeBytes) / originalSizeBytes) * 100)
        );

        resolve({
          base64,
          mimeType: targetMime,
          fileName: file.name.replace(/\.[^/.]+$/, isPng ? '.png' : '.jpg'),
          sizeBytes,
          originalSizeBytes,
          reductionPercent,
          width,
          height,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
