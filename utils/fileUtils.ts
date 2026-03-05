
/**
 * Resizes and compresses an image for storage in IndexedDB.
 * We use image/webp to preserve transparency (alpha channel) while maintaining 
 * small file sizes and high visual quality.
 */
export const resizeAndCompressImage = (file: File, maxWidth = 1024, maxHeight = 1024): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not found'));
        
        // Ensure the canvas is clear before drawing
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        /**
         * We use image/webp as it supports transparency and offers superior compression.
         * If a browser doesn't support webp, toDataURL defaults to image/png, 
         * which also preserves transparency.
         */
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        const mimeType = dataUrl.substring(dataUrl.indexOf(":") + 1, dataUrl.indexOf(";"));
        const base64 = dataUrl.split(',')[1];
        
        resolve({ base64, mimeType });
      };
      img.onerror = () => reject(new Error('Image loading failed'));
    };
    reader.onerror = () => reject(new Error('File reading failed'));
  });
};

export const downloadAsJSON = (data: any, fileName: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};
