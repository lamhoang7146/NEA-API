import { Role } from '@/common/constants';

export type UserRole = {
  user: {
    id: string;
    role: Role;
  };
};
