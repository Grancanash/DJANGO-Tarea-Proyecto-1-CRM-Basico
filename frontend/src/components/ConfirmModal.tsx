import { Trash2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: Props) => {
    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box border border-base-200 shadow-2xl">
                <div className="flex items-center gap-4 text-error mb-4">
                    <div className="bg-error/10 p-3 rounded-full">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-base-content uppercase tracking-tight">
                        {title}
                    </h3>
                </div>
                <p className="py-4 text-gray-500 text-sm leading-relaxed">
                    {message}
                </p>
                <div className="modal-action">
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn btn-error btn-sm text-white px-6" onClick={onConfirm}>
                        Eliminar definitivamente
                    </button>
                </div>
            </div>
            <div className="modal-backdrop bg-black/40" onClick={onClose}></div>
        </div>
    );
};

export default ConfirmModal;