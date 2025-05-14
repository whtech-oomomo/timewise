
'use client';

import type { Employee, EmployeeFormData } from '@/lib/types';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, UsersRound, Edit3, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const employeeFormSchema = z.object({
  id: z.string().min(1, 'Employee ID is required').max(20, 'Employee ID is too long'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  warehouseCode: z.string().min(1, 'Warehouse code is required').max(20, 'Warehouse code is too long'),
  isActive: z.boolean(),
});

interface ManageEmployeesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  onAddEmployee: (employeeData: EmployeeFormData) => void;
  onUpdateEmployee: (employeeId: string, employeeData: EmployeeFormData) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const defaultFormValues: EmployeeFormData = {
  id: '',
  firstName: '',
  lastName: '',
  warehouseCode: '',
  isActive: true,
};

export function ManageEmployeesDialog({
  isOpen,
  onOpenChange,
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: ManageEmployeesDialogProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (isOpen) {
      if (editingEmployee) {
        setValue('id', editingEmployee.id);
        setValue('firstName', editingEmployee.firstName);
        setValue('lastName', editingEmployee.lastName);
        setValue('warehouseCode', editingEmployee.warehouseCode);
        setValue('isActive', editingEmployee.isActive);
      } else {
        reset(defaultFormValues);
      }
    } else {
      // Reset editing and delete states when main dialog closes
      setEditingEmployee(null);
      setEmployeeToDelete(null);
      setIsConfirmDeleteDialogOpen(false);
    }
  }, [isOpen, editingEmployee, reset, setValue]);

  const onSubmit = (data: EmployeeFormData) => {
    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, data);
      toast({ title: "Employee Updated", description: `Employee "${data.firstName} ${data.lastName}" has been updated.` });
    } else {
      if (employees.some(emp => emp.id === data.id)) {
        toast({
          title: "Error Adding Employee",
          description: `Employee ID "${data.id}" already exists. Please use a unique ID.`,
          variant: "destructive",
        });
        return; 
      }
      onAddEmployee(data);
      toast({ title: "Employee Added", description: `Employee "${data.firstName} ${data.lastName}" has been added.` });
    }
    setEditingEmployee(null);
    reset(defaultFormValues);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
  };
  
  const handleDialogClose = () => {
    setEditingEmployee(null);
    reset(defaultFormValues);
    onOpenChange(false);
    setIsConfirmDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  }

  const handleToggleActive = (employee: Employee) => {
    const formData: EmployeeFormData = {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        warehouseCode: employee.warehouseCode,
        isActive: !employee.isActive,
    };
    onUpdateEmployee(employee.id, formData);
     toast({
      title: `Employee ${employee.isActive ? "Deactivated" : "Activated"}`,
      description: `${employee.firstName} ${employee.lastName} is now ${employee.isActive ? "inactive" : "active"}.`
    });
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      onDeleteEmployee(employeeToDelete.id);
      // If the deleted employee was being edited, reset the form
      if (editingEmployee?.id === employeeToDelete.id) {
        setEditingEmployee(null);
        reset(defaultFormValues);
      }
      setIsConfirmDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersRound className="h-6 w-6" />
              {editingEmployee ? 'Edit Employee' : 'Manage Employees'}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee ? `Update details for ${editingEmployee.firstName} ${editingEmployee.lastName}.` : 'Add new employees or update existing ones.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6 flex-grow overflow-hidden py-4">
            {/* Left: Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-1">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">{editingEmployee ? 'Edit Details' : 'Add New Employee'}</h3>
              
              <div>
                <Label htmlFor="id">Employee ID</Label>
                <Controller
                  name="id"
                  control={control}
                  render={({ field }) => (
                    <Input 
                      id="id" 
                      {...field} 
                      placeholder="e.g., EMP001" 
                      disabled={!!editingEmployee} 
                    />
                  )}
                />
                {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
                {!!editingEmployee && <p className="text-xs text-muted-foreground mt-1">Employee ID cannot be changed after creation.</p>}
              </div>

              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => <Input id="firstName" {...field} placeholder="e.g., John" />}
                />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => <Input id="lastName" {...field} placeholder="e.g., Doe" />}
                />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>
              <div>
                <Label htmlFor="warehouseCode">Warehouse Code</Label>
                <Controller
                  name="warehouseCode"
                  control={control}
                  render={({ field }) => <Input id="warehouseCode" {...field} placeholder="e.g., WH-A1" />}
                />
                {errors.warehouseCode && <p className="text-sm text-destructive">{errors.warehouseCode.message}</p>}
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </div>
               <DialogFooter className="pt-6">
                  <Button type="submit" className="w-full md:w-auto">
                    {editingEmployee ? <><Edit3 className="mr-2 h-4 w-4" /> Update Employee</> : <><UserPlus className="mr-2 h-4 w-4" /> Add Employee</>}
                  </Button>
                  {editingEmployee && (
                    <Button type="button" variant="outline" onClick={() => { setEditingEmployee(null); reset(defaultFormValues); }} className="w-full md:w-auto">
                      Cancel Edit
                    </Button>
                  )}
                </DialogFooter>
            </form>

            {/* Right: Employee List */}
            <div className="flex flex-col overflow-hidden h-full border-l md:pl-6 pl-0 pt-1 md:pt-0">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">Existing Employees ({employees.length})</h3>
              <ScrollArea className="flex-grow pr-2">
                {employees.length > 0 ? (
                  <ul className="space-y-2">
                    {employees.slice().sort((a, b) => a.id.localeCompare(b.id)).map((employee) => (
                        <li
                          key={employee.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-md border",
                            employee.isActive ? "bg-card" : "bg-muted/50 opacity-70"
                          )}
                        >
                          <div>
                            <p className="font-medium">{employee.firstName} {employee.lastName} <span className="text-xs text-muted-foreground">({employee.id})</span></p>
                            <p className="text-xs text-muted-foreground">WC: {employee.warehouseCode} {employee.isActive ? '' : ' - Inactive'}</p>
                          </div>
                          <div className="flex items-center gap-1">
                             <Button 
                              variant={employee.isActive ? "outline" : "secondary"} 
                              size="sm" 
                              onClick={() => handleToggleActive(employee)}
                              className="h-8 px-2"
                            >
                              {employee.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)} className="h-8 w-8 hover:bg-accent">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(employee)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground py-4">No employees created yet.</p>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {employeeToDelete && (
        <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete employee "{employeeToDelete.firstName} {employeeToDelete.lastName}" (ID: {employeeToDelete.id})? 
                This action will also remove all their scheduled tasks and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setIsConfirmDeleteDialogOpen(false); setEmployeeToDelete(null); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
                Delete Employee
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
