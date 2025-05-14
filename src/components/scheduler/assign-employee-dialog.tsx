
'use client';

import type { Employee } from '@/lib/types';
import { useState } from 'react';
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
  employees: Employee[];
  taskName?: string;
  date?: string; // YYYY-MM-DD format
  onSubmit: (selectedEmployeeId: string) => void;
}

export function AssignEmployeeDialog({
  isOpen,
  onOpenChange,
  employees,
  taskName,
  date,
  onSubmit,
}: AssignEmployeeDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(employees[0]?.id);

  const handleSubmit = () => {
    if (selectedEmployeeId) {
      onSubmit(selectedEmployeeId);
    }
  };

  const handleDialogClose = () => {
    // Reset local state if needed when dialog is closed externally
    if (employees.length > 0) {
       setSelectedEmployeeId(employees[0].id);
    } else {
       setSelectedEmployeeId(undefined);
    }
    onOpenChange(false);
  };
  
  // Ensure there's an employee to select by default if list is not empty
  useState(() => {
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id);
    }
  });


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
                <SelectValue placeholder={employees.length > 0 ? "Select an employee" : "No employees available"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {employees.length === 0 && <p className="text-sm text-muted-foreground">No employees available to assign.</p>}
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
