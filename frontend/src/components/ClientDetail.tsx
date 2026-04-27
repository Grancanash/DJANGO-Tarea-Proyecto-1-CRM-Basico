import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import type { Client, Interaction, Task, User } from '../types';
import toast from 'react-hot-toast';
import { 
    Phone, Mail, UserCheck, Briefcase, Calendar, 
    MessageSquare, PhoneCall, Users as UsersIcon, Clock, 
    Trash2
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const ClientDetail = ({ currentUser }: { currentUser: User | null }) => {
    const { id } = useParams();
    const [client, setClient] = useState<Client | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [newInteraction, setNewInteraction] = useState({ type: 'call', notes: '' });
    const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [taskDate, setTaskDate] = useState('');
    const [taskTime, setTaskTime] = useState('00:00'); 
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number, type: 'task' | 'interaction' } | null>(null);

    const openDeleteModal = (id: number, type: 'task' | 'interaction') => {
        setItemToDelete({ id, type });
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const { id: itemId, type } = itemToDelete;
            const endpoint = type === 'task' ? `/tasks/${itemId}/` : `/interactions/${itemId}/`;
            await api.delete(endpoint);
            
            if (type === 'task') {
                fetchTasks(); // Refrescamos tareas
                toast.success('Tarea eliminada');
            } else {
                setInteractions(interactions.filter(i => i.id !== itemId));
                toast.success('Interacción eliminada');
            }
        } catch (err) { toast.error('No se pudo eliminar'); }
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const startEditing = () => { setEditData(client); setIsEditing(true); };

    const handleSave = async () => {
        if (!editData) return;
        try {
            const res = await api.patch(`/clients/${id}/`, editData);
            setClient(res.data);
            setIsEditing(false);
            toast.success('Datos actualizados');
        } catch (err) {
            toast.error('Error al actualizar');
            console.error("Error al actualizar cliente", err);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await api.patch(`/clients/${id}/`, { status: newStatus });
            if (client) setClient({ ...client, status: newStatus as any });
        } catch (err) { console.error("Error al actualizar estado", err); }
    };

    const handleAddInteraction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/interactions/', { ...newInteraction, client: id, agent: currentUser?.id });
            setNewInteraction({ type: 'call', notes: '' });
            api.get(`/interactions/?client=${id}`).then(res => setInteractions(res.data.results));
            toast.success('Actividad registrada');
        } catch (err) {
            console.error("Error al registrar actividad", err);
            toast.error('Error al registrar actividad');
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const combinedDateTime = `${taskDate}T${taskTime}:00`;
            await api.post('/tasks/', {
                client: id,
                assigned_to: currentUser?.id,
                description: newTask,
                due_date: combinedDateTime,
                is_completed: false
            });
            setNewTask('');
            setTaskDate('');
            setTaskTime('00:00');
            fetchTasks(); // Refrescamos todo
            toast.success('Tarea añadida');
        } catch (err) { toast.error('Error al crear tarea'); }
    };

    const toggleTask = async (task: Task) => {
        try {
            await api.patch(`/tasks/${task.id}/`, { is_completed: !task.is_completed });
            fetchTasks(); // Refrescamos todo para que la tarea "salte" de lista
            toast.success(task.is_completed ? 'Tarea devuelta a pendientes' : '¡Tarea completada!');
        } catch (err) { toast.error('Error al actualizar tarea'); }
    };

    const fetchTasks = () => {
        // Pedimos las pendientes del cliente actual
        api.get(`/tasks/?client=${id}&is_completed=false&ordering=due_date`)
            .then(res => setPendingTasks(res.data.results));

        // Pedimos las completadas del cliente actual (las 5 más recientes para no saturar)
        api.get(`/tasks/?client=${id}&is_completed=true&ordering=-due_date`)
            .then(res => setCompletedTasks(res.data.results.slice(0, 10)));
    };

    useEffect(() => {
        api.get(`/clients/${id}/`).then(res => setClient(res.data));
        api.get(`/interactions/?client=${id}`).then(res => setInteractions(res.data.results));
        fetchTasks(); 
    }, [id]);

    if (!client) return <div className="p-8 text-center">Cargando ficha...</div>;

    return (
        <div className="p-8 w-full">
            <div className="text-sm breadcrumbs mb-6">
                <ul>
                    <li><Link to="/clients" className="text-primary">Clientes</Link></li>
                    <li className="font-bold text-gray-500">Ficha de {client.first_name} {client.last_name}</li>
                </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                
                {/* COLUMNA IZQUIERDA */}
                <div className="flex flex-col gap-6">
                    
                    {/* INFO PERSONAL */}
                    <div className="card bg-base-100 shadow-xl border border-base-200">
                        <div className="card-body">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 space-y-2">
                                    {isEditing ? (
                                        <>
                                            <input 
                                                className="input input-bordered input-sm w-full bg-gray-100 font-bold" 
                                                value={editData?.first_name} 
                                                onChange={e => setEditData({...editData!, first_name: e.target.value})} 
                                                placeholder="Nombre" 
                                            />
                                            <input 
                                                className="input input-bordered input-sm w-full bg-gray-100 font-bold" 
                                                value={editData?.last_name} 
                                                onChange={e => setEditData({...editData!, last_name: e.target.value})} 
                                                placeholder="Apellidos" 
                                            />
                                        </>
                                    ) : (
                                        <h2 className="card-title text-2xl tracking-tighter">
                                            {client.first_name} {client.last_name}
                                        </h2>
                                    )}
                                </div>
                                <button 
                                    onClick={isEditing ? handleSave : startEditing} 
                                    className={`btn btn-sm ml-2 ${isEditing ? 'btn-success text-white' : 'btn-ghost'}`}
                                >
                                    {isEditing ? 'Guardar' : 'Editar'}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                {client.status === 'prospect' && <span className="badge badge-ghost uppercase text-[10px] font-bold">Prospecto</span>}
                                {client.status === 'opportunity' && <span className="badge badge-info uppercase text-[10px] font-bold text-white">Oportunidad</span>}
                                {client.status === 'client' && <span className="badge badge-success uppercase text-[10px] font-bold text-white">Cliente</span>}
                                
                                <select 
                                    className="select select-bordered select-sm ml-auto" 
                                    value={client.status} 
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                >
                                    <option value="prospect">Prospecto</option>
                                    <option value="opportunity">Oportunidad</option>
                                    <option value="client">Cliente</option>
                                </select>
                            </div>

                            <div className="divider text-xs uppercase text-gray-400">Contacto</div>
                            
                            <div className="space-y-4 mb-4">
                                <div className="flex flex-col gap-1">
                                    <strong className="text-[10px] uppercase text-gray-400 flex items-center gap-1">
                                        <Mail size={12}/> Email
                                    </strong>
                                    {isEditing ? (
                                        <input 
                                            className="input input-bordered input-sm w-full bg-gray-50" 
                                            value={editData?.email} 
                                            onChange={e => setEditData({...editData!, email: e.target.value})} 
                                        />
                                    ) : (
                                        <span className="text-sm font-medium">{client.email}</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <strong className="text-[10px] uppercase text-gray-400 flex items-center gap-1">
                                        <Phone size={12} /> Teléfono
                                    </strong>
                                    {isEditing ? (
                                        <input 
                                            className="input input-bordered input-sm w-full bg-gray-50" 
                                            value={editData?.phone || ''} 
                                            onChange={e => setEditData({...editData!, phone: e.target.value})} 
                                        />
                                    ) : (
                                        <span className="text-sm font-medium">{client.phone || 'No asignado'}</span>
                                    )}
                                </div>
                            </div>

                            <div className="divider text-xs uppercase text-gray-400">Empresa</div>
                            <div className="flex flex-col gap-1 mb-2">
                                <p className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Briefcase size={16} />
                                    {client.company_name || 'Sin empresa'}
                                </p>
                                <p className="text-xs text-gray-500 italic ml-6">
                                    {client.company_industry || 'Sector no definido'}
                                </p>
                            </div>
                            {client.company_website && (
                                <a href={client.company_website} target="_blank" className="btn btn-outline btn-sm btn-primary mt-2 ml-6">
                                    Visitar Web
                                </a>
                            )}

                            <div className="divider text-xs uppercase text-gray-400">Responsable</div>
                            <p className="flex flex-col gap-1">
                                <strong className="text-[10px] uppercase text-gray-400 flex items-center gap-1">
                                    <UserCheck size={12} /> Agente asignado
                                </strong>
                                <span className="text-sm font-medium text-secondary ml-4">
                                    {client.assigned_to_name || 'Sin asignar'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* TAREAS */}
                    <div className="card bg-base-100 shadow-xl border border-base-200">
                        <div className="card-body">
                            <div className="divider text-xs uppercase text-gray-400 mt-0">Nueva Tarea</div>
                            
                            <form onSubmit={handleAddTask} className="flex flex-col gap-2 mb-6 bg-base-200 p-3 rounded-lg">
                                <input 
                                    type="text" placeholder="¿Qué hay que hacer?" 
                                    className="input input-bordered input-sm w-full" 
                                    value={newTask} onChange={e => setNewTask(e.target.value)} 
                                    required 
                                />
                                <div className="flex gap-2">
                                    <input 
                                        type="date" 
                                        className="input input-bordered input-sm flex-1 text-xs" 
                                        value={taskDate} 
                                        onChange={e => setTaskDate(e.target.value)} 
                                        required 
                                    />
                                    <input 
                                        type="time" 
                                        className="input input-bordered input-sm w-24 text-xs" 
                                        value={taskTime} 
                                        onChange={e => setTaskTime(e.target.value)} 
                                    />
                                    <button type="submit" className="btn btn-primary btn-sm px-6">Añadir</button>
                                </div>
                            </form>

                            {/* LISTA DE PENDIENTES */}
                            <div className="divider text-xs uppercase text-gray-400 mt-0">Tareas Pendientes</div>
                            <div className="space-y-3 mb-6">
                                {pendingTasks.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic text-center py-2">No hay tareas pendientes.</p>
                                ) : (
                                    pendingTasks.map(t => (
                                        <div key={t.id} className="flex items-start gap-3 text-sm p-2 hover:bg-base-200 rounded-lg transition-colors group">
                                            <input 
                                                type="checkbox" 
                                                checked={t.is_completed} 
                                                onChange={() => toggleTask(t)} 
                                                className="checkbox checkbox-sm checkbox-primary mt-1" 
                                            />
                                            <div className="flex flex-col flex-1">
                                                <span className="font-medium">{t.description}</span>
                                                <span className={`text-[10px] font-mono ${new Date(t.due_date) < new Date() ? 'text-error font-bold' : 'text-gray-400'}`}>
                                                    {new Date(t.due_date).toLocaleString()}
                                                    {new Date(t.due_date) < new Date() && <span className="ml-1 uppercase">[Vencida]</span>}
                                                </span>
                                            </div>
                                            <button onClick={() => openDeleteModal(t.id!, 'task')} className="btn btn-ghost btn-sm text-error opacity-0 group-hover:opacity-100">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* LISTA DE COMPLETADAS (Solo se muestra si hay alguna) */}
                            {completedTasks.length > 0 && (
                                <>
                                    <div className="divider text-xs uppercase text-gray-400 mt-0">Realizadas recientemente</div>
                                    <div className="space-y-2 opacity-60">
                                        {completedTasks.map(t => (
                                            <div key={t.id} className="flex items-start gap-3 text-xs p-2 hover:bg-base-200 rounded-lg group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={t.is_completed} 
                                                    onChange={() => toggleTask(t)} 
                                                    className="checkbox checkbox-sm checkbox-success mt-0.5" 
                                                />
                                                <div className="flex flex-col flex-1">
                                                    <span className="line-through text-gray-500">{t.description}</span>
                                                    <span className="text-[9px] text-gray-400 font-mono italic">Finalizada el {new Date(t.due_date).toLocaleDateString()}</span>
                                                </div>
                                                <button onClick={() => openDeleteModal(t.id!, 'task')} className="btn btn-ghost btn-sm text-error opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: HISTORIAL  */}
                <div className="md:col-span-2">
                    <div className="card bg-base-100 shadow-xl border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xl font-bold mb-6 text-secondary flex items-center gap-2">
                                <Clock className="text-gray-400" size={20} />
                                Historial de Actividad
                            </h3>
                            
                            <form onSubmit={handleAddInteraction} className="bg-base-200 p-4 rounded-xl mb-8 border border-base-300">
                                <div className="flex gap-2 mb-3">
                                    <select 
                                        className="select select-bordered select-sm font-bold" 
                                        value={newInteraction.type} 
                                        onChange={e => setNewInteraction({...newInteraction, type: e.target.value})}
                                    >
                                        <option value="call">📞 LLAMADA</option>
                                        <option value="email">📧 EMAIL</option>
                                        <option value="meeting">🤝 REUNIÓN</option>
                                    </select>
                                    <button type="submit" className="btn btn-primary btn-sm ml-auto">
                                        Registrar actividad
                                    </button>
                                </div>
                                <textarea 
                                    className="textarea textarea-bordered w-full h-24" 
                                    placeholder="Escribe aquí las notas de la interacción..." 
                                    value={newInteraction.notes} 
                                    onChange={e => setNewInteraction({...newInteraction, notes: e.target.value})} 
                                    required 
                                />
                            </form>

                            <div className="space-y-4">
                                {interactions.length === 0 ? (
                                    <div className="text-center py-12 bg-base-200 rounded-xl border-2 border-dashed border-base-300 text-gray-400">
                                        No hay interacciones registradas aún.
                                    </div>
                                ) : (
                                    interactions.map(i => (
                                        <div key={i.id} className="collapse collapse-arrow bg-base-100 border border-base-200 shadow-sm hover:border-primary/30 transition-colors">
                                            <input type="radio" name="activity-accordion" /> 
                                            <div className="collapse-title flex justify-between items-center pr-12">
                                                <div className="flex items-center gap-4">
                                                    {/* Icono dinámico según el tipo */}
                                                    <div className={`p-2 rounded-lg ${
                                                        i.type === 'call' ? 'bg-blue-100 text-blue-600' : 
                                                        i.type === 'email' ? 'bg-amber-100 text-amber-600' : 
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                        {i.type === 'call' && <PhoneCall size={16} />}
                                                        {i.type === 'email' && <Mail size={16} />}
                                                        {i.type === 'meeting' && <UsersIcon size={16} />}
                                                    </div>
                                                    
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black uppercase tracking-widest opacity-70">
                                                            {i.type === 'call' ? 'Llamada realizada' : i.type === 'email' ? 'Correo enviado' : 'Reunión mantenida'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-mono">
                                                            {new Date(i.created_at!).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="collapse-content bg-gray-50/50"> 
                                                <div className="pt-4 pb-2 px-2">
                                                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                                        {i.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title={`Eliminar ${itemToDelete?.type === 'task' ? 'Tarea' : 'Interacción'}`}
                message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default ClientDetail;