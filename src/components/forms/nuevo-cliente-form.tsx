"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Button from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Input from "@/components/ui/Input";
import { clientesDB } from "@/lib/firebase/database";
import { subirImagenCliente } from "@/lib/firebase/storage";
import { toast } from "sonner";

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  cedula: z.string().min(6, "La cédula debe tener al menos 6 caracteres"),
  telefono: z.string().min(7, "El teléfono debe tener al menos 7 caracteres"),
  direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
});

export function NuevoClienteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fotoCedula, setFotoCedula] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      cedula: "",
      telefono: "",
      direccion: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      if (!fotoCedula) {
        toast.error("La foto de la cédula es obligatoria");
        return;
      }

      const nuevoCliente = await clientesDB.crear({
        ...values,
        createdAt: Date.now(),
      });

      const url = await subirImagenCliente(nuevoCliente.id, fotoCedula);
      await clientesDB.actualizar(nuevoCliente.id, { fotoCedulaUrl: url });

      toast.success("Cliente creado exitosamente");
      router.push("/clientes");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear el cliente"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='nombre'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder='Nombre completo' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='cedula'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula</FormLabel>
              <FormControl>
                <Input placeholder='Número de cédula' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='telefono'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder='Número de teléfono' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='direccion'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder='Dirección completa' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-2'>
          <FormLabel>Foto de Cédula</FormLabel>
          <Input
            type='file'
            accept='image/*'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFotoCedula(file);
            }}
          />
        </div>

        <Button className='w-full' disabled={loading} {...{ type: "submit" }}>
          {loading ? "Guardando..." : "Guardar Cliente"}
        </Button>
      </form>
    </Form>
  );
}
