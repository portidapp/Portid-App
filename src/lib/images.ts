/**
 * Compresses an image file and converts it to WebP format.
 * Caps dimensions proportionally to optimize file size without sacrificing crispness.
 * Returns a new File object with a .webp extension.
 */
export const compressAndConvertToWebP = (
  file: File,
  maxDimension: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Only compress and convert standard images
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions to maintain aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get 2D canvas context'));
      }
      
      // Clean high-quality rendering
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Failed to compress image to WebP'));
          }
          
          // Generate a clean WebP file representation
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    
    img.src = objectUrl;
  });
};
