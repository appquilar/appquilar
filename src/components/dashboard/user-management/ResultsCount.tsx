
import { User } from '@/domain/models/User.ts';
import { MOCK_USERS } from '@/infrastructure/services/mockData/companyUserMockData';

interface ResultsCountProps {
  filteredUsers: User[];
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
