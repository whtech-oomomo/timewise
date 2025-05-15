
'use client';

import type { ScheduledTask, Employee, Task } from '@/lib/types';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ScheduledTaskDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  scheduledTask: ScheduledTask | null;
  employees: Employee[];
  tasks: Task[];
  onSave?: (taskId: string, newHours: number) => void;
}

export function ScheduledTaskDetailsDialog({
  isOpen,
  onOpenChange,
  scheduledTask,
  employees,
  tasks,
  onSave,
}: ScheduledTaskDetailsDialogProps) {
  const [editableHours, setEditableHours] = useState<string>((scheduledTask?.hours || 8).toString());

  useEffect(() => {
    if (scheduledTask) {
      setEditableHours((scheduledTask.hours || 8).toString());
    } else {
      setEditableHours("8"); // Default if no task is selected (e.g., dialog reset)
    }
  }, [scheduledTask]);

  if (!scheduledTask) {
    return null;
  }

  const employee = employees.find(e => e.id === scheduledTask.employeeId);
  const task = tasks.find(t => t.id === scheduledTask.taskId);
  const employeeFullName = employee ? `${employee.firstName} ${employee.lastName}` : 'N/A';

  const handleSaveClick = () => {
    if (onSave && scheduledTask) {
      const hours = parseInt(editableHours, 10);
      if (!isNaN(hours) && hours > 0) {
        onSave(scheduledTask.id, hours);
      } else {
        // Optionally, add a toast here for invalid hours input
        console.error("Invalid hours input");
      }
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableHours(e.target.value);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            {onSave ? "Review and update task details." : "Viewing details for the scheduled task."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskIdDisplay" className="text-right whitespace-nowrap">
              Scheduled ID
            </Label>
            <div id="taskIdDisplay" className="col-span-3 text-sm p-2 bg-muted rounded-md break-all">
              {scheduledTask.id}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskNameDisplay" className="text-right">
              Task Name
            </Label>
            <div id="taskNameDisplay" className="col-span-3 text-sm p-2 bg-muted rounded-md">
              {task?.name || 'N/A'}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employeeNameDisplay" className="text-right">
              Employee
            </Label>
            <div id="employeeNameDisplay" className="col-span-3 text-sm p-2 bg-muted rounded-md">
              {employeeFullName} {employee ? `(ID: ${employee.id.substring(0,8)})` : '(ID: N/A)'}
              {!employee?.isActive && employee && <Badge variant="outline" className="ml-2 text-xs">Inactive</Badge>}
            </div>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskDateDisplay" className="text-right">
              Date
            </Label>
            <div id="taskDateDisplay" className="col-span-3 text-sm p-2 bg-muted rounded-md">
              {format(new Date(scheduledTask.date), 'MMMM d, yyyy')}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskHours" className="text-right">
              Hours
            </Label>
            {onSave ? (
              <Input
                id="taskHours"
                type="number"
                value={editableHours}
                onChange={handleHoursChange}
                className="col-span-3"
                min="0.5" 
                step="0.5"
              />
            ) : (
              <div className="col-span-3 text-sm p-2 bg-muted rounded-md">
                {scheduledTask.hours || 'N/A'}
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskStatusDisplay" className="text-right">
              Status
            </Label>
            <div id="taskStatusDisplay" className="col-span-3">
              <Badge variant={scheduledTask.status === 'Scheduled' ? 'secondary' : 'default'}>
                {scheduledTask.status || 'N/A'}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {onSave ? "Cancel" : "Close"}
          </Button>
          {onSave && (
            <Button onClick={handleSaveClick}>
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
