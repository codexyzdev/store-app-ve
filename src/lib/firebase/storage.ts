import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from './config';

const storage = getStorage(app);

export async function subirImagenCliente(clienteId: string, archivo: File): Promise<string> {
  const storageRef = ref(storage, `clientes/${clienteId}/cedula.jpg`);
  await uploadBytes(storageRef, archivo);
  const url = await getDownloadURL(storageRef);
  return url;
}

export async function subirImagenProducto(productoId: string, archivo: File, indice: number): Promise<string> {
  // Generar nombre único para la imagen
  const timestamp = Date.now();
  const extension = archivo.name.split('.').pop();
  const nombreArchivo = `imagen_${indice}_${timestamp}.${extension}`;
  
  const storageRef = ref(storage, `productos/${productoId}/${nombreArchivo}`);
  await uploadBytes(storageRef, archivo);
  const url = await getDownloadURL(storageRef);
  return url;
}

export async function subirImagenesProducto(productoId: string, archivos: File[]): Promise<string[]> {
  const urls: string[] = [];
  
  for (let i = 0; i < archivos.length; i++) {
    const archivo = archivos[i];
    
    // Validar tipo de archivo
    if (!archivo.type.startsWith('image/')) {
      throw new Error(`El archivo ${archivo.name} no es una imagen válida`);
    }
    
    // Validar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      throw new Error(`El archivo ${archivo.name} es demasiado grande (máximo 5MB)`);
    }
    
    const url = await subirImagenProducto(productoId, archivo, i);
    urls.push(url);
  }
  
  return urls;
}

export async function eliminarImagenProducto(url: string): Promise<void> {
  try {
    // Crear referencia desde la URL
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    // No lanzar error para evitar interrumpir otras operaciones
  }
}

export async function eliminarImagenesProducto(urls: string[]): Promise<void> {
  const promesas = urls.map(url => eliminarImagenProducto(url));
  await Promise.allSettled(promesas);
}

// Función helper para redimensionar imágenes (opcional)
export function redimensionarImagen(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a blob
      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(newFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
} 