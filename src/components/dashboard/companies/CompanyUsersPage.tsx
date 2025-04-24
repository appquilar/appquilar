
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import FormHeader from '../common/FormHeader';
import { Company } from '@/domain/models/Company';
import { CompanyUser, UserInvitationFormData } from '@/domain/models/CompanyUser';
import { MOCK_COMPANIES } from './data/mockCompanies';
import { UserService } from '@/application/services/UserService';
import { CompanyUsersTable } from './users/CompanyUsersTable';
import { InviteUserDialog } from './users/InviteUserDialog';

const CompanyUsersPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const userService = UserService.getInstance();

  useEffect(() => {
    if (!companyId) {
      navigate('/dashboard/companies');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const foundCompany = MOCK_COMPANIES.find(c => c.id === companyId);
        if (!foundCompany) {
          navigate('/dashboard/companies');
          return;
        }
        setCompany(foundCompany);
        
        const companyUsers = await userService.getUsersByCompanyId(companyId);
        setUsers(companyUsers);
      } catch (error) {
        console.error('Error loading company users:', error);
        toast.error('Error al cargar los usuarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [companyId, navigate]);

  const handleSendInvite = async (data: UserInvitationFormData) => {
    try {
      const newUser = await userService.createUser({
        ...data,
        status: 'invited',
        dateAdded: new Date().toISOString(),
      });
      
      setUsers(prev => [...prev, newUser]);
      setInviteDialogOpen(false);
      toast.success('Invitación enviada correctamente');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Error al enviar la invitación');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <FormHeader
        title={`Gestión de Usuarios - ${company?.name}`}
        backUrl="/dashboard/companies"
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Usuarios de la empresa</h2>
        <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
          <Mail size={16} />
          Invitar Usuario
        </Button>
      </div>
      
      <CompanyUsersTable users={users} onUsersChange={setUsers} />
      
      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSubmit={handleSendInvite}
        companyId={companyId || ''}
      />
    </div>
  );
};

export default CompanyUsersPage;
