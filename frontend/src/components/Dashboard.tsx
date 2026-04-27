import { useEffect, useState } from 'react';
import api, { cleanPaginationUrl } from '../api';
import { Task } from '../types';
 import { Link } from 'react-router-dom';
 import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend 
} from 'recharts';
import toast from 'react-hot-toast';
import { 
    Users as UsersIcon, 
    UserPlus, 
    Target, 
    Trophy,
    LayoutDashboard,
    Clock,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';

interface Stats {
    total: number;
    prospects: number;
    opportunities: number;
    clients: number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [pendingNext, setPendingNext] = useState<string | null>(null);
    const [pendingPrev, setPendingPrev] = useState<string | null>(null);
    const [pendingCount, setPendingCount] = useState(0);

    const toggleTask = async (task: Task) => {
        try {
            // Enviamos el cambio al servidor
            await api.patch(`/tasks/${task.id}/`, { is_completed: !task.is_completed });
            
            // Refrescamos ambas listas desde el Backend para asegurar la "verdad absoluta"
            fetchPendingTasks();
            fetchCompletedTasks();
            
            // También refrescamos estadísticas por si cambió el contador (opcional)
            api.get('/clients/stats/').then(res => setStats(res.data));

            // Notificación dinámica según si marcas o desmarcas
            if (!task.is_completed) {
                toast.success('¡Tarea completada!');
            } else {
                toast.success('Tarea devuelta a pendientes');
            }
        } catch (err) {
            console.error("Error al actualizar tarea", err);
        }
    };

    const fetchPendingTasks = (paginationUrl?: string) => {
        const cleanUrl = cleanPaginationUrl(paginationUrl || null);
        const url = cleanUrl || `/tasks/?is_completed=false&ordering=due_date`;
        
        api.get(url).then(res => {
            setTasks(res.data.results);
            setPendingNext(res.data.next);
            setPendingPrev(res.data.previous);
            setPendingCount(res.data.count);
        });
    };

    const fetchCompletedTasks = () => {
        api.get('/tasks/?is_completed=true&ordering=-due_date').then(res => {
            setCompletedTasks(res.data.results);
        });
    };

    useEffect(() => {
        // Cargamos estadísticas
        api.get('/clients/stats/').then(res => setStats(res.data));

        // Cargamos todas las tareas del usuario (el backend ya las filtra)
        // Tareas pendientes
        fetchPendingTasks();
        // tareas copmpletadas
        fetchCompletedTasks();
    }, []);

    if (!stats) return <div className="p-8 text-center">Cargando estadísticas...</div>;

    const chartData = [
        { name: 'Prospectos', value: stats.prospects, fill: '#9CA3AF' },    // Gris (ghost)
        { name: 'Oportunidades', value: stats.opportunities, fill: '#0EA5E9' }, // Azul (info)
        { name: 'Clientes', value: stats.clients, fill: '#22C55E' },      // Verde (success)
    ];

    return (
        <div className="p-8 w-full">
            <h1 className="mb-8">Panel de Control</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* COLUMNA IZQUIERDA: LISTAS DE TAREAS (2/3 del espacio) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* TAREAS PENDIENTES */}
                    <div className="card bg-base-100 shadow-xl border border-base-200">
                        <div className="card-body">
                            <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-primary opacity-50" />
                                Próximas Tareas Pendientes
                            </h3>
                            
                            {tasks.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No tienes tareas pendientes. ¡Buen trabajo!</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table table-sm w-full">
                                        <thead>
                                            <tr>
                                                <th className="w-10"></th>
                                                <th>Tarea</th>
                                                <th>Cliente</th>
                                                <th>Empresa</th>
                                                <th className="w-62.5">Fecha Límite</th>
                                                <th className="text-right w-12.5">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {tasks.map(t => (
                                            <tr key={t.id} className="hover">
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        className="checkbox checkbox-sm checkbox-primary" 
                                                        checked={t.is_completed}
                                                        onChange={() => toggleTask(t)}
                                                    />
                                                </td>
                                                <td className="font-medium">{t.description}</td>
                                                <td className="text-primary font-bold text-xs uppercase">{t.client_name}</td>
                                                {/* Celda de la Empresa */}
                                                <td className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                                    {t.company_name || '---'}
                                                </td>
                                                <td className={`text-xs font-mono ${new Date(t.due_date) < new Date() ? 'text-error font-bold' : 'text-gray-500'}`}>
                                                    {new Date(t.due_date).toLocaleString()}
                                                    {new Date(t.due_date) < new Date() && (
                                                        <span className="ml-2 badge badge-error badge-sm text-white italic px-2">
                                                            Vencida
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    <Link to={`/clients/${t.client}`} className="btn btn-primary btn-sm gap-2">
                                                        <ExternalLink size={14} />
                                                        Ficha
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-6">
                                <span className="text-xs text-gray-500 uppercase font-bold">Total: {pendingCount}</span>
                                <div className="join">
                                    <button className="join-item btn btn-sm" onClick={() => pendingPrev && fetchPendingTasks(pendingPrev)} disabled={!pendingPrev}>« Anterior</button>
                                    <button className="join-item btn btn-sm" onClick={() => pendingNext && fetchPendingTasks(pendingNext)} disabled={!pendingNext}> Siguiente »</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TAREAS COMPLETADAS */}
                    <div className="card bg-base-100 shadow-xl border border-base-200 opacity-80">
                        <div className="card-body">
                            <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <CheckCircle2 size={20} className="text-success opacity-50" />
                                Últimas Tareas Completadas
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="table table-sm w-full">
                                    <thead>
                                        <tr>
                                            <th className="w-10"></th>
                                            <th>Tarea</th>
                                            <th>Cliente</th>
                                            <th>Empresa</th>
                                            <th>Finalizada</th>
                                            <th className="text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedTasks.map(t => (
                                            <tr key={t.id} className="hover">
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        className="checkbox checkbox-sm checkbox-success" 
                                                        checked={t.is_completed} 
                                                        onChange={() => toggleTask(t)} 
                                                    />
                                                </td>
                                                <td className="line-through text-gray-400">{t.description}</td>
                                                <td className="text-xs uppercase font-bold text-gray-400">{t.client_name}</td>
                                                {/* Celda de la Empresa en modo completado */}
                                                <td className="text-[10px] uppercase font-bold text-gray-300 tracking-widest">
                                                    {t.company_name || '---'}
                                                </td>
                                                <td className="text-xs font-mono text-gray-400">
                                                    {new Date(t.due_date).toLocaleString()}
                                                </td>
                                                <td className="text-right">
                                                    <Link to={`/clients/${t.client}`} className="btn btn-ghost btn-sm gap-2">
                                                        <ExternalLink size={14} />
                                                        Ver
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: ESTADÍSTICAS Y GRÁFICOS (1/3 del espacio) */}
                <div className="space-y-8">
                    
                    {/* TARJETA DE ESTADÍSTICAS VERTICAL */}
                    <div className="stats stats-vertical shadow w-full bg-base-100 border border-base-200">
                        <div className="stat">
                            <div className="stat-figure text-primary opacity-30">
                                <UsersIcon size={32} />
                            </div>
                            <div className="stat-title text-xs uppercase font-bold tracking-widest">Total Clientes</div>
                            <div className="stat-value text-primary text-3xl">{stats.total}</div>
                            <div className="stat-desc text-[10px]">Cartera completa</div>
                        </div>
                        
                        <div className="stat">
                            <div className="stat-figure text-gray-400 opacity-30">
                                <UserPlus size={32} />
                            </div>
                            <div className="stat-title text-xs uppercase font-bold tracking-widest">Prospectos</div>
                            <div className="stat-value text-2xl">{stats.prospects}</div>
                            <div className="stat-desc text-[10px]">Fase inicial</div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-info opacity-30">
                                <Target size={32} />
                            </div>
                            <div className="stat-title text-xs uppercase font-bold tracking-widest">Oportunidades</div>
                            <div className="stat-value text-info text-2xl">{stats.opportunities}</div>
                            <div className="stat-desc text-[10px]">En negociación</div>
                        </div>
                        
                        <div className="stat">
                            <div className="stat-figure text-success opacity-30">
                                <Trophy size={32} />
                            </div>
                            <div className="stat-title text-xs uppercase font-bold tracking-widest">Ventas Cerradas</div>
                            <div className="stat-value text-success text-3xl">{stats.clients}</div>
                            <div className="stat-desc text-[10px]">Clientes activos</div>
                        </div>
                    </div>

                    {/* GRÁFICO DE DISTRIBUCIÓN DE CLIENTES */}
                    <div className="card bg-base-100 shadow-xl border border-base-200 p-4 h-80">
                        <h3 className="text-center text-xs uppercase tracking-widest text-gray-400 mb-2">Distribución de Cartera</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;