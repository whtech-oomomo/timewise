
'use client';

import type { Employee } from '@/lib/types';
import { useState, useEffect } from 'react'; 
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
import { format, isValid } from 'date-fns'; // Added isValid

interface AssignEmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[]; 
  taskName?: string;
  date?: string; 
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

  useEffect(() => {
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
    onOpenChange(false);
  };
  
  const formattedDate = date && isValid(new Date(date)) ? format(new Date(date), 'MMMM d, yyyy') : 'Invalid Date';

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Task to Employee</DialogTitle>
          {taskName && date && (
            <DialogDescription>
              Assign task "{taskName}" for {formattedDate} to an employee.
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
                <SelectValue placeholder={employees.length > 0 ? "Select an active employee" : "No employees match criteria"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} (WC: {employee.warehouseCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {employees.length === 0 && <p className="text-sm text-muted-foreground">No active employees available to assign (check warehouse filter).</p>}
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
