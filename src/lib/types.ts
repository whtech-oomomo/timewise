import type { LucideIcon } from 'lucide-react';

export interface Employee {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
  iconName: string; // Key for mapping to LucideIcon
  colorClasses: string; // Tailwind classes for styling (e.g., "bg-blue-100 text-blue-800 border border-blue-300")
}

export interface ScheduledTask {
  id: string;
  employeeId: string;
  taskId: string;
  date: string; // YYYY-MM-DD format
  status?: string; // e.g., "Scheduled", "In Progress", "Completed"
}

// For task management form
export interface TaskFormData {
  name: string;
  iconName: string;
  colorClasses: string;
}
