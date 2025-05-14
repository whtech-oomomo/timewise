
'use client';

import type { Employee } from '@/lib/types';
import { useState, useEffect } from 'react'; // Added useEffect
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface AssignEmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[]; // Should be active employees
  taskName?: string;
  date?: string; // YYYY-MM-DD format
  onSubmit: (selectedEmployeeId: string) => void;
}

export function AssignEmployeeDialog({
  isOpen,
  onOpenChange,
  employees, // Active employees
  taskName,
  date,
  onSubmit,
}: AssignEmployeeDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(employees[0]?.id);

  useEffect(() => {
    // Update selected employee if the list changes (e.g. employees become active/inactive)
    // or if the currently selected one is no longer in the list.
    if (isOpen) {
        if (employees.length > 0) {
            const currentSelectionStillValid = employees.some(emp => emp.id === selectedEmployeeId);
            if (!selectedEmployeeId || !currentSelectionStillValid) {
                 setSelectedEmployeeId(employees[0].id);
            }
        } else {
            setSelectedEmployeeId(undefined);
        }
    }
  }, [isOpen, employees, selectedEmployeeId]);


  const handleSubmit = () => {
    if (selectedEmployeeId) {
      onSubmit(selectedEmployeeId);
    }
  };

  const handleDialogClose = () => {
    // No need to reset selectedEmployeeId here as useEffect will handle it if needed upon reopen.
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Task to Employee</DialogTitle>
          {taskName && date && (
            <DialogDescription>
              Assign task "{taskName}" for {format(new Date(date), 'MMMM d, yyyy')} to an employee.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Select Employee</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
              disabled={employees.length === 0}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder={employees.length > 0 ? "Select an active employee" : "No active employees"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {employees.length === 0 && <p className="text-sm text-muted-foreground">No active employees available to assign.</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleDialogClose()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedEmployeeId || employees.length === 0}>
            Assign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
