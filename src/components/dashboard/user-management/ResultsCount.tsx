
import { CompanyUser } from '@/domain/models/CompanyUser';
import { MOCK_USERS } from '@/infrastructure/services/mockData/companyUserMockData';

interface ResultsCountProps {
  filteredUsers: CompanyUser[];
}

const ResultsCount = ({ filteredUsers }: ResultsCountProps) => {
  if (filteredUsers.length === 0 || filteredUsers.length === MOCK_USERS.length) {
    return null;
  }

  return (
    <p className="text-sm text-muted-foreground">
      Mostrando {filteredUsers.length} de {MOCK_USERS.length} usuarios
    </p>
  );
};

export default ResultsCount;
