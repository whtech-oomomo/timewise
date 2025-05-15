
'use client';

import type { Task, TaskFormData } from '@/lib/types';
import React from 'react'; 
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { availableIcons, availableColors, getTaskIcon } from '@/components/icons/task-icon-map';
import { Trash2, Edit3, PlusCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const taskFormSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(50, 'Task name is too long'),
  iconName: z.string().min(1, 'Icon is required'),
  colorClasses: z.string().min(1, 'Color is required'),
  defaultHours: z.coerce.number().min(0.5, "Default hours must be at least 0.5").optional().default(8),
});

interface ManageTasksDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  onAddTask: (taskData: TaskFormData) => void;
  onUpdateTask: (taskId: string, taskData: TaskFormData) => void;
  onDeleteTask: (taskId: string) => void;
}

export function ManageTasksDialog({
  isOpen,
  onOpenChange,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: ManageTasksDialogProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: '',
      iconName: availableIcons[0]?.name || '',
      colorClasses: availableColors[0]?.classes || '',
      defaultHours: 8,
    },
  });

  useEffect(() => {
    if (editingTask) {
      setValue('name', editingTask.name);
      setValue('iconName', editingTask.iconName);
      setValue('colorClasses', editingTask.colorClasses);
      setValue('defaultHours', editingTask.defaultHours || 8);
    } else {
      reset({
        name: '',
        iconName: availableIcons[0]?.name || '',
        colorClasses: availableColors[0]?.classes || '',
        defaultHours: 8,
      });
    }
  }, [editingTask, reset, setValue]);

  const onSubmit = (data: TaskFormData) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, data);
      toast({ title: "Task Updated", description: `Task "${data.name}" has been updated.` });
    } else {
      onAddTask(data);
      toast({ title: "Task Added", description: `Task "${data.name}" has been added.` });
    }
    setEditingTask(null);
    reset();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleDelete = (taskId: string) => {
    onDeleteTask(taskId);
    toast({ title: "Task Deleted", description: "The task has been deleted.", variant: "destructive" });
    if (editingTask?.id === taskId) {
      setEditingTask(null);
      reset();
    }
  };
  
  const handleDialogClose = () => {
    setEditingTask(null);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {editingTask ? 'Update the details of the task.' : 'Define a new task to be scheduled.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4 flex-grow overflow-hidden">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Task Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input id="name" {...field} placeholder="e.g., Client Meeting" />}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="iconName">Icon</Label>
              <Controller
                name="iconName"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || availableIcons[0]?.name}>
                    <SelectTrigger id="iconName">
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIcons.map((icon) => (
                        <SelectItem key={icon.name} value={icon.name}>
                          <div className="flex items-center gap-2">
                            {React.createElement(getTaskIcon(icon.name), {className: "h-4 w-4"})}
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.iconName && <p className="text-sm text-destructive">{errors.iconName.message}</p>}
            </div>
            <div>
              <Label htmlFor="colorClasses">Color</Label>
              <Controller
                name="colorClasses"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || availableColors[0]?.classes}>
                    <SelectTrigger id="colorClasses">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColors.map((color) => (
                        <SelectItem key={color.classes} value={color.classes}>
                           <div className="flex items-center gap-2">
                            <span className={`h-4 w-4 rounded-full ${color.classes.split(' ')[0]}`}></span>
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.colorClasses && <p className="text-sm text-destructive">{errors.colorClasses.message}</p>}
            </div>
            <div>
              <Label htmlFor="defaultHours">Default Hours</Label>
              <Controller
                name="defaultHours"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="defaultHours" 
                    type="number" 
                    {...field} 
                    value={field.value ?? ''} // Handle undefined for input value
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} // Coerce to number or undefined
                    placeholder="e.g., 8" 
                    min="0.5"
                    step="0.5"
                  />
                )}
              />
              {errors.defaultHours && <p className="text-sm text-destructive">{errors.defaultHours.message}</p>}
            </div>
             <DialogFooter className="pt-4 col-span-1 md:col-span-2">
                <Button type="submit" className="w-full md:w-auto">
                  {editingTask ? <><Edit3 className="mr-2 h-4 w-4" /> Update Task</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Task</>}
                </Button>
                {editingTask && (
                  <Button type="button" variant="outline" onClick={() => { setEditingTask(null); reset(); }} className="w-full md:w-auto">
                    Cancel Edit
                  </Button>
                )}
              </DialogFooter>
          </div>

          {/* Right: Task List */}
          <div className="flex flex-col overflow-hidden h-full max-h-[60vh] md:max-h-none">
            <h3 className="text-md font-semibold mb-2">Existing Tasks ({tasks.length})</h3>
            <ScrollArea className="border rounded-md p-2 flex-grow">
              {tasks.length > 0 ? (
                <ul className="space-y-2">
                  {tasks.slice().sort((a,b) => a.name.localeCompare(b.name)).map((task) => {
                    const IconComponent = getTaskIcon(task.iconName);
                    return (
                      <li
                        key={task.id}
                        className={`flex items-center justify-between p-2 rounded-md ${task.colorClasses}`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="text-sm">{task.name}</span>
                          {task.defaultHours !== undefined && (
                            <div className="flex items-center text-xs opacity-75 gap-1 ml-1">
                              <Clock className="h-3 w-3" /> 
                              <span>{task.defaultHours}h</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(task)} className="h-7 w-7 hover:bg-opacity-50">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="h-7 w-7 hover:bg-opacity-50 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No tasks created yet.</p>
              )}
            </ScrollArea>
          </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
