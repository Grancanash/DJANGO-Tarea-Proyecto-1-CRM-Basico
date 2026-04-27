import { useEffect, useState } from 'react';
import api from '../api';
import type { Company } from '../types';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building2, Plus } from 'lucide-react';
import Select from 'react-select'; // Importamos el selector avanzado

const ClientForm = ({ onClientAdded }: { onClientAdded: () => void }) => {
    const [companies, setCompanies] = useState<{ value: number, label: string }[]>([]);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: ''
    });

    useEffect(() => {
        // Cargamos todas las empresas usando el endpoint no paginado del Paso 257
        api.get('/companies/all/').then(res => {
            // Transformamos los datos al formato que pide react-select: { value, label }
            const options = res.data.map((c: Company) => ({
                value: c.id,
                label: c.name
            }));
            setCompanies(options);
        }).catch(err => {
            console.error("Error al cargar empresas", err);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/clients/', formData);
            setFormData({ first_name: '', last_name: '', email: '', phone: '', company: '' });
            onClientAdded();
            toast.success('Cliente creado correctamente');
        } catch (err) {
            toast.error('Error al crear el cliente');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200 space-y-4">
            <div className="relative flex items-center">
                <input 
                    type="text" placeholder="Nombre" className="input input-bordered input-sm w-full pl-10"
                    value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required 
                />
                <User className="absolute left-3 text-gray-400 z-10" size={16} />
            </div>

            <div className="relative flex items-center">
                <input 
                    type="text" placeholder="Apellidos" className="input input-bordered input-sm w-full pl-10"
                    value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required 
                />
                <User className="absolute left-3 text-gray-400 z-10" size={16} />
            </div>

            <div className="relative flex items-center">
                <input 
                    type="email" placeholder="Email" className="input input-bordered input-sm w-full pl-10"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
                />
                <Mail className="absolute left-3 text-gray-400 z-10" size={16} />
            </div>

            <div className="relative flex items-center">
                <input 
                    type="tel" placeholder="Teléfono" className="input input-bordered input-sm w-full pl-10"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
                <Phone className="absolute left-3 text-gray-400 z-10" size={16} />
            </div>

            {/* SELECTOR CON BÚSQUEDA */}
            <div className="relative flex items-center">
                {/* El icono ahora está posicionado de forma idéntica a los demás */}
                <Building2 className="absolute left-3 text-gray-400 z-10" size={16} />
                
                <Select
                    placeholder="Selecciona Empresa..."
                    options={companies}
                    className="w-full"
                    styles={{
                        control: (base) => ({
                            ...base,
                            minHeight: '32px',
                            height: '32px',
                            fontSize: '14px',
                            borderRadius: '8px',
                            borderColor: '#e5e7eb',
                            // Añadimos padding a la izquierda para dejar hueco al icono
                            paddingLeft: '24px', 
                            boxShadow: 'none',
                            '&:hover': {
                                borderColor: '#e5e7eb'
                            }
                        }),
                        valueContainer: (base) => ({
                            ...base,
                            padding: '0px 8px',
                        }),
                        input: (base) => ({
                            ...base,
                            margin: '0px',
                            padding: '0px',
                        }),
                        indicatorsContainer: (base) => ({
                            ...base,
                            height: '30px',
                        }),
                    }}
                    onChange={(option) => setFormData({...formData, company: option ? option.value.toString() : ''})}
                />
            </div>

            <button type="submit" className="btn btn-primary btn-sm w-full gap-2">
                <Plus size={16} />
                Añadir Cliente
            </button>
        </form>
    );
};

export default ClientForm;