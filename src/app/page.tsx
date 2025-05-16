
'use client';

import type { Employee, Task, ScheduledTask, TaskFormData, EmployeeFormData, PendingTaskAssignment, ImportedEmployeeData } from '@/lib/types';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TaskSidebar } from '@/components/scheduler/task-sidebar';
import { WeeklyView } from '@/components/scheduler/weekly-view';
import { MonthlyView } from '@/components/scheduler/monthly-view';
import { HeaderControls } from '@/components/scheduler/header-controls';
import { ManageTasksDialog } from '@/components/scheduler/manage-tasks-dialog';
import { ManageEmployeesDialog } from '@/components/scheduler/manage-employees-dialog';
import { ScheduledTaskDetailsDialog } from '@/components/scheduler/scheduled-task-details-dialog';
import { AssignEmployeeDialog } from '@/components/scheduler/assign-employee-dialog';
import { addWeeks, subWeeks, addMonths, subMonths, startOfWeek, startOfMonth, format, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';


const initialEmployees: Employee[] = [
  { id: 'emp001', firstName: 'Alice', lastName: 'Wonderland', warehouseCode: 'WH-A1', createdAt: new Date().toISOString(), isActive: true },
  { id: 'emp002', firstName: 'Bob', lastName: 'The Builder', warehouseCode: 'WH-B2', createdAt: new Date().toISOString(), isActive: true },
  { id: 'emp003', firstName: 'Carol', lastName: 'Danvers', warehouseCode: 'WH-C3', createdAt: new Date().toISOString(), isActive: false },
  { id: 'emp004', firstName: 'David', lastName: 'Copperfield', warehouseCode: 'WH-A1', createdAt: new Date().toISOString(), isActive: true },
];

const initialTasks: Task[] = [
  { id: 'task1', name: 'Morning Briefing', iconName: 'Sunrise', colorClasses: 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200', defaultHours: 1 },
  { id: 'task2', name: 'Client Call', iconName: 'Phone', colorClasses: 'bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200', defaultHours: 2.5 },
  { id: 'task3', name: 'Project Work', iconName: 'Briefcase', colorClasses: 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200', defaultHours: 8 },
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
  const [selectedWarehouseCode, setSelectedWarehouseCode] = useState<string | null>(null);


  const [selectedScheduledTask, setSelectedScheduledTask] = useState<ScheduledTask | null>(null);
  const [isTaskDetailsDialogOpen, setIsTaskDetailsDialogOpen] = useState(false);

  const [isAssignEmployeeDialogOpen, setIsAssignEmployeeDialogOpen] = useState(false);
  const [pendingTaskAssignmentData, setPendingTaskAssignmentData] = useState<PendingTaskAssignment | null>(null);

  const [selectedScheduledTaskIds, setSelectedScheduledTaskIds] = useState<string[]>([]);

  const { toast } = useToast();
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const allUniqueWarehouseCodes = useMemo(() => {
    const codes = new Set<string>();
    employees.forEach(emp => codes.add(emp.warehouseCode));
    return Array.from(codes).sort();
  }, [employees]);

  const activeEmployees = useMemo(() => employees.filter(emp => emp.isActive), [employees]);
  
  const activeEmployeesForDropdown = useMemo(() => {
    if (selectedWarehouseCode) {
      return activeEmployees.filter(emp => emp.warehouseCode === selectedWarehouseCode);
    }
    return activeEmployees;
  }, [activeEmployees, selectedWarehouseCode]);

  const activeEmployeesForViews = useMemo(() => {
    let emps = activeEmployees;
    if (selectedWarehouseCode) {
      emps = emps.filter(emp => emp.warehouseCode === selectedWarehouseCode);
    }
    return emps;
  }, [activeEmployees, selectedWarehouseCode]);

  const filteredScheduledTasks = useMemo(() => {
    let filtered = scheduledTasks;

    if (selectedWarehouseCode) {
      const employeeIdsInWarehouse = employees
        .filter(emp => emp.warehouseCode === selectedWarehouseCode)
        .map(emp => emp.id);
      filtered = filtered.filter(st => employeeIdsInWarehouse.includes(st.employeeId));
    }

    if (selectedEmployeeId) {
      filtered = filtered.filter(st => st.employeeId === selectedEmployeeId);
    }
    
    return filtered;
  }, [scheduledTasks, selectedEmployeeId, selectedWarehouseCode, employees]);


  const handleDragTaskStart = (event: React.DragEvent<HTMLDivElement>, itemId: string, type: 'new-task' | 'existing-scheduled-task' = 'new-task') => {
    const dragData = JSON.stringify({ type, id: itemId });
    event.dataTransfer.setData('application/json', dragData);
  };

  const handleDropTask = (targetEmployeeId: string, targetDate: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    let draggedDataJSON: string | null = null;
    try {
      draggedDataJSON = event.dataTransfer.getData('application/json');
    } catch (e) {
      // This can happen if only text/plain was set
    }

    if (!draggedDataJSON) {
        const plainData = event.dataTransfer.getData('text/plain'); 
        if (plainData && tasks.some(t => t.id === plainData)) {
            draggedDataJSON = JSON.stringify({ type: 'new-task', id: plainData });
        } else if (plainData && scheduledTasks.some(st => st.id === plainData)) { 
            draggedDataJSON = JSON.stringify({ type: 'existing-scheduled-task', id: plainData });
        } else {
            console.error("No valid task ID found in drag data (plain text).");
            toast({ title: "Drag Error", description: "Could not retrieve task data from drag operation.", variant: "destructive" });
            return;
        }
    }

    let data: { type: string; id: string };
    try {
      data = JSON.parse(draggedDataJSON);
    } catch (e) {
      console.error("Invalid drag data JSON", e);
      toast({ title: "Drag Error", description: "Invalid task data format.", variant: "destructive" });
      return;
    }
  
    const { type, id: draggedItemId } = data;
  
    if (type === 'new-task') {
      const taskDefinition = tasks.find(t => t.id === draggedItemId);
      if (!taskDefinition) {
        toast({ title: "Task Error", description: `Task definition for ID "${draggedItemId}" not found.`, variant: "destructive" });
        return;
      }
  
      const newScheduledTask: ScheduledTask = {
        id: uuidv4(),
        employeeId: targetEmployeeId,
        taskId: taskDefinition.id,
        date: targetDate,
        status: 'Scheduled',
        hours: taskDefinition?.defaultHours || 8,
        tags: [],
      };
      setScheduledTasks((prev) => [...prev, newScheduledTask]);
      setSelectedScheduledTask(newScheduledTask); 
      setIsTaskDetailsDialogOpen(true); 
  
      const employee = employees.find(e => e.id === targetEmployeeId);
      toast({
        title: "Task Scheduled",
        description: `${taskDefinition.name} assigned to ${employee?.firstName} ${employee?.lastName} on ${format(new Date(targetDate), 'MMM d, yyyy')}. Please review details.`
      });
    } else if (type === 'existing-scheduled-task') {
      const tasksToMoveIds = selectedScheduledTaskIds.length > 0 && selectedScheduledTaskIds.includes(draggedItemId)
        ? selectedScheduledTaskIds
        : [draggedItemId];
  
      setScheduledTasks(prevScheduledTasks =>
        prevScheduledTasks.map(st => {
          if (tasksToMoveIds.includes(st.id)) {
            return {
              ...st,
              employeeId: targetEmployeeId,
              date: targetDate, 
            };
          }
          return st;
        })
      );
      const employee = employees.find(e => e.id === targetEmployeeId);
      toast({
        title: `${tasksToMoveIds.length} Task(s) Moved`,
        description: `Moved to ${employee?.firstName || 'employee'} on ${format(new Date(targetDate), 'MMM d, yyyy')}.`,
      });
      setSelectedScheduledTaskIds([]); 
    }
  };

  const handleMoveScheduledTasksInMonthlyView = (draggedScheduledTaskId: string, targetDateString: string) => {
    const tasksToMoveIds = selectedScheduledTaskIds.length > 0 && selectedScheduledTaskIds.includes(draggedScheduledTaskId)
      ? selectedScheduledTaskIds
      : [draggedScheduledTaskId];

    setScheduledTasks(prevScheduledTasks =>
      prevScheduledTasks.map(st => {
        if (tasksToMoveIds.includes(st.id)) {
          return {
            ...st,
            date: targetDateString, 
          };
        }
        return st;
      })
    );
    
    const firstMovedTask = scheduledTasks.find(st => st.id === tasksToMoveIds[0]);
    const taskDefinition = tasks.find(t => t.id === firstMovedTask?.taskId);
    
    toast({
      title: `${tasksToMoveIds.length} Task(s) Date Changed`,
      description: `Task(s) including "${taskDefinition?.name || 'Task'}" moved to ${format(new Date(targetDateString), 'MMM d, yyyy')}.`,
    });
    setSelectedScheduledTaskIds([]);
  };


  const handleAddTask = (taskData: TaskFormData) => {
    const newTask: Task = { 
      ...taskData, 
      id: uuidv4(),
      defaultHours: taskData.defaultHours || 8 
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateTask = (taskId: string, taskData: TaskFormData) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...taskData, defaultHours: taskData.defaultHours || task.defaultHours } : task)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setScheduledTasks((prev) => prev.filter(st => st.taskId !== taskId));
  };

  const handleAddEmployee = (employeeData: EmployeeFormData) => {
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
      setSelectedEmployeeId(null); 
    }
    setSelectedScheduledTaskIds(prevIds => prevIds.filter(id => {
        const task = scheduledTasks.find(st => st.id === id); 
        return task && task.employeeId !== employeeIdToDelete;
    }));

    toast({
      title: "Employee Deleted",
      description: `Employee "${employee.firstName} ${employee.lastName}" and their scheduled tasks have been deleted.`,
      variant: "destructive"
    });
  };

  const handleImportEmployees = (importedData: ImportedEmployeeData[]) => {
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
  
    const newEmployeesToAdd: Employee[] = [];
  
    importedData.forEach((empData, index) => {
      if (!empData.id || !empData.firstName || !empData.lastName || !empData.warehouseCode) {
        toast({
          title: `Import Error for row ${index + 1}`,
          description: "Missing required fields (ID, First Name, Last Name, Warehouse Code). Skipping.",
          variant: "destructive",
        });
        errorCount++;
        return;
      }
      
      if (employees.some(e => e.id === empData.id)) {
        toast({
          title: "Skipped Duplicate",
          description: `Employee ID "${empData.id}" (${empData.firstName} ${empData.lastName}) already exists.`,
          variant: "default", 
        });
        skippedCount++;
        return;
      }
  
      let createdAt = new Date().toISOString(); 
      if (empData.createdAtInput) {
        const parsedDate = new Date(empData.createdAtInput);
        if (isValid(parsedDate)) {
          createdAt = parsedDate.toISOString();
        } else {
           toast({
              title: `Invalid Date for ${empData.id}`,
              description: `Using current date for "Created At" as "${empData.createdAtInput}" is invalid.`,
              variant: "default",
          });
        }
      }
  
      const newEmployee: Employee = {
        id: empData.id,
        firstName: empData.firstName,
        lastName: empData.lastName,
        warehouseCode: empData.warehouseCode,
        isActive: typeof empData.isActive === 'boolean' ? empData.isActive : true, 
        createdAt: createdAt,
      };
      newEmployeesToAdd.push(newEmployee);
      addedCount++;
    });
  
    if (newEmployeesToAdd.length > 0) {
      setEmployees(prev => [...prev, ...newEmployeesToAdd].sort((a, b) => a.id.localeCompare(b.id)));
    }
  
    toast({
      title: "CSV Import Complete",
      description: `${addedCount} employees imported. ${skippedCount} skipped (duplicates). ${errorCount} rows had errors.`,
    });
  };

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
    setSelectedScheduledTaskIds([]); 
  };

  const handleScheduledTaskClick = (clickedScheduledTaskId: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    const isCtrlCmd = event && (event.metaKey || event.ctrlKey);

    if (isCtrlCmd) {
      setSelectedScheduledTaskIds(prevSelectedIds =>
        prevSelectedIds.includes(clickedScheduledTaskId)
          ? prevSelectedIds.filter(id => id !== clickedScheduledTaskId)
          : [...prevSelectedIds, clickedScheduledTaskId]
      );
      setSelectedScheduledTask(null); 
      setIsTaskDetailsDialogOpen(false);
    } else {
      setSelectedScheduledTaskIds([clickedScheduledTaskId]);
      const taskToView = scheduledTasks.find(st => st.id === clickedScheduledTaskId);
      if (taskToView) {
        setSelectedScheduledTask(taskToView);
        setIsTaskDetailsDialogOpen(true);
      } else {
        setSelectedScheduledTask(null); 
        setIsTaskDetailsDialogOpen(false);
      }
    }
  };

  const handleSaveScheduledTaskDetails = (taskId: string, newHours: number, newTags: string[]) => {
    setScheduledTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, hours: newHours, tags: newTags } : task
      )
    );
    setIsTaskDetailsDialogOpen(false);
    setSelectedScheduledTask(null); 
    const scheduledTaskInfo = scheduledTasks.find(st => st.id === taskId);
    const updatedTaskDefinition = tasks.find(t => t.id === scheduledTaskInfo?.taskId);
    toast({
      title: "Task Updated",
      description: `Details for task "${updatedTaskDefinition?.name || 'Task'}" have been updated.`,
    });
  };

  const handleDeleteScheduledTask = (scheduledTaskId: string) => {
    const taskToDelete = scheduledTasks.find(st => st.id === scheduledTaskId);
    if (!taskToDelete) return;

    const taskDefinition = tasks.find(t => t.id === taskToDelete.taskId);
    const employee = employees.find(e => e.id === taskToDelete.employeeId);

    setScheduledTasks(prevTasks => prevTasks.filter(task => task.id !== scheduledTaskId));
    setSelectedScheduledTaskIds(prevIds => prevIds.filter(id => id !== scheduledTaskId)); 
    setIsTaskDetailsDialogOpen(false);
    setSelectedScheduledTask(null);
    toast({
      title: "Scheduled Task Deleted",
      description: `Task "${taskDefinition?.name || 'Task'}" for ${employee?.firstName || 'employee'} on ${format(new Date(taskToDelete.date), 'MMM d')} has been deleted.`,
      variant: "destructive"
    });
  };

  const handleOpenAssignEmployeeDialog = (taskId: string, date: Date) => {
    const task = tasks.find(t => t.id === taskId); 
    const employeesForAssignment = selectedWarehouseCode 
        ? activeEmployees.filter(emp => emp.warehouseCode === selectedWarehouseCode)
        : activeEmployees;

    if (employeesForAssignment.length === 0) {
        toast({
            title: "No Employees Available",
            description: `No active employees found${selectedWarehouseCode ? ` in warehouse ${selectedWarehouseCode}` : ''} to assign this task.`,
            variant: "default"
        });
        return;
    }

    setPendingTaskAssignmentData({
      taskId,
      date: format(date, 'yyyy-MM-dd'),
      taskName: task?.name || 'Unknown Task'
    });
    setIsAssignEmployeeDialogOpen(true);
  };

  const handleConfirmEmployeeAssignment = (employeeId: string) => {
    if (pendingTaskAssignmentData) {
      const dummyDragEvent = {
        dataTransfer: {
          getData: (formatType: string) => {
            if (formatType === 'application/json') {
              return JSON.stringify({ type: 'new-task', id: pendingTaskAssignmentData.taskId });
            }
            return '';
          }
        },
        preventDefault: () => {},
      } as unknown as React.DragEvent<HTMLDivElement>;

      handleDropTask(employeeId, pendingTaskAssignmentData.date, dummyDragEvent);
      setIsAssignEmployeeDialogOpen(false);
      setPendingTaskAssignmentData(null);
    }
  };
  
  const activeDate = currentView === 'weekly' ? currentWeekDate : currentMonthDate;

  const escapeCSVField = (field: string | number | boolean | undefined | null): string => {
    if (field === undefined || field === null) {
      return '""'; 
    }
    const strField = String(field);
    if (strField.includes(',') || strField.includes('"') || strField.includes('\n') || strField.includes('\r')) {
      return `"${strField.replace(/"/g, '""')}"`; 
    }
    return strField;
  };

  const generateScheduleCSV = () => {
    const headers = ["Date", "Employee ID", "Employee First Name", "Employee Last Name", "Warehouse Code", "Task Name", "Task Status", "Hours", "Tags"];
    let csvContent = headers.map(header => escapeCSVField(header)).join(",") + "\n";

    const sortedScheduledTasks = [...filteredScheduledTasks].sort((a, b) => { // Use filteredScheduledTasks
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;
      return a.employeeId.localeCompare(b.employeeId);
    });

    sortedScheduledTasks.forEach(st => {
      const employee = employees.find(e => e.id === st.employeeId);
      const task = tasks.find(t => t.id === st.taskId);
      const row = [
        st.date, 
        employee?.id,
        employee?.firstName,
        employee?.lastName,
        employee?.warehouseCode,
        task?.name,
        st.status || 'Scheduled', 
        st.hours,
        (st.tags || []).join(' | ') 
      ].map(field => escapeCSVField(field)).join(',');
      csvContent += row + "\n";
    });
    return csvContent;
  };

  const handleExportCSV = () => {
    if (filteredScheduledTasks.length === 0) { // Use filteredScheduledTasks
        toast({
            title: "No Data to Export",
            description: "There are no scheduled tasks matching the current filters to export.",
            variant: "default",
        });
        return;
    }
    const csvString = generateScheduleCSV();
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) { 
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const fileName = `schedule_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); 
      toast({ title: "Schedule Exported", description: `Successfully exported to ${fileName}.` });
    } else {
      toast({ title: "Export Failed", description: "Your browser doesn't support this feature.", variant: "destructive" });
    }
  };

  const generateEmployeesCSV = () => {
    const headers = ["Employee ID", "First Name", "Last Name", "Warehouse Code", "Status", "Created At"];
    let csvContent = headers.map(header => escapeCSVField(header)).join(",") + "\n";

    const sortedEmployees = [...employees].sort((a, b) => a.id.localeCompare(b.id));

    sortedEmployees.forEach(emp => {
      const row = [
        emp.id,
        emp.firstName,
        emp.lastName,
        emp.warehouseCode,
        emp.isActive ? 'Active' : 'Inactive',
        isValid(new Date(emp.createdAt)) ? format(new Date(emp.createdAt), 'yyyy-MM-dd HH:mm:ss') : '' 
      ].map(field => escapeCSVField(field)).join(',');
      csvContent += row + "\n";
    });
    return csvContent;
  };

  const handleExportEmployeesCSV = () => {
    if (employees.length === 0) {
        toast({
            title: "No Data to Export",
            description: "There are no employees to export.",
            variant: "default",
        });
        return;
    }
    const csvString = generateEmployeesCSV();
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const fileName = `employees_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Employee List Exported", description: `Successfully exported to ${fileName}.` });
    } else {
      toast({ title: "Export Failed", description: "Your browser doesn't support this feature.", variant: "destructive" });
    }
  };

  const handleWarehouseFilterChange = (warehouseCode: string | null) => {
    setSelectedWarehouseCode(warehouseCode);
    setSelectedEmployeeId(null); // Reset employee filter when warehouse changes
  };

  const handleClearSelections = () => {
    setSelectedScheduledTaskIds([]);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isTaskDetailsDialogOpen) {
          setIsTaskDetailsDialogOpen(false);
          setSelectedScheduledTask(null);
        } else if (isAssignEmployeeDialogOpen) {
          setIsAssignEmployeeDialogOpen(false);
          setPendingTaskAssignmentData(null);
        } else if (isTaskDialogOpen) {
          setIsTaskDialogOpen(false);
        } else if (isEmployeeDialogOpen) {
          setIsEmployeeDialogOpen(false);
        } else if (selectedScheduledTaskIds.length > 0) {
          setSelectedScheduledTaskIds([]);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTaskDetailsDialogOpen, isAssignEmployeeDialogOpen, isTaskDialogOpen, isEmployeeDialogOpen, selectedScheduledTaskIds.length]);


  return (
      <div ref={mainContainerRef} className="flex h-screen max-h-screen flex-col p-4 gap-4 bg-secondary/50">
        <h1 className="text-3xl font-bold text-primary">TimeWise Scheduler</h1>
        <div className="flex flex-grow gap-4 overflow-hidden">
          <TaskSidebar 
            tasks={tasks} 
            onDragTaskStart={(event, taskId, type) => handleDragTaskStart(event, taskId, type)} 
          />
          <div className="flex flex-1 flex-col gap-0 overflow-hidden"> 
            <HeaderControls
              currentView={currentView}
              onViewChange={(view) => { setCurrentView(view); setSelectedScheduledTaskIds([]); }} 
              currentDate={activeDate} 
              onPrev={handlePrev}
              onNext={handleNext}
              onToday={handleToday}
              onSetDate={handleSetDate}
              onManageTasks={() => setIsTaskDialogOpen(true)}
              onManageEmployees={() => setIsEmployeeDialogOpen(true)}
              employees={activeEmployeesForDropdown} // Use employees filtered for dropdown
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeFilterChange={setSelectedEmployeeId}
              allUniqueWarehouseCodes={allUniqueWarehouseCodes}
              selectedWarehouseCode={selectedWarehouseCode}
              onWarehouseFilterChange={handleWarehouseFilterChange}
              onExportCSV={handleExportCSV} 
            />
            <div className="flex-1 overflow-hidden h-full">
              <div className={cn('h-full w-full', currentView === 'weekly' ? 'flex' : 'hidden')}>
                <WeeklyView
                  employees={activeEmployeesForViews} // Use employees filtered for view
                  tasks={tasks}
                  scheduledTasks={filteredScheduledTasks} // Use filtered tasks
                  currentDate={currentWeekDate} 
                  onDropTask={handleDropTask}
                  selectedEmployeeId={selectedEmployeeId}
                  onTaskClick={handleScheduledTaskClick}
                  selectedScheduledTaskIds={selectedScheduledTaskIds}
                  onTaskDragStart={handleDragTaskStart}
                  onClearSelections={handleClearSelections}
                />
              </div>
              <div className={cn('h-full w-full', currentView === 'monthly' ? 'flex' : 'hidden')}>
                <MonthlyView
                  employees={activeEmployeesForViews} // Use employees filtered for view
                  tasks={tasks}
                  scheduledTasks={filteredScheduledTasks} // Use filtered tasks
                  currentDate={currentMonthDate} 
                  onDateClick={handleMonthlyDateClick}
                  selectedEmployeeId={selectedEmployeeId} // Still needed for cell-level task filtering display
                  onDropTaskToCell={handleOpenAssignEmployeeDialog} 
                  onScheduledTaskItemClick={handleScheduledTaskClick} 
                  selectedScheduledTaskIds={selectedScheduledTaskIds}
                  onTaskDragStart={handleDragTaskStart} 
                  onMoveExistingTasksInMonthlyView={handleMoveScheduledTasksInMonthlyView} 
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
          employees={employees} // Full list for management
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onDeleteEmployee={handleDeleteEmployee} 
          onExportEmployeesCSV={handleExportEmployeesCSV}
          onImportEmployees={handleImportEmployees}
        />
        <ScheduledTaskDetailsDialog
          isOpen={isTaskDetailsDialogOpen}
          onOpenChange={(open) => {
            setIsTaskDetailsDialogOpen(open);
            if (!open) {
                if (selectedScheduledTaskIds.length <= 1) { // Keep dialog if multiple selected, but dialog focuses on one.
                    setSelectedScheduledTask(null);
                }
            } 
          }}
          scheduledTask={selectedScheduledTask}
          employees={employees} // Full list for details
          tasks={tasks}
          onSave={handleSaveScheduledTaskDetails}
          onDelete={handleDeleteScheduledTask}
        />
        <AssignEmployeeDialog
          isOpen={isAssignEmployeeDialogOpen}
          onOpenChange={setIsAssignEmployeeDialogOpen}
          employees={activeEmployeesForDropdown} // Use employees filtered for assignment matching current WH filter
          taskName={pendingTaskAssignmentData?.taskName}
          date={pendingTaskAssignmentData?.date}
          onSubmit={handleConfirmEmployeeAssignment}
        />
      </div>
  );
}
