import { useEffect, useState } from 'react';
import api, { cleanPaginationUrl } from '../api';
import { Client } from '../types';
import ClientForm from './ClientForm';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download, ExternalLink, SearchX, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const ClientList = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [search, setSearch] = useState('');
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [prevPage, setPrevPage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<number | null>(null);
    const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        // Limpiamos el temporizador si el usuario sigue escribiendo
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Creamos un nuevo temporizador
        const timeout = setTimeout(() => {
            fetchClients(undefined, value);
        }, 400);

        setTypingTimeout(timeout);
    };

    const fetchClients = (paginationUrl?: string, searchTerm: string = search) => {
        // Si la URL viene de Django como "http://dominio.com/api/ruta", 
        // la convertimos en "/ruta" para que sea relativa y use HTTPS
        const cleanUrl = cleanPaginationUrl(paginationUrl || null);

        const url = cleanUrl || `/clients/?search=${searchTerm}`;

        api.get(url)
            .then(response => {
                setClients(response.data.results);
                setNextPage(response.data.next);
                setPrevPage(response.data.previous);
                setCount(response.data.count);
            })
            .catch(error => console.error('Error fetching clients:', error));
    };

    const openDeleteModal = (id: number) => {
        setClientToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (clientToDelete) {
            try {
                await api.delete(`/clients/${clientToDelete}/`);
                fetchClients();
                toast.success('Cliente eliminado');
            } catch (err) {
                toast.error('No se pudo eliminar');
            }
        }
        setIsModalOpen(false);
    };

    const handleExportCSV = async () => {
        try {
            // Pedimos el archivo como un 'blob' (objeto binario)
            const response = await api.get('/clients/export_csv/', {
                responseType: 'blob',
            });

            // Creamos una URL temporal para el archivo recibido
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Forzamos la descarga con un nombre de archivo
            link.setAttribute('download', 'clientes_export.csv');
            document.body.appendChild(link);
            link.click();
            
            // Limpiamos el rastro
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Archivo descargado');
        } catch (err) {
            toast.error('No se pudo exportar el archivo');
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <div className="p-8 w-full">
            <h2 className="text-3xl font-bold mb-8 tracking-tighter">Gestión de Clientes</h2>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
            
                {/* COLUMNA IZQUIERDA: FORMULARIO */}
                <div className="w-full lg:w-1/3">
                    {/* Cabecera izquierda alineada */}
                    <div className="h-10 flex items-center mb-4">
                        <h3 className="text-lg font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
                            Nuevo Cliente
                        </h3>
                    </div>

                    <ClientForm onClientAdded={fetchClients} />
                </div>

                {/* COLUMNA DERECHA: LISTADO */}
                <div className="w-full lg:flex-1">
                    <div className="h-10 flex justify-between items-center mb-4 gap-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">Listado</h3>
                            <button 
                                onClick={handleExportCSV}
                                className="btn btn-outline btn-sm gap-2"
                                title="Descargar listado en CSV"
                            >
                                <Download size={16} />
                                Exportar CSV
                            </button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre, email o empresa..." 
                            className="input input-bordered input-sm w-full max-w-xs pl-10"
                            value={search}
                            onChange={handleSearchChange} // Mucho más limpio así
                        />
                    </div>

                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-base-200">
                        <table className="table w-full">
                            <thead className="bg-base-100">
                                <tr>
                                    <th>Nombre</th>
                                    <th>Empresa</th>
                                    <th>Email</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex justify-center items-center gap-2 text-gray-400">
                                            <SearchX size={48} className="opacity-20" />
                                            <p className="text-sm font-medium">No se han encontrado resultados para tu búsqueda</p>
                                        </div>
                                    </td>
                                </tr>
                                ) : (clients.map(client => (
                                <tr key={client.id} className="hover">
                                    <td className="font-medium text-primary">
                                        <Link to={`/clients/${client.id}`}>
                                            {client.first_name} {client.last_name}
                                        </Link>
                                    </td>
                                    <td className="text-sm font-semibold text-gray-500 uppercase tracking-tighter">
                                        {client.company_name || '---'}
                                    </td>
                                    <td className="text-gray-600">{client.email}</td>
                                    <td className="text-center">
                                        {client.status === 'prospect' && <span className="badge badge-ghost uppercase text-[10px] font-bold">Prospecto</span>}
                                        {client.status === 'opportunity' && <span className="badge badge-info uppercase text-[10px] font-bold text-white">Oportunidad</span>}
                                        {client.status === 'client' && <span className="badge badge-success uppercase text-[10px] font-bold text-white">Cliente</span>}
                                    </td>
                                    <td className="text-right py-1">
                                        <div className="flex gap-2 justify-end">
                                            {/* Icono para ir a la ficha detallada */}
                                            <Link 
                                                to={`/clients/${client.id}`} 
                                                className="btn btn-ghost btn-sm text-info hover:bg-info hover:text-white"
                                                title="Ver detalles"
                                            >
                                                <ExternalLink size={16} />
                                            </Link>
                                            
                                            {/* Icono de eliminar que ya tenías */}
                                            <button 
                                                onClick={() => openDeleteModal(client.id!)}
                                                className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-white"
                                                title="Eliminar cliente"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-500 uppercase font-bold">
                            Total: {count} clientes
                        </span>
                        <div className="join">
                            <button 
                                className="join-item btn btn-sm" 
                                onClick={() => prevPage && fetchClients(prevPage)}
                                disabled={!prevPage}
                            >« Anterior</button>
                            <button 
                                className="join-item btn btn-sm" 
                                onClick={() => nextPage && fetchClients(nextPage)}
                                disabled={!nextPage}
                            >Siguiente »</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <ConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar eliminación"
                message="¿Realmente deseas eliminar este cliente? Se borrarán también sus tareas e historial de forma permanente."
            />
        </div>
    );
};

export default ClientList;