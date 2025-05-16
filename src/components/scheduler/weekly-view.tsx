
'use client';

import type { Employee, Task, ScheduledTask } from '@/lib/types';
import { ScheduledTaskDisplayItem } from './scheduled-task-display-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { addDays, format, startOfWeek, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

interface WeeklyViewProps {
  employees: Employee[];
  tasks: Task[];
  scheduledTasks: ScheduledTask[];
  currentDate: Date;
  onDropTask: (employeeId: string, date: string, event: React.DragEvent<HTMLDivElement>) => void;
  selectedEmployeeId: string | null;
  onTaskClick: (scheduledTaskId: string, event?: React.MouseEvent | React.KeyboardEvent) => void;
  selectedScheduledTaskIds: string[];
  onTaskDragStart: (event: React.DragEvent<HTMLDivElement>, scheduledTaskId: string, type: 'existing-scheduled-task') => void;
  onClearSelections: () => void;
}

export function WeeklyView({
  employees,
  tasks,
  scheduledTasks,
  currentDate,
  onDropTask,
  selectedEmployeeId,
  onTaskClick,
  selectedScheduledTaskIds,
  onTaskDragStart,
  onClearSelections,
}: WeeklyViewProps) {
  const [draggedOverCell, setDraggedOverCell] = useState<{ employeeId: string; date: string } | null>(null);
  const [clientToday, setClientToday] = useState<Date | null>(null);

  useEffect(() => {
    setClientToday(new Date());
  }, []);

  const weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1; // Monday
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const daysInWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleCellClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click target is the cell itself and not a task item within it
    if ((e.target as HTMLElement).getAttribute('data-is-task-item') !== 'true' && e.target === e.currentTarget) {
      onClearSelections();
    }
  };

  const activeEmployees = employees.filter(emp => emp.isActive);
  const employeesToRender = selectedEmployeeId
    ? activeEmployees.filter(emp => emp.id === selectedEmployeeId)
    : activeEmployees;

  const isDayToday = (day: Date): boolean => {
    return clientToday ? isSameDay(day, clientToday) : false;
  };

  return (
    <Card className="flex-1 rounded-b-lg shadow-md overflow-hidden h-full flex flex-col">
      <ScrollArea className="h-full">
        <CardContent className="p-0">
          <div className="grid grid-cols-[150px_repeat(7,1fr)]">
            {/* Header Row */}
            <div className="sticky top-0 z-10 p-3 font-semibold bg-muted border-b border-r text-sm">Employee</div>
            {daysInWeek.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "sticky top-0 z-10 p-3 text-center font-semibold bg-muted border-b border-r text-sm",
                  isDayToday(day) ? "text-primary font-bold" : ""
                )}
              >
                <div>{format(day, 'EEE')}</div>
                <div className="text-xs text-muted-foreground">{format(day, 'd')}</div>
              </div>
            ))}

            {/* Employee Rows */}
            {employeesToRender.map((employee) => (
              <React.Fragment key={employee.id}>
                <div className={cn(
                  "p-3 border-b border-r text-sm font-medium h-auto min-h-[80px] flex items-center justify-start sticky left-0 bg-background z-[5]"
                )}>
                  {employee.firstName} {employee.lastName}
                </div>
                {daysInWeek.map((day) => {
                  const cellDateStr = format(day, 'yyyy-MM-dd');
                  const tasksForCell = scheduledTasks.filter(
                    (st) => st.employeeId === employee.id && st.date === cellDateStr
                  );
                  const isCellDraggedOver = draggedOverCell?.employeeId === employee.id && draggedOverCell?.date === cellDateStr;

                  return (
                    <div
                      key={`${employee.id}-${day.toISOString()}`}
                      className={cn(
                        "p-2 border-b border-r min-h-[80px] transition-colors duration-150",
                        isCellDraggedOver ? "bg-accent" : "bg-background",
                        "hover:bg-secondary/50",
                        isDayToday(day) ? "bg-primary/5" : ""
                      )}
                      onDragOver={handleDragOver}
                      onDrop={(e) => { onDropTask(employee.id, cellDateStr, e); setDraggedOverCell(null); }}
                      onDragEnter={() => setDraggedOverCell({ employeeId: employee.id, date: cellDateStr })}
                      onDragLeave={() => setDraggedOverCell(null)}
                      onClick={handleCellClick}
                    >
                      <div className="space-y-1">
                        {tasksForCell.map((st) => {
                          const taskDetail = getTaskById(st.taskId);
                          return taskDetail ? (
                            <ScheduledTaskDisplayItem
                              key={st.id}
                              task={taskDetail}
                              scheduledTaskId={st.id}
                              onClick={(id, event) => onTaskClick(id, event)}
                              isSelected={selectedScheduledTaskIds.includes(st.id)}
                              onDragStart={(event) => onTaskDragStart(event, st.id, 'existing-scheduled-task')}
                            />
                          ) : null;
                        })}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            {/* Conditional rendering for empty states */}
            {employees.length === 0 && (
              <div className="col-span-8 p-6 text-center text-muted-foreground">
                  No employees have been added yet. Click "Manage Employees" to add them.
              </div>
            )}
            {employees.length > 0 && employeesToRender.length === 0 && (
              <div className="col-span-8 p-6 text-center text-muted-foreground">
                  No active employees match the current filter criteria.
              </div>
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

