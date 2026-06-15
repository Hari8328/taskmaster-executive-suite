export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string | number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  category: string;
  reminderMinutes?: number;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  User?: {
    username: string;
    displayName?: string;
  };
}

export interface User {
  id: string | number;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  roles?: string[];
}
