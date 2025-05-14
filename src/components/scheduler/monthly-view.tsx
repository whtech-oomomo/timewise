
'use client';

import type { Task, ScheduledTask, Employee } from '@/lib/types';
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScheduledTaskDisplayItem } from './scheduled-task-display-item';
import { getTaskIcon } from '@/components/icons/task-icon-map';
import { format, isSameMonth, isSameDay } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface MonthlyViewProps {
  employees: Employee[]; // All employees
  tasks: Task[]; 
  scheduledTasks: ScheduledTask[];
  currentDate: Date; 
  onDateClick: (date: Date) => void; 
  selectedEmployeeId: string | null;
  onDropTaskToCell: (taskId: string, date: Date) => void;
  onScheduledTaskItemClick: (scheduledTaskId: string) => void; 
}

export function MonthlyView({
  employees,
  tasks,
  scheduledTasks,
  currentDate,
  onDateClick,
  selectedEmployeeId,
  onDropTaskToCell,
  onScheduledTaskItemClick,
}: MonthlyViewProps) {
  
  const getTaskById = (taskId: string): Task | undefined => tasks.find(t => t.id === taskId);
  const getEmployeeById = (employeeId: string): Employee | undefined => employees.find(e => e.id === employeeId);
  const [draggedOverDate, setDraggedOverDate] = React.useState<string | null>(null);

  const tasksForDay = (day: Date): ScheduledTask[] => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return scheduledTasks.filter(
      st => st.date === dateStr && (!selectedEmployeeId || st.employeeId === selectedEmployeeId)
    );
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, date: Date) => {
    event.preventDefault();
    // Check if there are active employees before allowing drop indication
    const hasActiveEmployees = employees.some(emp => emp.isActive);
    if (hasActiveEmployees) {
      setDraggedOverDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleDragLeave = () => {
    setDraggedOverDate(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, date: Date) => {
    event.preventDefault();
    setDraggedOverDate(null);
    const taskId = event.dataTransfer.getData('text/plain');
    const hasActiveEmployees = employees.some(emp => emp.isActive);
    if (taskId && hasActiveEmployees) { // Only proceed if task and active employees exist
      onDropTaskToCell(taskId, date);
    }
  };

  const DayCell = ({ date, dayProps }: { date: Date; dayProps: any }) => {
    const dayScheduledTasks = tasksForDay(date); 
    const isCurrentMonth = isSameMonth(date, currentDate);
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasActiveEmployees = employees.some(emp => emp.isActive);
    const isCellDraggedOver = draggedOverDate === dateStr && hasActiveEmployees;


    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'h-full min-h-[7rem] border border-border p-1.5 flex flex-col',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'relative',
              isCurrentMonth ? 'bg-background' : 'bg-muted/40',
              isCellDraggedOver ? 'bg-accent ring-2 ring-accent-foreground' : (isCurrentMonth ? 'hover:bg-secondary/60' : 'hover:bg-muted/60'),
              'transition-colors duration-150'
            )}
            onClick={(e) => {
                if (e.target === e.currentTarget || 
                    ((e.target as HTMLElement).tagName === 'SPAN' && (e.target as HTMLElement).parentElement === e.currentTarget)) {
                    onDateClick(date);
                }
            }}
            onDragOver={(e) => handleDragOver(e, date)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, date)}
            role="button"
            aria-label={`View tasks for ${format(date, "MMMM d, yyyy")}, or click to switch to weekly view for this day.`}
            tabIndex={0} 
            onKeyDown={(e) => { 
              if ((e.key === 'Enter' || e.key === ' ') && 
                  (e.target === e.currentTarget || 
                  ((e.target as HTMLElement).tagName === 'SPAN' && (e.target as HTMLElement).parentElement === e.currentTarget))) {
                onDateClick(date);
              }
            }}
          >
            <span className={cn(
                'text-xs font-medium self-start mb-1',
                isSameDay(date, new Date()) ? 'text-primary font-bold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {format(date, 'd')}
            </span>
            {dayScheduledTasks.length > 0 && (
              <ScrollArea className="pr-1 flex-1"> 
                <div className="space-y-0.5"> 
                  {dayScheduledTasks.map(st => {
                    const taskDetail = getTaskById(st.taskId);
                    const employeeDetail = getEmployeeById(st.employeeId);
                    if (!taskDetail) return null;
                    return (
                      <ScheduledTaskDisplayItem
                        key={st.id}
                        task={taskDetail}
                        scheduledTaskId={st.id}
                        employeeName={employeeDetail ? `${employeeDetail.firstName} ${employeeDetail.lastName}` : undefined}
                        onClick={(id, event) => { 
                           onScheduledTaskItemClick(id);
                        }}
                        isCompact={true}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </PopoverTrigger>
        {dayScheduledTasks.length > 0 && (
          <PopoverContent className="w-64 p-0">
            <div className="p-2 border-b">
              <p className="text-sm font-semibold">{format(date, "MMMM d, yyyy")}</p>
            </div>
            <ScrollArea className="max-h-60">
            <div className="p-2 space-y-1">
              {dayScheduledTasks.map(st => {
                 const taskDetail = getTaskById(st.taskId);
                 const employeeDetail = getEmployeeById(st.employeeId);
                 if (!taskDetail) return null;
                 const employeeFullName = employeeDetail ? `${employeeDetail.firstName} ${employeeDetail.lastName}` : '';
                 return (
                   <div key={st.id} className={`text-xs p-1 rounded-sm ${taskDetail.colorClasses} flex items-start gap-1.5`}>
                      {React.createElement(getTaskIcon(taskDetail.iconName), {className:"w-3 h-3 shrink-0 mt-0.5"})}
                      <span className="whitespace-normal break-words">
                        {employeeFullName ? `${employeeFullName}: ` : ''}{taskDetail.name}
                      </span>
                    </div>
                 );
              })}
            </div>
            </ScrollArea>
          </PopoverContent>
        )}
      </Popover>
    );
  };

  return (
    <Card className="flex-1 rounded-b-lg shadow-md overflow-hidden h-full flex flex-col">
      <CardContent className="p-0 h-full flex flex-col">
        <Calendar
          mode="default" 
          month={currentDate}
          className="w-full p-0 flex-grow" // Ensure calendar takes up space
          components={{
            Day: (props) => <DayCell date={props.date} dayProps={props} />, 
          }}
          classNames={{
            head_cell: "w-0 flex-1 text-muted-foreground rounded-md font-normal text-[0.8rem] border-b text-center", 
            cell: "w-0 flex-1 p-0 m-0 border-r last:border-r-0 relative", // flex-1 and w-0 for equal width
            row: "flex w-full mt-0 border-b last:border-b-0", // flex to allow cells to stretch height
            table: "w-full border-collapse space-y-0 h-full flex flex-col", // Make table also flex col
            months: "p-0 flex-grow flex flex-col", // Ensure months and month take up space
            month: "space-y-0 p-0 flex-grow flex flex-col", // Make month flex column
            caption_label: "text-lg",
            caption: "relative flex justify-center pt-2 items-center border-b pb-2",
            body: "flex-grow flex flex-col", // Make body flex column to distribute row height
          }}
        />
      </CardContent>
    </Card>
  );
}
