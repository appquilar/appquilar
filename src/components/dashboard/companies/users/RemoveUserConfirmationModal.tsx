
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserMinus } from 'lucide-react';

interface RemoveUserConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

const RemoveUserConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName
}: RemoveUserConfirmationModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserMinus size={18} className="text-red-500" />
            Confirmar eliminación
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas remover a <span className="font-medium">{userName || 'este usuario'}</span> de la empresa?
            Esta acción no eliminará la cuenta del usuario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-red-500 hover:bg-red-600"
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveUserConfirmationModal;
