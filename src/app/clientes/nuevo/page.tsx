"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { clientesDB } from "@/lib/firebase/database";
import { subirImagenCliente } from "@/lib/firebase/storage";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
    direccion: "",
  });
  const [fotoCedula, setFotoCedula] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!fotoCedula) {
      setError("La foto de la cédula es obligatoria");
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.focus();
      return;
    }

    try {
      const nuevoCliente = await clientesDB.crear({
        ...formData,
        createdAt: Date.now(),
      });
      const url = await subirImagenCliente(nuevoCliente.id, fotoCedula);
      await clientesDB.actualizar(nuevoCliente.id, { fotoCedulaUrl: url });
      router.push("/clientes");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear el cliente"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFotoCedula(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <Box maxWidth='sm' mx='auto' p={4}>
      <h1 className='text-2xl font-bold mb-6'>Nuevo Cliente</h1>
      {error && (
        <Box mb={2} p={2} bgcolor='#fdecea' color='#b71c1c' borderRadius={2}>
          {error}
        </Box>
      )}
      <form onSubmit={handleSubmit} encType='multipart/form-data'>
        <Box display='flex' flexDirection='column' gap={2}>
          <TextField
            label='Nombre Completo'
            variant='outlined'
            required
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            fullWidth
          />
          <TextField
            label='Cédula de Identidad'
            variant='outlined'
            required
            inputProps={{
              pattern: "[0-9]{6,10}",
              title: "Solo números, mínimo 6 dígitos",
            }}
            value={formData.cedula}
            onChange={(e) =>
              setFormData({ ...formData, cedula: e.target.value })
            }
            fullWidth
          />
          <TextField
            label='Teléfono'
            variant='outlined'
            required
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            fullWidth
          />
          <TextField
            label='Dirección'
            variant='outlined'
            required
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            fullWidth
            multiline
            rows={2}
          />
          <Box>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Foto de la cédula de identidad{" "}
              <span className='text-red-600'>*</span>
            </label>
            <Box
              display='flex'
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems='flex-start'
              gap={2}
            >
              <Button
                variant='contained'
                component='label'
                color='primary'
                sx={{ minWidth: 150 }}
              >
                Seleccionar imagen
                <input
                  type='file'
                  id='fotoCedula'
                  accept='image/*'
                  required
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  hidden
                />
              </Button>
              {fotoCedula && (
                <span className='text-xs text-gray-700 mt-1'>
                  {fotoCedula.name}
                </span>
              )}
              {previewUrl && (
                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='center'
                  gap={1}
                >
                  <span className='block text-xs text-gray-500 mb-1'>
                    Vista previa:
                  </span>
                  <img
                    src={previewUrl}
                    alt='Preview cédula'
                    style={{
                      borderRadius: 8,
                      border: "1px solid #eee",
                      boxShadow: "0 2px 8px #0001",
                      maxWidth: 120,
                      maxHeight: 100,
                      objectFit: "contain",
                      background: "#fff",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Box display='flex' justifyContent='flex-end' gap={2} mt={2}>
            <Button
              type='button'
              variant='outlined'
              color='inherit'
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cliente"}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
