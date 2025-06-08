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
              }}
            >
              {!fotoCedulaUrl && nombre[0]?.toUpperCase()}
            </Avatar>

            <Stack spacing={2} sx={{ flex: 1, width: "100%" }}>
              <Typography
                variant='h5'
                component='div'
                color='primary.dark'
                sx={{
                  fontWeight: "bold",
                  textTransform: "capitalize",
                  textAlign: { xs: "center", md: "left" },
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
                }}
              >
                <Typography component='span' sx={{ mr: 1 }}>
                  📞
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontWeight: "medium", mr: 1 }}
                >
                  Teléfono:
                </Typography>
                <Typography>{telefono}</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <Typography component='span' sx={{ mr: 1 }}>
                  🏠
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontWeight: "medium", mr: 1 }}
                >
                  Dirección:
                </Typography>
                {esEnlaceMaps ? (
                  <button
                    onClick={abrirEnGoogleMaps}
                    className='flex items-center gap-1 text-blue-600 hover:text-blue-700 underline transition-colors'
                  >
                    <span>Ver ubicación</span>
                    <ArrowTopRightOnSquareIcon className='w-4 h-4' />
                  </button>
                ) : (
                  <Typography sx={{ wordBreak: "break-word" }}>
                    {direccion}
                  </Typography>
                )}
              </Box>

              {cedula && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "text.secondary",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Typography component='span' sx={{ mr: 1 }}>
                    🪪
                  </Typography>
                  <Typography
                    component='span'
                    sx={{ fontWeight: "medium", mr: 1 }}
                  >
                    Cédula:
                  </Typography>
                  <Typography>{cedula}</Typography>
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
