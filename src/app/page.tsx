'use client';

import type { Employee, Task, ScheduledTask, TaskFormData } from '@/lib/types';
import { useState, useEffect } from 'react';
import { TaskSidebar } from '@/components/scheduler/task-sidebar';
import { WeeklyView } from '@/components/scheduler/weekly-view';
import { MonthlyView } from '@/components/scheduler/monthly-view';
import { HeaderControls } from '@/components/scheduler/header-controls';
import { ManageTasksDialog } from '@/components/scheduler/manage-tasks-dialog';
import { DndProvider } from 'react-dnd'; // If using react-dnd later
import { HTML5Backend } from 'react-dnd-html5-backend'; // If using react-dnd later
import { addWeeks, subWeeks, addMonths, subMonths, startOfWeek, startOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs


const initialEmployees: Employee[] = [
  { id: 'emp1', name: 'Alice Wonderland' },
  { id: 'emp2', name: 'Bob The Builder' },
  { id: 'emp3', name: 'Carol Danvers' },
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
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Represents start of week/month
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const { toast } = useToast();

  // Ensure currentDate is always start of week for weekly, start of month for monthly
  useEffect(() => {
    if (currentView === 'weekly') {
      setCurrentDate(currentDate => startOfWeek(currentDate, { weekStartsOn: 1 }));
    } else {
      setCurrentDate(currentDate => startOfMonth(currentDate));
    }
  }, [currentView]);


  const handleDragTaskStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    event.dataTransfer.setData('text/plain', taskId);
  };

  const handleDropTask = (employeeId: string, date: string, taskId: string) => {
    const newScheduledTask: ScheduledTask = {
      id: uuidv4(),
      employeeId,
      taskId,
      date,
    };
    setScheduledTasks((prev) => [...prev, newScheduledTask]);
    const task = tasks.find(t => t.id === taskId);
    const employee = employees.find(e => e.id === employeeId);
    toast({
      title: "Task Scheduled",
      description: `${task?.name || 'Task'} assigned to ${employee?.name || 'Employee'} on ${date}.`
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
    // Also remove scheduled instances of this task
    setScheduledTasks((prev) => prev.filter(st => st.taskId !== taskId));
  };

  // Navigation
  const handlePrev = () => {
    setCurrentDate((prevDate) =>
      currentView === 'weekly' ? subWeeks(prevDate, 1) : subMonths(prevDate, 1)
    );
  };

  const handleNext = () => {
    setCurrentDate((prevDate) =>
      currentView === 'weekly' ? addWeeks(prevDate, 1) : addMonths(prevDate, 1)
    );
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(currentView === 'weekly' ? startOfWeek(today, { weekStartsOn: 1 }) : startOfMonth(today));
  };
  
  const handleSetDate = (date: Date) => {
    setCurrentDate(currentView === 'weekly' ? startOfWeek(date, { weekStartsOn: 1 }) : startOfMonth(date));
  };
  
  const handleMonthlyDateClick = (date: Date) => {
    setCurrentDate(startOfWeek(date, { weekStartsOn: 1 }));
    setCurrentView('weekly');
  };


  return (
      <div className="flex h-screen max-h-screen flex-col p-4 gap-4 bg-secondary/50">
        <h1 className="text-3xl font-bold text-primary">TimeWise Scheduler</h1>
        <div className="flex flex-grow gap-4 overflow-hidden">
          <TaskSidebar tasks={tasks} onDragTaskStart={handleDragTaskStart} />
          <div className="flex flex-1 flex-col gap-0 overflow-hidden">
            <HeaderControls
              currentView={currentView}
              onViewChange={setCurrentView}
              currentDate={currentDate}
              onPrev={handlePrev}
              onNext={handleNext}
              onToday={handleToday}
              onSetDate={handleSetDate}
              onManageTasks={() => setIsTaskDialogOpen(true)}
              employees={employees}
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeFilterChange={setSelectedEmployeeId}
            />
            {currentView === 'weekly' ? (
              <WeeklyView
                employees={employees}
                tasks={tasks}
                scheduledTasks={scheduledTasks}
                currentDate={currentDate}
                onDropTask={handleDropTask}
                selectedEmployeeId={selectedEmployeeId}
              />
            ) : (
              <MonthlyView
                tasks={tasks}
                scheduledTasks={scheduledTasks}
                currentDate={currentDate}
                onDateClick={handleMonthlyDateClick}
                selectedEmployeeId={selectedEmployeeId}
              />
            )}
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
      </div>
  );
}
