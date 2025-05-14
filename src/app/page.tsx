
'use client';

import type { Employee, Task, ScheduledTask, TaskFormData, EmployeeFormData, PendingTaskAssignment } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { TaskSidebar } from '@/components/scheduler/task-sidebar';
import { WeeklyView } from '@/components/scheduler/weekly-view';
import { MonthlyView } from '@/components/scheduler/monthly-view';
import { HeaderControls } from '@/components/scheduler/header-controls';
import { ManageTasksDialog } from '@/components/scheduler/manage-tasks-dialog';
import { ManageEmployeesDialog } from '@/components/scheduler/manage-employees-dialog';
import { ScheduledTaskDetailsDialog } from '@/components/scheduler/scheduled-task-details-dialog';
import { AssignEmployeeDialog } from '@/components/scheduler/assign-employee-dialog';
import { addWeeks, subWeeks, addMonths, subMonths, startOfWeek, startOfMonth, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';


const initialEmployees: Employee[] = [
  { id: 'emp001', firstName: 'Alice', lastName: 'Wonderland', warehouseCode: 'WH-A1', createdAt: new Date().toISOString(), isActive: true },
  { id: 'emp002', firstName: 'Bob', lastName: 'The Builder', warehouseCode: 'WH-B2', createdAt: new Date().toISOString(), isActive: true },
  { id: 'emp003', firstName: 'Carol', lastName: 'Danvers', warehouseCode: 'WH-C3', createdAt: new Date().toISOString(), isActive: false },
];

const initialTasks: Task[] = [
  { id: 'task1', name: 'Morning Briefing', iconName: 'Sunrise', colorClasses: 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200' },
  { id: 'task2', name: 'Client Call', iconName: 'Phone', colorClasses: 'bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200' },
  { id: 'task3', name: 'Project Work', iconName: 'Briefcase', colorClasses: 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' },
];


export default function SchedulerPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [currentView, setCurrentView] = useState<'weekly' | 'monthly'>('weekly');
  
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(startOfMonth(new Date()));

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [selectedScheduledTask, setSelectedScheduledTask] = useState<ScheduledTask | null>(null);
  const [isTaskDetailsDialogOpen, setIsTaskDetailsDialogOpen] = useState(false);

  const [isAssignEmployeeDialogOpen, setIsAssignEmployeeDialogOpen] = useState(false);
  const [pendingTaskAssignmentData, setPendingTaskAssignmentData] = useState<PendingTaskAssignment | null>(null);

  const { toast } = useToast();

  const activeEmployees = useMemo(() => employees.filter(emp => emp.isActive), [employees]);

  const handleDragTaskStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    event.dataTransfer.setData('text/plain', taskId);
  };

  const handleDropTask = (employeeId: string, date: string, taskId: string) => {
    const newScheduledTask: ScheduledTask = {
      id: uuidv4(), 
      employeeId,
      taskId,
      date,
      status: 'Scheduled',
    };
    setScheduledTasks((prev) => [...prev, newScheduledTask]);
    const task = tasks.find(t => t.id === taskId);
    const employee = employees.find(e => e.id === employeeId);
    toast({
      title: "Task Scheduled",
      description: `${task?.name || 'Task'} assigned to ${employee?.firstName} ${employee?.lastName} on ${format(new Date(date), 'MMM d, yyyy')}.`
    });
  };

  // Task CRUD operations
  const handleAddTask = (taskData: TaskFormData) => {
    const newTask: Task = { ...taskData, id: uuidv4() };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateTask = (taskId: string, taskData: TaskFormData) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...taskData } : task)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setScheduledTasks((prev) => prev.filter(st => st.taskId !== taskId));
  };

  // Employee CRUD operations
  const handleAddEmployee = (employeeData: EmployeeFormData) => {
    if (employees.some(emp => emp.id === employeeData.id)) {
      toast({
        title: "Error Adding Employee",
        description: `Employee ID "${employeeData.id}" already exists.`,
        variant: "destructive",
      });
      return;
    }
    const newEmployee: Employee = { 
      ...employeeData,
      createdAt: new Date().toISOString(),
    };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const handleUpdateEmployee = (employeeId: string, employeeData: EmployeeFormData) => {
    setEmployees((prev) => 
      prev.map((emp) => 
        emp.id === employeeId ? { ...emp, ...employeeData, id: employeeId } : emp 
      )
    );
  };

  const handleDeleteEmployee = (employeeIdToDelete: string) => {
    const employee = employees.find(emp => emp.id === employeeIdToDelete);
    if (!employee) return;

    setEmployees((prev) => prev.filter((emp) => emp.id !== employeeIdToDelete));
    setScheduledTasks((prev) => prev.filter((st) => st.employeeId !== employeeIdToDelete));
    
    if (selectedEmployeeId === employeeIdToDelete) {
      setSelectedEmployeeId(null); // Reset filter if deleted employee was selected
    }

    toast({
      title: "Employee Deleted",
      description: `Employee "${employee.firstName} ${employee.lastName}" and their scheduled tasks have been deleted.`,
      variant: "destructive"
    });
  };


  // Navigation
  const handlePrev = () => {
    if (currentView === 'weekly') {
      setCurrentWeekDate((prevDate) => subWeeks(prevDate, 1));
    } else {
      setCurrentMonthDate((prevDate) => subMonths(prevDate, 1));
    }
  };

  const handleNext = () => {
    if (currentView === 'weekly') {
      setCurrentWeekDate((prevDate) => addWeeks(prevDate, 1));
    } else {
      setCurrentMonthDate((prevDate) => addMonths(prevDate, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    if (currentView === 'weekly') {
      setCurrentWeekDate(startOfWeek(today, { weekStartsOn: 1 }));
    } else {
      setCurrentMonthDate(startOfMonth(today));
    }
  };

  const handleSetDate = (date: Date) => {
    if (currentView === 'weekly') {
      setCurrentWeekDate(startOfWeek(date, { weekStartsOn: 1 }));
    } else {
      setCurrentMonthDate(startOfMonth(date));
    }
  };

  const handleMonthlyDateClick = (date: Date) => {
    setCurrentWeekDate(startOfWeek(date, { weekStartsOn: 1 }));
    setCurrentView('weekly');
  };

  const handleScheduledTaskClick = (scheduledTaskId: string) => {
    const taskToView = scheduledTasks.find(st => st.id === scheduledTaskId);
    if (taskToView) {
      setSelectedScheduledTask(taskToView);
      setIsTaskDetailsDialogOpen(true);
    }
  };

  const handleOpenAssignEmployeeDialog = (taskId: string, date: Date) => {
    const task = tasks.find(t => t.id === taskId);
    setPendingTaskAssignmentData({
      taskId,
      date: format(date, 'yyyy-MM-dd'),
      taskName: task?.name || 'Unknown Task'
    });
    setIsAssignEmployeeDialogOpen(true);
  };

  const handleConfirmEmployeeAssignment = (employeeId: string) => {
    if (pendingTaskAssignmentData) {
      handleDropTask(employeeId, pendingTaskAssignmentData.date, pendingTaskAssignmentData.taskId);
      setIsAssignEmployeeDialogOpen(false);
      setPendingTaskAssignmentData(null);
    }
  };
  
  const activeDate = currentView === 'weekly' ? currentWeekDate : currentMonthDate;

  return (
      <div className="flex h-screen max-h-screen flex-col p-4 gap-4 bg-secondary/50">
        <h1 className="text-3xl font-bold text-primary">TimeWise Scheduler</h1>
        <div className="flex flex-grow gap-4 overflow-hidden">
          <TaskSidebar tasks={tasks} onDragTaskStart={handleDragTaskStart} />
          <div className="flex flex-1 flex-col gap-0 overflow-hidden">
            <HeaderControls
              currentView={currentView}
              onViewChange={setCurrentView}
              currentDate={activeDate} 
              onPrev={handlePrev}
              onNext={handleNext}
              onToday={handleToday}
              onSetDate={handleSetDate}
              onManageTasks={() => setIsTaskDialogOpen(true)}
              onManageEmployees={() => setIsEmployeeDialogOpen(true)}
              employees={activeEmployees} 
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeFilterChange={setSelectedEmployeeId}
            />
            <div className="flex-1 overflow-hidden h-full">
              <div className={cn('h-full w-full', currentView === 'weekly' ? 'flex' : 'hidden')}>
                <WeeklyView
                  employees={employees} 
                  tasks={tasks}
                  scheduledTasks={scheduledTasks}
                  currentDate={currentWeekDate} 
                  onDropTask={handleDropTask}
                  selectedEmployeeId={selectedEmployeeId}
                  onTaskClick={handleScheduledTaskClick}
                />
              </div>
              <div className={cn('h-full w-full', currentView === 'monthly' ? 'flex' : 'hidden')}>
                <MonthlyView
                  employees={employees} 
                  tasks={tasks}
                  scheduledTasks={scheduledTasks}
                  currentDate={currentMonthDate} 
                  onDateClick={handleMonthlyDateClick}
                  selectedEmployeeId={selectedEmployeeId}
                  onDropTaskToCell={handleOpenAssignEmployeeDialog}
                  onScheduledTaskItemClick={handleScheduledTaskClick}
                />
              </div>
            </div>
          </div>
        </div>
        <ManageTasksDialog
          isOpen={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
        <ManageEmployeesDialog
          isOpen={isEmployeeDialogOpen}
          onOpenChange={setIsEmployeeDialogOpen}
          employees={employees}
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onDeleteEmployee={handleDeleteEmployee} // Pass delete handler
        />
        <ScheduledTaskDetailsDialog
          isOpen={isTaskDetailsDialogOpen}
          onOpenChange={setIsTaskDetailsDialogOpen}
          scheduledTask={selectedScheduledTask}
          employees={employees}
          tasks={tasks}
        />
        <AssignEmployeeDialog
          isOpen={isAssignEmployeeDialogOpen}
          onOpenChange={setIsAssignEmployeeDialogOpen}
          employees={activeEmployees} 
          taskName={pendingTaskAssignmentData?.taskName}
          date={pendingTaskAssignmentData?.date}
          onSubmit={handleConfirmEmployeeAssignment}
        />
      </div>
  );
}
