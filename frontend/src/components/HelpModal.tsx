import { useState } from 'react';
import { 
    HelpCircle, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle2, 
    Info, 
    RefreshCcw, 
    Zap,
    Activity // Corregido: Importamos Activity
} from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal = ({ isOpen, onClose }: Props) => {
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    if (!isOpen) return null;

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl border border-base-200 shadow-2xl p-0 overflow-hidden bg-white text-gray-800">
                
                {/* CABECERA */}
                <div className="bg-primary p-6 text-white flex justify-between items-center border-b border-white/10">
                    <div className="flex items-center gap-4">
                        {/* El rayo ahora es amarillo brillante para destacar */}
                        <Zap size={28} className="text-yellow-300 fill-yellow-300/20" />
                        <div>
                            <h3 className="font-black text-2xl tracking-tighter leading-none text-white">
                                GUÍA RÁPIDA
                            </h3>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-blue-100 font-bold mt-1.5 opacity-90">
                                Basic CRM Demo
                            </p>
                        </div>
                    </div>
                    <div className="text-xs font-bold font-mono bg-white/20 px-4 py-1.5 rounded-full text-white backdrop-blur-sm border border-white/10">
                        Paso {step} de {totalSteps}
                    </div>
                </div>

                <div className="p-8">
                    {/* CONTENIDO */}
                    <div className="min-h-[220px]">
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-4 mb-4 text-primary">
                                    <RefreshCcw size={32} />
                                    <h4 className="text-lg font-bold text-gray-800">¡Libertad Total!</h4>
                                </div>
                                <p className="text-sm leading-relaxed mb-8 text-gray-600">
                                    Estás en una <span className="font-bold">instancia de demostración</span>. Siéntete libre de crear clientes, editar empresas o registrar interacciones como prefieras.
                                </p>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                                    <Info className="text-primary shrink-0" size={18} />
                                    <p className="text-xs text-primary">
                                        Los datos se reinician automáticamente a las <span className="font-bold">07:00 AM</span> (España). Mañana la casa volverá a estar limpia.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-4 mb-4 text-primary">
                                    <Activity size={32} /> {/* Corregido: Usamos Activity */}
                                    <h4 className="text-lg font-bold text-gray-800">Flujo de Trabajo</h4>
                                </div>
                                <ul className="space-y-4 text-sm text-gray-600">
                                    <li className="flex gap-3">
                                        <div className="badge badge-primary badge-sm mt-1 text-white font-bold">1</div>
                                        <span>Registra una <span className="font-bold text-gray-800">Empresa</span> en el directorio.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="badge badge-primary badge-sm mt-1 text-white font-bold">2</div>
                                        <span>Añade <span className="font-bold text-gray-800">Clientes</span> asociados a esas empresas.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="badge badge-primary badge-sm mt-1 text-white font-bold">3</div>
                                        <span>Gestiona su <span className="font-bold text-gray-800">Actividad</span> e hitos (Tareas).</span>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-4 mb-4 text-success">
                                    <CheckCircle2 size={32} />
                                    <h4 className="text-lg font-bold text-gray-800">Productividad</h4>
                                </div>
                                <p className="text-sm leading-relaxed mb-4 text-gray-600">
                                    Usa el <span className="font-bold text-primary">Dashboard</span> para ver qué tienes pendiente. Puedes completar tareas haciendo clic en el checkbox.
                                </p>
                                <p className="text-sm leading-relaxed text-gray-600">
                                    ¿Necesitas los datos? Usa el botón de <span className="font-bold text-gray-800 uppercase text-[10px]">Exportar CSV</span> en el listado.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* BOTONES */}
                    <div className="modal-action flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                        <button 
                            className={`btn btn-sm btn-ghost gap-2 text-gray-500 ${step === 1 ? 'invisible' : ''}`}
                            onClick={prevStep}
                        >
                            <ChevronLeft size={16} /> Anterior
                        </button>
                        
                        <div className="flex gap-2">
                            {step < totalSteps ? (
                                <button className="btn btn-primary btn-sm gap-2 px-6 text-white" onClick={nextStep}>
                                    Siguiente <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button className="btn btn-success btn-sm text-white px-8" onClick={onClose}>
                                    ¡Empezar ahora!
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop bg-black/60" onClick={onClose}></div>
        </div>
    );
};

export default HelpModal;