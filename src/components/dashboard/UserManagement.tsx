
import { useState } from 'react';
import { Edit, Plus, Search, Trash, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// User interface
interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'company_admin' | 'company_user';
  status: 'active' | 'invited' | 'deactivated';
  dateAdded: string;
}

// Mock users - would come from backend API in production
const MOCK_USERS: CompanyUser[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'company_admin',
    status: 'active',
    dateAdded: '2023-05-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'company_user',
    status: 'active',
    dateAdded: '2023-06-10'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    role: 'company_user',
    status: 'active',
    dateAdded: '2023-06-22'
  },
  {
    id: '4',
    name: 'Emily Wilson',
    email: 'emily@example.com',
    role: 'company_user',
    status: 'invited',
    dateAdded: '2023-07-14'
  },
  {
    id: '5',
    name: 'David Thompson',
    email: 'david@example.com',
    role: 'company_user',
    status: 'deactivated',
    dateAdded: '2023-06-05'
  }
];

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  // Check if the current user is a company admin
  if (user?.role !== 'company_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-xl font-medium mb-2">Access Restricted</h1>
        <p className="text-muted-foreground mb-4 text-center max-w-md">
          Only company administrators can access user management features.
        </p>
      </div>
    );
  }
  
  // Filter users based on search query
  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we might call an API endpoint here
  };
  
  const handleInviteUser = () => {
    toast.info("User invitation form would open here");
  };
  
  const handleEditUser = (userId: string) => {
    toast.info(`Editing user ${userId}`);
  };
  
  const handleDeleteUser = (userId: string) => {
    toast.success(`User ${userId} removed from company`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">User Management</h1>
          <p className="text-muted-foreground">Manage users who have access to your company account.</p>
        </div>
        <Button onClick={handleInviteUser} className="gap-2">
          <UserPlus size={16} />
          Invite User
        </Button>
      </div>
      
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </form>
      </div>
      
      {/* Users table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'company_admin' ? 'Administrator' : 'Staff'}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      user.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                        : user.status === 'invited'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {user.status === 'active' 
                      ? 'Active' 
                      : user.status === 'invited' 
                        ? 'Invited' 
                        : 'Deactivated'
                    }
                  </Badge>
                </TableCell>
                <TableCell>{user.dateAdded}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditUser(user.id)}
                      disabled={user.id === '1'} // Can't edit the owner
                    >
                      <Edit size={16} />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === '1'} // Can't delete the owner
                    >
                      <Trash size={16} />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredUsers.length > 0 && filteredUsers.length < MOCK_USERS.length && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {MOCK_USERS.length} users
        </p>
      )}
    </div>
  );
};

export default UserManagement;
