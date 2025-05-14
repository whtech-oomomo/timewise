
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
            className={`min-h-[6rem] border border-border p-1.5 flex flex-col cursor-pointer hover:bg-secondary/50 ${isCurrentMonth ? 'bg-background' : 'bg-muted/50'}`}
            onClick={() => onDateClick(date)}
            role="button" 
            tabIndex={0} 
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDateClick(date); }} 
          >
            <span className={`text-xs font-medium self-start ${isSameDay(date, new Date()) ? 'text-primary font-bold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
              {format(date, 'd')}
            </span>
            {dayTasks.length > 0 && (
              <div className="mt-1 space-y-0.5 flex-grow"> 
                {dayTasks.map(task => ( 
                  <div key={task.id} className={`text-[10px] p-0.5 rounded-sm truncate ${task.colorClasses} flex items-center gap-1`} title={task.name}>
                    {React.createElement(getTaskIcon(task.iconName), {className:"w-2.5 h-2.5 shrink-0"})}
                    <span className="truncate">{task.name}</span>
                  </div>
                ))}
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
          mode="default"
          month={currentDate}
          className="w-full p-0"
          components={{
            Day: DayCell, 
          }}
          classNames={{
            head_cell: "flex-1 text-muted-foreground rounded-md font-normal text-[0.8rem] border-b", // Changed w-1/7 to flex-1
            cell: "flex-1 p-0 m-0 border-r last:border-r-0 relative", // Changed w-1/7 to flex-1
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
