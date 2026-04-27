import { useEffect, useState } from 'react';
import api, { cleanPaginationUrl } from '../api';
import type { Company } from '../types';
import toast from 'react-hot-toast';
import { Building2, Globe, Factory, Plus, Edit2, Search, Trash2, Pencil, SearchX } from 'lucide-react'; // Importar iconos
import ConfirmModal from './ConfirmModal';

const CompanyList = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [formData, setFormData] = useState({ name: '', website: '', industry: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<Company | null>(null);
    const [search, setSearch] = useState('');
    const [count, setCount] = useState(0); // Total de empresas
    const [nextPage, setNextPage] = useState<string | null>(null); // URL de la siguiente
    const [prevPage, setPrevPage] = useState<string | null>(null); // URL de la anterior
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
    const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    // Función para entrar en modo edición
    const startEditing = (company: Company) => {
        setEditingId(company.id!);
        setEditFormData(company);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        const timeout = setTimeout(() => {
            fetchCompanies(undefined, value);
        }, 400);

        setTypingTimeout(timeout);
    };

    
    // Función para agregar nueva empresa
    const handleAddCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/companies/', formData);
            setFormData({ name: '', website: '', industry: '' });
            fetchCompanies();
            toast.success('Empresa registrada correctamente');
        } catch (err) {
            console.error("Error al crear empresa", err);
            toast.error('Error al registrar la empresa');
        }
    };

    // Función para guardar los cambios de la empresa editada
    const handleUpdateCompany = async () => {
        if (!editFormData || !editingId) return;
        try {
            await api.patch(`/companies/${editingId}/`, editFormData);
            setEditingId(null);
            fetchCompanies();
            toast.success('Datos de la empresa actualizados');
        } catch (err) {
            console.error("Error al actualizar empresa", err);
            toast.error('No se pudieron guardar los cambios');
        }
    };

    const fetchCompanies = (paginationUrl?: string, searchTerm: string = search) => {
        // Si hay paginationUrl (de los botones), usamos esa.
        // Si no, construimos la ruta base con el buscador.
        const cleanUrl = cleanPaginationUrl(paginationUrl || null);
        const url = cleanUrl || `/companies/?search=${searchTerm}`;

        api.get(url).then(res => {
            setCompanies(res.data.results);
            setNextPage(res.data.next);
            setPrevPage(res.data.previous);
            setCount(res.data.count);
        }).catch(err => {
            console.error("Error al cargar empresas", err);
        });
    };

    const openDeleteModal = (id: number) => {
        setCompanyToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (companyToDelete) {
            try {
                await api.delete(`/companies/${companyToDelete}/`);
                fetchCompanies();
                toast.success('Empresa eliminada correctamente');
            } catch (err) {
                toast.error('No se pudo eliminar la empresa. Es posible que tenga clientes asociados.');
            }
        }
        setIsModalOpen(true); // Cambiar a false
        setIsModalOpen(false);
    };

    useEffect(() => { fetchCompanies(); }, []);

    return (
        <div className="p-8 w-full">
            <h2 className="text-3xl font-bold mb-8 tracking-tighter">Directorio de Empresas</h2>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* COLUMNA IZQUIERDA: FORMULARIO */}
                <div className="w-full lg:w-1/3">
                    {/* Cabecera izquierda alineada */}
                    <div className="h-10 flex items-center mb-4">
                        <h3 className="text-lg font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
                            <Plus size={18} /> Nueva Empresa
                        </h3>
                    </div>
                    
                    <form onSubmit={handleAddCompany} className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200 space-y-4">
                        <div className="relative flex items-center">
                            <input 
                                type="text" placeholder="Nombre" className="input input-bordered input-sm w-full pl-10"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
                            />
                            <Building2 className="absolute left-3 text-gray-400 z-10" size={16} />
                        </div>
                        <div className="relative flex items-center">
                            <input 
                                type="url" placeholder="Sitio Web" className="input input-bordered input-sm w-full pl-10"
                                value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                            />
                            <Globe className="absolute left-3 text-gray-400 z-10" size={16}/>
                        </div>
                        <div className="relative flex items-center">
                            <input 
                                type="text" placeholder="Industria" className="input input-bordered input-sm w-full pl-10"
                                value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                            />
                            <Factory className="absolute left-3 text-gray-400 z-10" size={16} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm w-full">Registrar Empresa</button>
                    </form>
                </div>

                {/* COLUMNA DERECHA: TABLA */}
                <div className="w-full lg:flex-1">
                    <div className="h-10 flex justify-between items-center mb-4 gap-4">
                        <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">
                            Registradas
                        </h3>
                        <div className="relative flex items-center w-full max-w-xs">
                            <input 
                                type="text" 
                                placeholder="Buscar empresa..." 
                                className="input input-bordered input-sm w-full pl-10"
                                value={search}
                                onChange={handleSearchChange}
                            />
                            <Search className="absolute left-3 text-gray-400 z-10" size={14} />
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-base-200">
                        <table className="table w-full">
                            <thead className="bg-base-100 text-gray-400">
                                <tr>
                                    <th className="w-1/3">Empresa</th>
                                    <th>Industria</th>
                                    <th>Sitio Web</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16">
                                        <div className="flex justify-center items-center gap-2 text-gray-400">
                                            <SearchX size={48} className="opacity-20" />
                                            <p className="text-sm font-medium">No existen empresas con ese criterio</p>
                                        </div>
                                    </td>
                                </tr>
                                ) : (
                                companies.map(c => (
                                    editingId === c.id ? (
                                        <tr key={c.id} className="bg-base-200">
                                            <td className='py-3'>
                                                <input className="input input-bordered input-sm w-full bg-gray-50 font-bold" value={editFormData?.name} onChange={e => setEditFormData({...editFormData!, name: e.target.value})} />
                                            </td>
                                            <td className='py-3'>
                                                <input className="input input-bordered input-sm w-full bg-gray-50" value={editFormData?.industry || ''} onChange={e => setEditFormData({...editFormData!, industry: e.target.value})} />
                                            </td>
                                            <td className='py-3'>
                                                <input className="input input-bordered input-sm w-full bg-gray-50" value={editFormData?.website || ''} onChange={e => setEditFormData({...editFormData!, website: e.target.value})} />
                                            </td>
                                            <td className="text-right py-3">
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={handleUpdateCompany} className="btn btn-success btn-sm text-white px-4">Guardar</button>
                                                    <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">Cancelar</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={c.id} className="hover text-sm">
                                            <td className="font-bold py-3">{c.name}</td>
                                            <td className="text-gray-500 italic py-3">{c.industry || '---'}</td>
                                            <td className='py-3'>
                                                {c.website ? (
                                                    <a href={c.website} target="_blank" className="link link-primary no-underline hover:underline text-xs">
                                                        {c.website.replace('https://', '').replace('http://', '')}
                                                    </a>
                                                ) : <span className="text-gray-300">---</span>}
                                            </td>
                                            <td className="text-right py-3">
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => startEditing(c)} className="btn btn-ghost btn-sm text-primary hover:bg-primary hover:text-white" title="Editar empresa">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button onClick={() => openDeleteModal(c.id!)} className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-white" title="Eliminar empresa">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total: {count} empresas</span>
                        <div className="join">
                            <button className="join-item btn btn-sm" onClick={() => prevPage && fetchCompanies(prevPage)} disabled={!prevPage}>« Anterior</button>
                            <button className="join-item btn btn-sm" onClick={() => nextPage && fetchCompanies(nextPage)} disabled={!nextPage}>Siguiente »</button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Empresa"
                message="¿Estás seguro? Esta acción borrará la empresa y todos sus clientes asociados permanentemente."
            />
        </div>
    );
};

export default CompanyList;