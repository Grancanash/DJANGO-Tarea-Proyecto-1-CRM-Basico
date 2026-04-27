import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import Dashboard from './components/Dashboard';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import { User } from './types';
import api from './api';
import CompanyList from './components/CompanyList';
import HelpModal from './components/HelpModal';
import Logo from './components/Logo';
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, Users, Building2, LogOut, CircleHelp  } from 'lucide-react'; // Importar iconos

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    
    useEffect(() => {
        if (token) {
            api.get('/me/')
                .then(res => setUser(res.data))
                .catch(() => handleLogout());
        }
    }, [token]);
    
    const handleLogin = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        // ACTIVAMOS EL TUTORIAL AUTOMÁTICAMENTE AL LOGUEARNOS
        setIsHelpOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <>
            {/* El Toaster ahora está fuera de cualquier lógica, se carga SIEMPRE */}
            <Toaster 
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: '8px',
                        background: '#ffffff',
                        color: '#374151',
                        border: '1px solid #e5e7eb',
                    },
                }}
            />

            <HelpModal 
                isOpen={isHelpOpen} 
                onClose={() => setIsHelpOpen(false)} 
            />

            {!token ? (
                // Si no hay token, solo mostramos el Login
                <Login onLogin={handleLogin} />
            ) : (
                // Si hay token, mostramos todo el sistema
                <Router>
                    <div className="min-h-screen bg-base-200 flex flex-col">
                        <div className="navbar bg-base-100 shadow-sm px-8 h-20">
                            <div className="flex-1">
                                <Link to="/" className="text-primary tracking-tighter"><Logo /></Link>
                            </div>
                            <div className="flex items-center text-sm uppercase font-bold">
                                {user && <span className="text-gray-400 lowercase font-normal italic mr-2">{user.email}</span>}
                                {/* BOTÓN DE AYUDA (Interrogante) */}
                                <button 
                                    onClick={() => setIsHelpOpen(true)}
                                    className="btn btn-ghost btn-sm text-primary hover:bg-primary/10 px-2"
                                    title="Guía de uso"
                                >
                                    <CircleHelp size={22} />
                                </button>
                                <ul className="menu menu-horizontal px-1 flex gap-2">
                                    <li>
                                        <NavLink className={({ isActive }) => isActive ? "bg-gray-700 text-white" : "text-gray-700"} to="/">
                                            <LayoutDashboard size={18} /> Dashboard
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink className={({ isActive }) => isActive ? "bg-gray-700 text-white" : "text-gray-700"} to="/clients">
                                            <Users size={18} /> Clientes
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink className={({ isActive }) => isActive ? "bg-gray-700 text-white" : "text-gray-700"} to="/companies">
                                            <Building2 size={18} /> Empresas
                                        </NavLink >
                                    </li>
                                </ul>
                                <button onClick={handleLogout} className="btn btn-ghost btn-xs">Salir</button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/clients" element={<ClientList />} />
                                <Route path="/clients/:id" element={<ClientDetail currentUser={user} />} />
                                <Route path="/companies" element={<CompanyList />} />
                            </Routes>
                        </div>

                        <footer className="footer footer-center p-6 bg-base-100 text-base-content border-t border-base-200 mt-auto">
                            <aside>
                                <p className="text-sm font-bold opacity-60">
                                    DJANGO Tarea Proyecto 1
                                </p> 
                                <p className="text-sm">
                                    Desarrollado por <span className="font-bold text-primary">Alejandro Sarmiento</span> para <span className="font-bold">ConquerBlocks</span>
                                </p>
                            </aside>
                        </footer>
                    </div>
                </Router>
            )}
        </>
    );
}

export default App;