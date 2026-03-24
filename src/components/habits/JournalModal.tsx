'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { X } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitName: string;
  habitId: string;
}

export default function JournalModal({ isOpen, onClose, habitName, habitId }: JournalModalProps) {
  const [note, setNote] = useState('');
  
  const handleSave = () => {
    // TODO: Send note to Supabase
    setNote('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-[#1e293b] p-6 text-left align-middle shadow-xl transition-all border border-[#0f172a]">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-[#ededed] flex justify-between items-center">
                  <span>Nota para {habitName}</span>
                  <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                </Dialog.Title>
                <div className="mt-4">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="¿Añadir contexto sobre este registro?"
                    className="w-full bg-[#0f172a] text-[#ededed] border border-gray-600 rounded-lg p-3 min-h-[120px] focus:outline-none focus:border-[#00eeff]"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg font-medium text-gray-300 hover:bg-[#0f172a] transition-colors"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg font-semibold bg-[#00eeff] text-[#0a192f] hover:bg-opacity-90 shadow-[0_0_10px_rgba(0,238,255,0.3)] transition-all"
                    onClick={handleSave}
                  >
                    Guardar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
