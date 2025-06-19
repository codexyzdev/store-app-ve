import { useState, useRef } from "react";
import {
  subirImagenesProducto,
  eliminarImagenProducto,
  redimensionarImagen,
} from "@/lib/firebase/storage";

interface ImageUploaderProps {
  imagenes: string[];
  onImagenesChange: (imagenes: string[]) => void;
  productoId?: string;
  maxImagenes?: number;
}

export function ImageUploader({
  imagenes,
  onImagenesChange,
  productoId,
  maxImagenes = 5,
}: ImageUploaderProps) {
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Verificar que no exceda el límite
    if (imagenes.length + files.length > maxImagenes) {
      alert(`Solo puedes subir máximo ${maxImagenes} imágenes`);
      return;
    }

    setSubiendo(true);

    try {
      const nuevasImagenes: string[] = [];

      for (const file of files) {
        // Validar tipo de archivo
        if (!file.type.startsWith("image/")) {
          alert(`El archivo ${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande (máximo 5MB)`);
          continue;
        }

        try {
          // Redimensionar imagen para optimizar
          const archivoRedimensionado = await redimensionarImagen(file);

          if (productoId) {
            // Si tenemos un ID de producto, subir a Firebase Storage
            const url = await subirImagenesProducto(productoId, [
              archivoRedimensionado,
            ]);
            nuevasImagenes.push(...url);
          } else {
            // Si no tenemos ID, usar base64 temporal (para vista previa)
            const base64 = await convertToBase64(archivoRedimensionado);
            nuevasImagenes.push(base64);
          }
        } catch (error) {
          console.error(`Error al procesar ${file.name}:`, error);
          alert(`Error al procesar ${file.name}`);
        }
      }

      if (nuevasImagenes.length > 0) {
        onImagenesChange([...imagenes, ...nuevasImagenes]);
      }
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      alert("Error al procesar las imágenes");
    } finally {
      setSubiendo(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const eliminarImagen = async (index: number) => {
    const imagenUrl = imagenes[index];

    // Si la imagen está en Firebase Storage (no es base64), eliminarla
    if (imagenUrl.startsWith("https://") && imagenUrl.includes("firebase")) {
      try {
        await eliminarImagenProducto(imagenUrl);
      } catch (error) {
        console.error("Error al eliminar imagen de Firebase:", error);
      }
    }

    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    onImagenesChange(nuevasImagenes);
  };

  const moverImagen = (fromIndex: number, toIndex: number) => {
    const nuevasImagenes = [...imagenes];
    const [elemento] = nuevasImagenes.splice(fromIndex, 1);
    nuevasImagenes.splice(toIndex, 0, elemento);
    onImagenesChange(nuevasImagenes);
  };

  return (
    <div className='space-y-4'>
      {/* Botón para agregar imágenes */}
      <div className='flex items-center gap-4'>
        <button
          type='button'
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={subiendo || imagenes.length >= maxImagenes}
          className='inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {subiendo ? (
            <>
              <div className='w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin'></div>
              Subiendo...
            </>
          ) : (
            <>
              <span className='text-lg'>📸</span>
              Agregar Fotos
            </>
          )}
        </button>

        <span className='text-xs text-gray-500'>
          {imagenes.length}/{maxImagenes} imágenes
        </span>

       
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        multiple
        onChange={handleFileSelect}
        className='hidden'
      />

      {/* Preview de imágenes */}
      {imagenes.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {imagenes.map((imagen, index) => (
            <div
              key={index}
              className='relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow'
            >
              {/* Imagen */}
              <div className='aspect-square'>
                <img
                  src={imagen}
                  alt={`Producto ${index + 1}`}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    // Si la imagen no carga, mostrar placeholder
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dominant-baseline="middle">Sin imagen</text></svg>';
                  }}
                />
              </div>

              {/* Overlay con controles */}
              <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                {/* Mover hacia la izquierda */}
                {index > 0 && (
                  <button
                    type='button'
                    onClick={() => moverImagen(index, index - 1)}
                    className='w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors'
                    title='Mover hacia la izquierda'
                  >
                    ←
                  </button>
                )}

                {/* Eliminar */}
                <button
                  type='button'
                  onClick={() => eliminarImagen(index)}
                  className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors'
                  title='Eliminar imagen'
                >
                  ✕
                </button>

                {/* Mover hacia la derecha */}
                {index < imagenes.length - 1 && (
                  <button
                    type='button'
                    onClick={() => moverImagen(index, index + 1)}
                    className='w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors'
                    title='Mover hacia la derecha'
                  >
                    →
                  </button>
                )}
              </div>

              {/* Indicador de imagen principal */}
              {index === 0 && (
                <div className='absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-medium'>
                  Principal
                </div>
              )}

              {/* Indicador si es imagen temporal */}
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className='text-xs text-gray-500 space-y-1'>
        <p>• Formatos soportados: JPG, PNG, GIF, WebP</p>
        <p>• Tamaño máximo por imagen: 5MB</p>
        <p>• Las imágenes se optimizan automáticamente</p>
        <p>• La primera imagen será la imagen principal del producto</p>
        <p>• Puedes reordenar las imágenes con las flechas</p>
      </div>
    </div>
  );
}
