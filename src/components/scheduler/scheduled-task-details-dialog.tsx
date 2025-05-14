
'use client';

import type { ScheduledTask, Employee, Task } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';

interface ScheduledTaskDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  scheduledTask: ScheduledTask | null;
  employees: Employee[];
  tasks: Task[];
}

export function ScheduledTaskDetailsDialog({
  isOpen,
  onOpenChange,
  scheduledTask,
  employees,
  tasks,
}: ScheduledTaskDetailsDialogProps) {
  if (!scheduledTask) {
    return null;
  }

  const employee = employees.find(e => e.id === scheduledTask.employeeId);
  const task = tasks.find(t => t.id === scheduledTask.taskId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            Viewing details for the scheduled task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskId" className="text-right">
              Scheduled ID
            </Label>
            <div id="taskId" className="col-span-3 text-sm p-2 bg-muted rounded-md break-all">
              {scheduledTask.id}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskName" className="text-right">
              Task Name
            </Label>
            <div id="taskName" className="col-span-3 text-sm p-2 bg-muted rounded-md">
              {task?.name || 'N/A'}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employeeName" className="text-right">
              Employee
            </Label>
            <div id="employeeName" className="col-span-3 text-sm p-2 bg-muted rounded-md">
              {employee?.name || 'N/A'} (ID: {scheduledTask.employeeId})
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskStatus" className="text-right">
              Status
            </Label>
            <div id="taskStatus" className="col-span-3">
              <Badge variant={scheduledTask.status === 'Scheduled' ? 'secondary' : 'default'}>
                {scheduledTask.status || 'N/A'}
              </Badge>
            </div>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskDate" className="text-right">
              Date
            </Label>
            <div id="taskDate" className="col-span-3 text-sm p-2 bg-muted rounded-md">
              {scheduledTask.date}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
