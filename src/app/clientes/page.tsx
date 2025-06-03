"use client";

import { useState, useEffect } from "react";
import { clientesDB, Cliente } from "@/lib/firebase/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = clientesDB.suscribir((clientes) => {
      setClientes(clientes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.telefono.includes(busqueda) ||
      cliente.direccion.toLowerCase().includes(busqueda.toLowerCase()) ||
      (cliente.cedula && cliente.cedula === busqueda)
  );

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return;
    try {
      await clientesDB.eliminar(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el cliente"
      );
    }
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='60vh'
      >
        <CircularProgress color='primary' />
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth='md' mx='auto'>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        mb={3}
      >
        <Box>
          <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 2 }}>
            Clientes
          </h1>
          <p style={{ color: "#555", fontSize: 15 }}>
            Lista de todos los clientes registrados en el sistema
          </p>
        </Box>
        <Button
          variant='contained'
          color='primary'
          component={Link}
          href='/clientes/nuevo'
          sx={{ minWidth: 150 }}
        >
          Nuevo Cliente
        </Button>
      </Box>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box mb={3}>
        <TextField
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder='Buscar por nombre, teléfono, dirección o cédula...'
          fullWidth
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
            ),
          }}
        />
      </Box>
      <Box bgcolor='white' borderRadius={2} boxShadow={1}>
        <List>
          {clientesFiltrados.map((cliente) => (
            <ListItem
              key={cliente.id}
              divider
              secondaryAction={
                <Box display='flex' gap={1}>
                  <IconButton
                    edge='end'
                    color='primary'
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/clientes/${cliente.id}`);
                    }}
                    title='Editar'
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge='end'
                    color='error'
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEliminar(cliente.id);
                    }}
                    title='Eliminar'
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
              component={Link}
              href={`/prestamos/${cliente.id}`}
              sx={{
                "&:hover": { backgroundColor: "#f5f7ff" },
                borderRadius: 2,
                px: 2,
                py: 2.5,
                mb: 0.5,
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{ bgcolor: "#e0e7ff", color: "#6366f1", fontWeight: 700 }}
                >
                  {cliente.nombre[0]?.toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <span style={{ fontWeight: 600, fontSize: 17 }}>
                    {cliente.nombre}
                  </span>
                }
                secondary={
                  <>
                    <span style={{ color: "#555", fontSize: 15 }}>
                      {cliente.telefono}
                    </span>
                    <br />
                    <span style={{ color: "#888", fontSize: 14 }}>
                      {cliente.direccion}
                    </span>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
      {clientesFiltrados.length === 0 && (
        <Box textAlign='center' py={8}>
          <p style={{ color: "#888", fontSize: 15 }}>
            {busqueda
              ? "No se encontraron clientes que coincidan con la búsqueda"
              : "No hay clientes registrados"}
          </p>
        </Box>
      )}
    </Box>
  );
}
