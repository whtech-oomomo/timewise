
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
import { Trash2 } from 'lucide-react';

interface ScheduledTaskDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  scheduledTask: ScheduledTask | null;
  employees: Employee[];
  tasks: Task[];
  onSave?: (taskId: string, newHours: number, newTags: string[]) => void;
  onDelete?: (scheduledTaskId: string) => void;
}

export function ScheduledTaskDetailsDialog({
  isOpen,
  onOpenChange,
  scheduledTask,
  employees,
  tasks,
  onSave,
  onDelete,
}: ScheduledTaskDetailsDialogProps) {
  const [editableHours, setEditableHours] = useState<string>((scheduledTask?.hours || 8).toString());
  const [editableTagsString, setEditableTagsString] = useState<string>((scheduledTask?.tags || []).join(', '));


  useEffect(() => {
    if (scheduledTask) {
      setEditableHours((scheduledTask.hours || 8).toString());
      setEditableTagsString((scheduledTask.tags || []).join(', '));
    } else {
      // Reset when no task is selected (dialog closed or task cleared)
      setEditableHours("8"); 
      setEditableTagsString("");
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
      const hours = parseFloat(editableHours);
      const tags = editableTagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      if (!isNaN(hours) && hours >= 0.5) { 
        onSave(scheduledTask.id, hours, tags);
      } else {
        // Optionally, add a toast here for invalid hours input
        console.error("Invalid hours input. Must be at least 0.5.");
        // Consider not closing the dialog or showing an error message within it.
      }
    }
  };

  const handleDeleteClick = () => {
    if (onDelete && scheduledTask) {
      onDelete(scheduledTask.id);
    }
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableHours(e.target.value);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTagsString(e.target.value);
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
            <Label htmlFor="taskTags" className="text-right">
              Tags
            </Label>
            {onSave ? (
              <Input
                id="taskTags"
                type="text"
                value={editableTagsString}
                onChange={handleTagsChange}
                className="col-span-3"
                placeholder="e.g., urgent, follow-up"
              />
            ) : (
              <div className="col-span-3 text-sm p-2 bg-muted rounded-md">
                {(scheduledTask.tags && scheduledTask.tags.length > 0) ? scheduledTask.tags.join(', ') : 'No tags'}
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
        <DialogFooter className="sm:justify-between">
          {onDelete && (
             <Button variant="destructive" onClick={handleDeleteClick} className="mr-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
                {onSave ? "Cancel" : "Close"}
            </Button>
            {onSave && (
                <Button onClick={handleSaveClick}>
                Save
                </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
