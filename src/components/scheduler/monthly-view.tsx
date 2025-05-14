
'use client';

import type { Task, ScheduledTask } from '@/lib/types';
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
  tasks: Task[]; // All available tasks for lookup
  scheduledTasks: ScheduledTask[];
  currentDate: Date; // Any date within the target month
  onDateClick: (date: Date) => void; // To switch to weekly view or show details
  selectedEmployeeId: string | null;
  onDropTaskToCell: (taskId: string, date: Date) => void; // New prop for drop handling
}

export function MonthlyView({
  tasks,
  scheduledTasks,
  currentDate,
  onDateClick,
  selectedEmployeeId,
  onDropTaskToCell,
}: MonthlyViewProps) {
  
  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);
  const [draggedOverDate, setDraggedOverDate] = React.useState<string | null>(null);

  const tasksForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return scheduledTasks
      .filter(st => st.date === dateStr && (!selectedEmployeeId || st.employeeId === selectedEmployeeId))
      .map(st => getTaskById(st.taskId))
      .filter(task => task !== undefined) as Task[];
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

  const DayCell = ({ date }: { date: Date }) => {
    const dayTasks = tasksForDay(date);
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
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' 
            )}
            onClick={() => onDateClick(date)}
            onDragOver={(e) => handleDragOver(e, date)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, date)}
            role="button"
            aria-label={`View tasks for ${format(date, "MMMM d, yyyy")}`}
            tabIndex={0} 
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDateClick(date); }} 
          >
            <span className={cn(
                'text-xs font-medium self-start mb-1',
                isSameDay(date, new Date()) ? 'text-primary font-bold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {format(date, 'd')}
            </span>
            {dayTasks.length > 0 && (
              <ScrollArea className="flex-grow max-h-[100px] pr-1"> {/* Added ScrollArea for overflow */}
                <div className="space-y-0.5"> 
                  {dayTasks.map(task => ( 
                    <div key={task.id} className={`text-[10px] p-0.5 rounded-sm truncate ${task.colorClasses} flex items-center gap-1`} title={task.name}>
                      {React.createElement(getTaskIcon(task.iconName), {className:"w-2.5 h-2.5 shrink-0"})}
                      <span className="truncate">{task.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </PopoverTrigger>
        {dayTasks.length > 0 && (
          <PopoverContent className="w-60 p-0">
            <div className="p-2 border-b">
              <p className="text-sm font-semibold">{format(date, "MMM d, yyyy")}</p>
            </div>
            <ScrollArea className="max-h-60">
            <div className="p-2 space-y-1">
              {dayTasks.map(task => (
                // Assuming ScheduledTaskDisplayItem can be used here or a similar compact display.
                // For now, using the task details directly.
                 <div key={task.id} className={`text-xs p-1 rounded-sm ${task.colorClasses} flex items-center gap-1.5`}>
                    {React.createElement(getTaskIcon(task.iconName), {className:"w-3 h-3 shrink-0"})}
                    <span className="truncate">{task.name}</span>
                  </div>
              ))}
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
            Day: DayCell, 
          }}
          classNames={{
            head_cell: "flex-1 text-muted-foreground rounded-md font-normal text-[0.8rem] border-b",
            cell: "flex-1 p-0 m-0 border-r last:border-r-0 relative",
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
