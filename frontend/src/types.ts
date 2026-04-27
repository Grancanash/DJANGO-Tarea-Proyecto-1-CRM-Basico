export interface Company {
  id?: number;
  name: string;
  website?: string;
  industry?: string;
  address?: string;
  created_at?: string;
}

export interface Client {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: number;
  company_name?: string;
  company_website?: string;
  company_industry?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  status: 'prospect' | 'opportunity' | 'client';
  created_at?: string;
}

export interface Interaction {
  id?: number;
  client: number; // ID del cliente
  agent: number;  // ID del usuario (comercial)
  type: 'call' | 'email' | 'meeting';
  notes: string;
  created_at?: string;
}

export interface Task {
  id?: number;
  client: number;
  client_name: string;
  company_name: string;
  assigned_to: number;
  description: string;
  due_date: string;
  is_completed: boolean;
  created_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}