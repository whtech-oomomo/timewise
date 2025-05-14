'use client';

import type { Task, ScheduledTask } from '@/lib/types';
import React from 'react'; // Added React import
import { Calendar } from '@/components/ui/calendar'; // Using shadcn calendar for base
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScheduledTaskDisplayItem } from './scheduled-task-display-item';
import { getTaskIcon } from '@/components/icons/task-icon-map';
import { format, isSameMonth, isSameDay, getDaysInMonth } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

interface MonthlyViewProps {
  tasks: Task[]; // All available tasks for lookup
  scheduledTasks: ScheduledTask[];
  currentDate: Date; // Any date within the target month
  onDateClick: (date: Date) => void; // To switch to weekly view or show details
  selectedEmployeeId: string | null;
}

export function MonthlyView({
  tasks,
  scheduledTasks,
  currentDate,
  onDateClick,
  selectedEmployeeId
}: MonthlyViewProps) {
  
  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);

  const tasksForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return scheduledTasks
      .filter(st => st.date === dateStr && (!selectedEmployeeId || st.employeeId === selectedEmployeeId))
      .map(st => getTaskById(st.taskId))
      .filter(task => task !== undefined) as Task[];
  };

  const DayCell = ({ date }: { date: Date }) => {
    const dayTasks = tasksForDay(date);
    const isCurrentMonth = isSameMonth(date, currentDate);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div 
            className={`h-24 border border-border p-1.5 flex flex-col cursor-pointer hover:bg-secondary/50 ${isCurrentMonth ? 'bg-background' : 'bg-muted/50'}`}
            onClick={() => onDateClick(date)}
          >
            <span className={`text-xs font-medium ${isSameDay(date, new Date()) ? 'text-primary font-bold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
              {format(date, 'd')}
            </span>
            {dayTasks.length > 0 && (
              <div className="mt-1 space-y-0.5 overflow-y-auto max-h-[60px] flex-grow">
                {dayTasks.slice(0, 2).map(task => (
                  <div key={task.id} className={`text-[10px] p-0.5 rounded-sm truncate ${task.colorClasses} flex items-center gap-1`}>
                    {React.createElement(getTaskIcon(task.iconName), {className:"w-2.5 h-2.5 shrink-0"})}
                    <span className="truncate">{task.name}</span>
                  </div>
                ))}
                {dayTasks.length > 2 && (
                   <Badge variant="secondary" className="text-[9px] p-0.5 mt-0.5">+{dayTasks.length - 2} more</Badge>
                )}
              </div>
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
                <ScheduledTaskDisplayItem key={task.id} task={task} isCompact={false} />
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
          mode="default" // Using default mode and custom day rendering
          month={currentDate}
          className="w-full p-0"
          components={{
            Day: DayCell, // Custom Day component
          }}
          classNames={{
            head_cell: "w-1/7 text-muted-foreground rounded-md font-normal text-[0.8rem] border-b",
            cell: "w-1/7 h-24 p-0 m-0 border-r last:border-r-0", // Full width cell
            row: "flex w-full mt-0 border-b last:border-b-0", // Override mt-2 default
            table: "w-full border-collapse space-y-0", // Override space-y-1
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
