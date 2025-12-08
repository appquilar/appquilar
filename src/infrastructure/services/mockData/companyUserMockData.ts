
import { User } from '@/domain/models/User.ts';
import {UserRole} from "@/domain/models/UserRole.ts";

// Mock users - would come from backend API in production
export const MOCK_USERS: User[] = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        roles: [UserRole.REGULAR_USER],
        status: 'active',
        address: undefined,
        location: undefined,
        companyId: '1'
    },
    {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        roles: [UserRole.REGULAR_USER],
        status: 'active',
        address: undefined,
        location: undefined,
        companyId: '1'
    },
    {
        id: '3',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael@example.com',
        roles: [UserRole.REGULAR_USER],
        status: 'active',
        address: undefined,
        location: undefined,
        companyId: '2'
    },
    {
        id: '4',
        firstName: 'Emily',
        lastName: 'Wilson',
        email: 'emily@example.com',
        roles: [UserRole.REGULAR_USER],
        status: 'invited',
        address: undefined,
        location: undefined,
        companyId: '2'
    },
    {
        id: '5',
        firstName: 'David',
        lastName: 'Thompson',
        email: 'david@example.com',
        roles: [UserRole.REGULAR_USER],
        status: 'deactivated',
        address: undefined,
        location: undefined,
        companyId: '3'
    }
];
