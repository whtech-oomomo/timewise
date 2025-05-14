
import type { LucideIcon } from 'lucide-react';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  warehouseCode: string;
  createdAt: string; // ISO date string
  isActive: boolean;
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

// For employee management form
export interface EmployeeFormData {
  id: string; // Added manual ID
  firstName: string;
  lastName: string;
  warehouseCode: string;
  isActive: boolean;
}


// For pending task assignment when dropping on monthly view
export interface PendingTaskAssignment {
  taskId: string;
  date: string; // YYYY-MM-DD format
  taskName?: string; // For display in the assignment dialog
}
