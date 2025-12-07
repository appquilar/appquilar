import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from '@/components/ui/sidebar';
import {useAuth} from '@/context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {ChevronsUpDown, LogOut, Settings, User as UserIcon} from 'lucide-react';
import {useProfileAvatar} from '@/components/dashboard/hooks/useProfileAvatar';

const UserProfile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // CORRECCIÓN: Usar profileImageId
    const { avatarUrl } = useProfileAvatar(user?.profileImageId);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const displayName = fullName || user.email;

    const getInitials = () => {
        const first = user.firstName?.[0] || '';
        const last = user.lastName?.[0] || '';
        const initials = (first + last).toUpperCase();
        return initials || 'N/A';
    };

    // Usar la URL obtenida del hook
    const displayAvatarSrc = avatarUrl || '';

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={displayAvatarSrc} alt={displayName} />
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{displayName}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side="bottom"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={displayAvatarSrc} alt={displayName} />
                                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{displayName}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/dashboard/config?tab=profile')}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/dashboard/config?tab=password')}>
                            <Settings className="mr-2 h-4 w-4" />
                            Configuración
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export default UserProfile;