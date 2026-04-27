import { useState } from 'react';
import axios from 'axios';
import api from '../api'; 
import Logo from '../components/Logo';
import { 
    Database, 
    Layers, 
    Zap, 
    FileSpreadsheet, 
    ShieldCheck, 
    Search, 
    BarChart3, 
    Users,
    ChevronRight, 
    KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';

const Login = ({ onLogin }: { onLogin: (token: string) => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const copyToClipboard = async (text: string, type: string) => {
        try {
            // Intentar el método moderno primero
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                toast.success(`${type} copiado`);
            } else {
                // Fallback: El truco del área de texto para HTTP/IP
                const textArea = document.createElement("textarea");
                textArea.value = text;
                
                // Aseguramos que no se vea pero que sea seleccionable
                textArea.style.position = "absolute";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                
                textArea.select();
                const successful = document.execCommand('copy'); // Ignora el aviso de desuso, es necesario aquí
                document.body.removeChild(textArea);

                if (successful) {
                    toast.success(`${type} copiad${type==='Usuario' ? 'o' : 'a'} al portapapeles`);
                } else {
                    throw new Error();
                }
            }
        } catch (err) {
            toast.error('No se pudo copiar');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        const response = await api.post('/token/', {
            username,
            password,
        });
        onLogin(response.data.access);
        } catch (err) {
        setError('Credenciales incorrectas');
        }
    };

    return (
        <div className="flex h-screen">
            <div className="h-full flex-2 aspect-square bg-[url('/img/bascicrmbackground.jpg')] bg-cover bg-no-repeat bg-center"></div>
            <div className="flex-1 flex flex-col p-3 justify-center items-center gap-3">
                <div className="card border border-base-200 p-8 w-full shadow-sm">
                    <h1 className="mb-2 flex items-center gap-3">
                        <Zap className="text-primary" size={32} />
                        Proyecto 1: CRM Básico
                    </h1>
                    <h2 className="text-primary opacity-80 mb-10 flex items-center gap-2">
                        Desarrollo Backend-Django para <span className='font-black text-base-content'>ConquerBlocks</span>
                    </h2>
                    
                    <div className="space-y-8">
                        <div>
                            <h3 className="flex items-center gap-2">
                                <Database size={16} className="text-primary" />
                                Arquitectura de Modelos
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {['User', 'Company', 'Client', 'Interaction', 'Task'].map(m => (
                                    <span key={m} className="badge badge-outline badge-sm font-mono py-3 px-4 border-gray-300">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="flex items-center gap-2">
                                    <Layers size={16} className="text-primary" />
                                    Funcionalidades
                                </h3>
                                <ul className="text-xs space-y-2 mt-2 text-gray-500 font-medium">
                                    <li className="flex items-center gap-2"><ChevronRight size={10} /> CRUD Clientes</li>
                                    <li className="flex items-center gap-2"><ChevronRight size={10} /> Buscador Global</li>
                                    <li className="flex items-center gap-2"><ChevronRight size={10} /> Filtro por Agente</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="flex items-center gap-2">
                                    <BarChart3 size={16} className="text-primary" />
                                    Extras PRO
                                </h3>
                                <ul className="text-xs space-y-2 mt-2 text-gray-500 font-medium">
                                    <li className="flex items-center gap-2"><ChevronRight size={10} /> Panel Estadísticas</li>
                                    <li className="flex items-center gap-2"><ChevronRight size={10} /> Exportación CSV</li>
                                    <li className="flex items-center gap-2"><ChevronRight size={10} /> JWT Auth</li>
                                </ul>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                            <div>
                                <h3 className="flex items-center gap-2">
                                    <KeyRound size={16} className="text-primary" />
                                    Credenciales para DEMO
                                </h3>
                                <ul className="text-xs space-y-2 mt-2 text-gray-500 font-medium bg-base-200/50 p-4 rounded-lg border border-base-300 border-dashed">
                                    <li className="flex items-center gap-2">
                                        <ChevronRight size={10} /> 
                                        Usuario: 
                                        <span 
                                            className="font-bold text-black select-all cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => copyToClipboard('vendedor_1', 'Usuario')}
                                            title="Clic para copiar"
                                        >
                                            vendedor_1
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ChevronRight size={10} /> 
                                        Contraseña: 
                                        <span 
                                            className="font-bold text-black select-all cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => copyToClipboard('basic_crm', 'Contraseña')}
                                            title="Clic para copiar"
                                        >
                                            basic_crm
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm p-8 border border-base-200 w-full">
                    <div className='flex justify-between items-center mb-6'>
                        <Logo />
                        <h2 className="text-xl text-center">Acceso</h2>
                    </div>
                    {error && <div className="alert alert-error text-xs mb-4">{error}</div>}
                    <input 
                    type="text" placeholder="Usuario" className="input input-bordered w-full mb-4"
                    value={username} onChange={e => setUsername(e.target.value)} required
                    />
                    <input 
                    type="password" placeholder="Contraseña" className="input input-bordered w-full mb-6"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    />
                    <button type="submit" className="btn btn-primary w-full">Entrar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;