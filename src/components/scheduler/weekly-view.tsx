
'use client';

import type { Employee, Task, ScheduledTask } from '@/lib/types';
import { ScheduledTaskDisplayItem } from './scheduled-task-display-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { addDays, format, startOfWeek, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

interface WeeklyViewProps {
  employees: Employee[]; // All employees (active and inactive for display purposes)
  tasks: Task[]; 
  scheduledTasks: ScheduledTask[];
  currentDate: Date; 
  onDropTask: (employeeId: string, date: string, taskId: string) => void;
  selectedEmployeeId: string | null;
  onTaskClick: (scheduledTaskId: string) => void;
}

export function WeeklyView({
  employees,
  tasks,
  scheduledTasks,
  currentDate,
  onDropTask,
  selectedEmployeeId,
  onTaskClick,
}: WeeklyViewProps) {
  const [draggedOverCell, setDraggedOverCell] = useState<{ employeeId: string; date: string } | null>(null);

  const weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1; // Monday
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const daysInWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, employeeId: string, date: Date) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    const employee = employees.find(e => e.id === employeeId);
    if (taskId && employee && employee.isActive) { // Only allow dropping on active employees
      onDropTask(employeeId, format(date, 'yyyy-MM-dd'), taskId);
    }
    setDraggedOverCell(null);
  };

  const filteredEmployees = selectedEmployeeId
    ? employees.filter(emp => emp.id === selectedEmployeeId)
    : employees;

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
                <div className={cn(
                  "p-3 border-b border-r text-sm font-medium h-auto min-h-[80px] flex items-center justify-start sticky left-0 bg-background z-[5]",
                  !employee.isActive && "opacity-60 bg-muted/30"
                )}>
                  {employee.firstName} {employee.lastName}
                  {!employee.isActive && <span className="ml-2 text-xs text-muted-foreground">(Inactive)</span>}
                </div>
                {daysInWeek.map((day) => {
                  const cellDateStr = format(day, 'yyyy-MM-dd');
                  const tasksForCell = scheduledTasks.filter(
                    (st) => st.employeeId === employee.id && st.date === cellDateStr
                  );
                  const isCellDraggedOver = draggedOverCell?.employeeId === employee.id && draggedOverCell?.date === cellDateStr && employee.isActive;

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "p-2 border-b min-h-[80px] transition-colors duration-150",
                        isCellDraggedOver ? "bg-accent" : "bg-background",
                        employee.isActive && "hover:bg-secondary/50",
                        !employee.isActive && "bg-muted/20",
                        isToday(day) ? (employee.isActive ? "bg-primary/5" : "bg-primary/10") : ""
                      )}
                      onDragOver={employee.isActive ? handleDragOver : undefined}
                      onDrop={employee.isActive ? (e) => handleDrop(e, employee.id, day) : undefined}
                      onDragEnter={employee.isActive ? () => setDraggedOverCell({ employeeId: employee.id, date: cellDateStr }) : undefined}
                      onDragLeave={employee.isActive ? () => setDraggedOverCell(null) : undefined}
                    >
                      <div className="space-y-1">
                        {tasksForCell.map((st) => {
                          const taskDetail = getTaskById(st.taskId);
                          return taskDetail ? (
                            <ScheduledTaskDisplayItem
                              key={st.id}
                              task={taskDetail}
                              scheduledTaskId={st.id} 
                              onClick={onTaskClick}   
                            />
                          ) : null;
                        })}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
             {filteredEmployees.length === 0 && selectedEmployeeId && (
              <div className="col-span-8 p-6 text-center text-muted-foreground">
                Selected employee not found or no employees match the current filter.
              </div>
            )}
             {employees.length === 0 && !selectedEmployeeId && (
                <div className="col-span-8 p-6 text-center text-muted-foreground">
                    No employees have been added yet. Click "Manage Employees" to add them.
                </div>
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
