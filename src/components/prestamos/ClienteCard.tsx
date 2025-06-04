import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Stack,
} from "@mui/material";

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
  return (
    <Card sx={{ mb: 4, p: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 3,
          }}
        >
          <Avatar
            src={fotoCedulaUrl}
            alt='Foto de cédula'
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.light",
              color: "primary.main",
              fontSize: "2rem",
            }}
          >
            {!fotoCedulaUrl && nombre[0]?.toUpperCase()}
          </Avatar>

          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography
              variant='h5'
              component='div'
              color='primary.dark'
              sx={{ fontWeight: "bold", textTransform: "capitalize" }}
            >
              {nombre}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <Typography component='span' sx={{ mr: 1 }}>
                📞
              </Typography>
              <Typography component='span' sx={{ fontWeight: "medium", mr: 1 }}>
                Teléfono:
              </Typography>
              <Typography>{telefono}</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <Typography component='span' sx={{ mr: 1 }}>
                🏠
              </Typography>
              <Typography component='span' sx={{ fontWeight: "medium", mr: 1 }}>
                Dirección:
              </Typography>
              <Typography>{direccion}</Typography>
            </Box>

            {cedula && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
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
      </CardContent>
    </Card>
  );
};

export default ClienteCard;
