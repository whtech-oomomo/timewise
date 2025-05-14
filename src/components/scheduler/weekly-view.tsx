'use client';

import type { Employee, Task, ScheduledTask } from '@/lib/types';
import { ScheduledTaskDisplayItem } from './scheduled-task-display-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { addDays, format, startOfWeek, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

interface WeeklyViewProps {
  employees: Employee[];
  tasks: Task[]; // All available tasks for lookup
  scheduledTasks: ScheduledTask[];
  currentDate: Date; // Any date within the target week
  onDropTask: (employeeId: string, date: string, taskId: string) => void;
  selectedEmployeeId: string | null;
}

export function WeeklyView({
  employees,
  tasks,
  scheduledTasks,
  currentDate,
  onDropTask,
  selectedEmployeeId,
}: WeeklyViewProps) {
  const [draggedOverCell, setDraggedOverCell] = useState<{ employeeId: string; date: string } | null>(null);
  
  const weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1; // Monday
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const daysInWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow drop
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, employeeId: string, date: Date) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(employeeId, format(date, 'yyyy-MM-dd'), taskId);
    }
    setDraggedOverCell(null);
  };

  const filteredEmployees = selectedEmployeeId 
    ? employees.filter(emp => emp.id === selectedEmployeeId)
    : employees;

  return (
    <Card className="flex-1 rounded-b-lg shadow-md overflow-hidden">
      <ScrollArea className="h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
        <CardContent className="p-0">
          <div className="grid grid-cols-[150px_repeat(7,1fr)]"> {/* Employee name col + 7 day cols */}
            {/* Header Row */}
            <div className="sticky top-0 z-10 p-3 font-semibold bg-muted border-b border-r text-sm">Employee</div>
            {daysInWeek.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "sticky top-0 z-10 p-3 text-center font-semibold bg-muted border-b text-sm",
                  isToday(day) ? "text-primary font-bold" : ""
                )}
              >
                <div>{format(day, 'EEE')}</div>
                <div className="text-xs text-muted-foreground">{format(day, 'd')}</div>
              </div>
            ))}

            {/* Employee Rows */}
            {filteredEmployees.map((employee) => (
              <React.Fragment key={employee.id}>
                <div className="p-3 border-b border-r text-sm font-medium h-auto min-h-[80px] flex items-center justify-start sticky left-0 bg-background z-[5]">
                  {employee.name}
                </div>
                {daysInWeek.map((day) => {
                  const cellDateStr = format(day, 'yyyy-MM-dd');
                  const tasksForCell = scheduledTasks.filter(
                    (st) => st.employeeId === employee.id && st.date === cellDateStr
                  );
                  const isCellDraggedOver = draggedOverCell?.employeeId === employee.id && draggedOverCell?.date === cellDateStr;

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "p-2 border-b min-h-[80px] transition-colors duration-150",
                        isCellDraggedOver ? "bg-accent" : "bg-background hover:bg-secondary/50",
                        isToday(day) ? "bg-primary/5" : ""
                      )}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, employee.id, day)}
                      onDragEnter={() => setDraggedOverCell({ employeeId: employee.id, date: cellDateStr })}
                      onDragLeave={() => setDraggedOverCell(null)}

                    >
                      <div className="space-y-1">
                        {tasksForCell.map((st) => {
                          const taskDetail = getTaskById(st.taskId);
                          return taskDetail ? (
                            <ScheduledTaskDisplayItem key={st.id} task={taskDetail} />
                          ) : null;
                        })}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
             {filteredEmployees.length === 0 && (
              <div className="col-span-8 p-6 text-center text-muted-foreground">
                No employees match the current filter.
              </div>
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
