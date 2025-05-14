
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
  employees: Employee[];
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
    setDraggedOverDate(format(date, 'yyyy-MM-dd'));
  };

  const handleDragLeave = () => {
    setDraggedOverDate(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, date: Date) => {
    event.preventDefault();
    setDraggedOverDate(null);
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTaskToCell(taskId, date);
    }
  };

  const DayCell = ({ date, dayProps }: { date: Date; dayProps: any }) => {
    const dayScheduledTasks = tasksForDay(date); 
    const isCurrentMonth = isSameMonth(date, currentDate);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCellDraggedOver = draggedOverDate === dateStr;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'min-h-[7rem] border border-border p-1.5 flex flex-col cursor-pointer hover:bg-secondary/60 transition-colors duration-150',
              isCurrentMonth ? 'bg-background' : 'bg-muted/40',
              isCellDraggedOver ? 'bg-accent ring-2 ring-accent-foreground' : '',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'relative' 
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
            aria-label={`View tasks for ${format(date, "MMMM d, yyyy")}`}
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
              <ScrollArea className="pr-1"> {/* Removed flex-grow */}
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
                        employeeName={employeeDetail?.name}
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
                 return (
                   <div key={st.id} className={`text-xs p-1 rounded-sm ${taskDetail.colorClasses} flex items-start gap-1.5`}>
                      {React.createElement(getTaskIcon(taskDetail.iconName), {className:"w-3 h-3 shrink-0 mt-0.5"})}
                      <span className="whitespace-normal break-words">
                        {employeeDetail?.name ? `${employeeDetail.name}: ` : ''}{taskDetail.name}
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
    <Card className="flex-1 rounded-b-lg shadow-md overflow-hidden">
      <CardContent className="p-0">
        <Calendar
          mode="default" 
          month={currentDate}
          className="w-full p-0"
          components={{
            Day: (props) => <DayCell date={props.date} dayProps={props} />, 
          }}
          classNames={{
            head_cell: "w-0 flex-1 text-muted-foreground rounded-md font-normal text-[0.8rem] border-b text-center", // Added text-center
            cell: "w-0 flex-1 p-0 m-0 border-r last:border-r-0 relative", // w-0 flex-1 for equal width
            row: "flex w-full mt-0 border-b last:border-b-0", 
            table: "w-full border-collapse space-y-0",
            months: "p-0",
            month: "space-y-0 p-0",
            caption_label: "text-lg",
            caption: "relative flex justify-center pt-2 items-center border-b pb-2",
          }}
        />
      </CardContent>
    </Card>
  );
}
