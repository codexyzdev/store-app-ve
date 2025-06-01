import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from './config';

const storage = getStorage(app);

export async function subirImagenCliente(clienteId: string, archivo: File): Promise<string> {
  const storageRef = ref(storage, `clientes/${clienteId}/cedula.jpg`);
  await uploadBytes(storageRef, archivo);
  const url = await getDownloadURL(storageRef);
  return url;
} 