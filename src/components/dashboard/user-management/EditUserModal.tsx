
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { CompanyUser } from "@/domain/models/CompanyUser";

interface EditUserModalProps {
  user: CompanyUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, userData: Partial<CompanyUser>) => void;
}

const EditUserModal = ({ user, isOpen, onClose, onSave }: EditUserModalProps) => {
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<CompanyUser['role']>(user?.role || 'company_user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    onSave(user.id, {
      name,
      role
    });
    onClose();
  };

  // Type-safe handler for role selection
  const handleRoleChange = (value: string) => {
    // Validate that the value is a valid role before setting it
    if (value === 'company_user' || value === 'company_admin') {
      setRole(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del usuario"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rol</label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_user">Usuario</SelectItem>
                <SelectItem value="company_admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
