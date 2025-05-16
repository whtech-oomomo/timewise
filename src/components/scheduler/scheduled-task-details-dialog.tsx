
'use client';

import type { ScheduledTask, Employee, Task } from '@/lib/types';
import React, { useState, useEffect } from 'react';
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
import { Trash2, X as XIcon } from 'lucide-react'; // Removed Check icon, not used in this version

// Removed Popover and Command imports
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
// import { cn } from '@/lib/utils'; // cn might not be needed if complex styling is removed

interface ScheduledTaskDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  scheduledTask: ScheduledTask | null;
  employees: Employee[];
  tasks: Task[];
  onSave?: (taskId: string, newHours: number, newTags: string[]) => void;
  onDelete?: (scheduledTaskId: string) => void;
  // allUniqueTags prop is removed as this version doesn't use it
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
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');

  useEffect(() => {
    if (scheduledTask) {
      setEditableHours((scheduledTask.hours || 8).toString());
      setCurrentTags(scheduledTask.tags || []);
    } else {
      setEditableHours("8");
      setCurrentTags([]);
    }
    setTagInputValue(''); // Reset tag input when task changes or dialog closes/opens
  }, [scheduledTask, isOpen]);

  if (!scheduledTask) {
    return null;
  }

  const employee = employees.find(e => e.id === scheduledTask.employeeId);
  const task = tasks.find(t => t.id === scheduledTask.taskId);
  const employeeFullName = employee ? `${employee.firstName} ${employee.lastName}` : 'N/A';

  const handleSaveClick = () => {
    if (onSave && scheduledTask) {
      const hours = parseFloat(editableHours);
      let finalTags = [...currentTags];
      if (tagInputValue.trim() && !finalTags.includes(tagInputValue.trim())) {
        finalTags.push(tagInputValue.trim());
      }
      finalTags = finalTags.filter((tag, index, self) => tag && self.indexOf(tag) === index); // Deduplicate just in case

      if (!isNaN(hours) && hours >= 0.5) {
        onSave(scheduledTask.id, hours, finalTags);
      } else {
        console.error("Invalid hours input. Must be at least 0.5.");
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

  const handleAddTag = () => {
    const newTag = tagInputValue.trim();
    if (newTag && !currentTags.includes(newTag)) {
      setCurrentTags(prevTags => [...prevTags, newTag]);
    }
    setTagInputValue(''); // Clear input after adding
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCurrentTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
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
          {/* ... other fields like Scheduled ID, Task Name, Employee, Date ... */}
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

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="taskTagsInput" className="text-right pt-2">
              Tags
            </Label>
            <div className="col-span-3 space-y-2">
              {onSave ? (
                <>
                  <div className="flex flex-wrap gap-1 mb-2 empty:mb-0 min-h-[24px]">
                    {currentTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          aria-label={`Remove tag ${tag}`}
                          onClick={() => handleRemoveTag(tag)}
                          className="rounded-full hover:bg-muted-foreground/20 p-0.5 ml-1"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="taskTagsInput"
                      type="text"
                      value={tagInputValue}
                      onChange={(e) => setTagInputValue(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Add tag and press Enter or ,"
                      className="flex-grow"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-sm p-2 bg-muted rounded-md min-h-[40px]">
                  {(currentTags && currentTags.length > 0) ? (
                    <div className="flex flex-wrap gap-1">
                      {currentTags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  ) : 'No tags'}
                </div>
              )}
            </div>
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
            <Button variant="outline" onClick={() => { onOpenChange(false); } }>
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
    