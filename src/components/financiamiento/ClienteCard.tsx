import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { esEnlaceGoogleMaps, extraerCoordenadas } from "@/utils/maps";
import Minimapa from "@/components/maps/Minimapa";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export interface ClienteCardProps {
  nombre: string;
  telefono: string;
  direccion: string;
  cedula?: string;
  fotoCedulaUrl?: string;
}

const ClienteCard: React.FC<ClienteCardProps> = ({
  nombre,
  telefono,
  direccion,
  cedula,
  fotoCedulaUrl,
}) => {
  const esEnlaceMaps = esEnlaceGoogleMaps(direccion);
  const coordenadas = esEnlaceMaps ? extraerCoordenadas(direccion) : null;

  const abrirEnGoogleMaps = () => {
    if (esEnlaceMaps) {
      window.open(direccion, "_blank");
    }
  };

  // Función para acortar texto largo
  const acortarTexto = (texto: string, maxLength: number = 50) => {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + "...";
  };

  return (
    <Card sx={{ mb: 4, p: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "center", lg: "flex-start" },
            gap: 4,
          }}
        >
          {/* Sección izquierda - Información del cliente */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 3,
              flex: 1,
              width: { xs: "100%", lg: "auto" },
              minWidth: 0, // Permite que el contenedor se contraiga
            }}
          >
            <Avatar
              src={fotoCedulaUrl}
              alt='Foto de cédula'
              sx={{
                width: { xs: 80, md: 100 },
                height: { xs: 80, md: 100 },
                bgcolor: "primary.light",
                color: "primary.main",
                fontSize: "2rem",
                flexShrink: 0,
              }}
            >
              {!fotoCedulaUrl && nombre[0]?.toUpperCase()}
            </Avatar>

            <Stack spacing={2} sx={{ flex: 1, width: "100%", minWidth: 0 }}>
              <Typography
                variant='h5'
                component='div'
                color='primary.dark'
                sx={{
                  fontWeight: "bold",
                  textTransform: "capitalize",
                  textAlign: { xs: "center", md: "left" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {nombre}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
                  justifyContent: { xs: "center", md: "flex-start" },
                  gap: 1,
                }}
              >
                <Typography component='span' sx={{ flexShrink: 0 }}>
                  📞
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontWeight: "medium", flexShrink: 0 }}
                >
                  Teléfono:
                </Typography>
                <Typography
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {telefono}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
                  justifyContent: { xs: "center", md: "flex-start" },
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Typography component='span' sx={{ flexShrink: 0 }}>
                  🏠
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontWeight: "medium", flexShrink: 0 }}
                >
                  Dirección:
                </Typography>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  {esEnlaceMaps ? (
                    <button
                      onClick={abrirEnGoogleMaps}
                      className='flex items-center gap-1 text-blue-600 hover:text-blue-700 underline transition-colors max-w-full'
                      title={direccion}
                    >
                      <span className='truncate'>
                        {acortarTexto("Ver ubicación en Google Maps", 25)}
                      </span>
                      <ArrowTopRightOnSquareIcon className='w-4 h-4 flex-shrink-0' />
                    </button>
                  ) : (
                    <Typography
                      sx={{
                        wordBreak: "break-word",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                      title={direccion}
                    >
                      {direccion}
                    </Typography>
                  )}
                </Box>
              </Box>

              {cedula && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "text.secondary",
                    justifyContent: { xs: "center", md: "flex-start" },
                    gap: 1,
                  }}
                >
                  <Typography component='span' sx={{ flexShrink: 0 }}>
                    🪪
                  </Typography>
                  <Typography
                    component='span'
                    sx={{ fontWeight: "medium", flexShrink: 0 }}
                  >
                    Cédula:
                  </Typography>
                  <Typography
                    sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {cedula}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Sección derecha - Minimapa (solo en desktop y si hay coordenadas) */}
          {coordenadas && (
            <Box
              sx={{
                display: { xs: "none", lg: "block" },
                width: "350px",
                height: "250px",
                flexShrink: 0,
              }}
            >
              <Minimapa
                coordenadas={coordenadas}
                direccionOriginal={direccion}
                className='w-full h-full'
              />
            </Box>
          )}
        </Box>

        {/* Minimapa para móvil (solo si hay coordenadas y está en móvil) */}
        {coordenadas && (
          <Box
            sx={{
              display: { xs: "block", lg: "none" },
              mt: 3,
              width: "100%",
              height: "200px",
            }}
          >
            <Minimapa
              coordenadas={coordenadas}
              direccionOriginal={direccion}
              className='w-full h-full'
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ClienteCard;
