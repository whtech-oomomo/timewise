
'use client';

import type { Employee, EmployeeFormData, ImportedEmployeeData } from '@/lib/types';
import React, { useState, useEffect, useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { UserPlus, UsersRound, Edit3, Trash2, Download, Upload } from 'lucide-react';
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
  onExportEmployeesCSV: () => void;
  onImportEmployees: (importedData: ImportedEmployeeData[]) => void;
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
  onExportEmployeesCSV,
  onImportEmployees,
}: ManageEmployeesDialogProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setEditingEmployee(null);
      setEmployeeToDelete(null);
      setIsConfirmDeleteDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input when dialog closes
      }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      if (editingEmployee?.id === employeeToDelete.id) {
        setEditingEmployee(null);
        reset(defaultFormValues);
      }
      setIsConfirmDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const parseAndProcessCSV = (csvText: string) => {
    const lines = csvText.trim().split(/\r\n|\n/); // Handle both LF and CRLF line endings
    if (lines.length < 2) {
      toast({ title: "Error Importing CSV", description: "CSV file is empty or has no data rows.", variant: "destructive" });
      return;
    }
  
    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
    const expectedHeaders = ["Employee ID", "First Name", "Last Name", "Warehouse Code", "Status", "Created At"];
    
    const lowerCaseExpectedHeaders = expectedHeaders.map(h => h.toLowerCase());
    const lowerCaseActualHeaders = headers.map(h => h.toLowerCase());

    if (headers.length !== expectedHeaders.length || !lowerCaseExpectedHeaders.every((eh, i) => eh === lowerCaseActualHeaders[i])) {
       toast({ title: "Error Importing CSV", description: `Invalid CSV headers. Expected: ${expectedHeaders.join(', ')}. Got: ${headers.join(', ')}`, variant: "destructive" });
       return;
    }
  
    const employeesToImport: ImportedEmployeeData[] = [];
  
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; 
  
      // Basic CSV value splitting (doesn't handle commas within quotes perfectly)
      const values = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
      if (values.length !== headers.length) {
        toast({ title: `Skipping Row ${i + 1}`, description: "Incorrect number of columns.", variant: "destructive" });
        continue;
      }
  
      const employeeFromRow: any = {};
      lowerCaseActualHeaders.forEach((header, index) => {
        // Use expected header names as keys for consistency
        const expectedHeaderKey = expectedHeaders.find(eh => eh.toLowerCase() === header);
        if (expectedHeaderKey) {
            employeeFromRow[expectedHeaderKey] = values[index];
        }
      });
  
      const isActiveString = employeeFromRow["Status"]?.toLowerCase();
      const isActive = isActiveString === 'active';
      
      if (!employeeFromRow["Employee ID"] || !employeeFromRow["First Name"] || !employeeFromRow["Last Name"] || !employeeFromRow["Warehouse Code"]) {
          toast({ title: `Skipping Row ${i+1}`, description: `Missing required fields (ID, First Name, Last Name, Warehouse Code).`, variant: "destructive"});
          continue;
      }
  
      employeesToImport.push({
        id: employeeFromRow["Employee ID"],
        firstName: employeeFromRow["First Name"],
        lastName: employeeFromRow["Last Name"],
        warehouseCode: employeeFromRow["Warehouse Code"],
        isActive: isActive,
        createdAtInput: employeeFromRow["Created At"],
      });
    }
  
    if (employeesToImport.length > 0) {
      onImportEmployees(employeesToImport);
    } else if (lines.length > 1) { // Check if there were data rows attempted
      toast({ title: "Import Complete", description: "No valid employee data found to import from the provided rows.", variant: "default" });
    }
    // Reset file input after processing
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
        toast({ title: "Invalid File Type", description: "Please upload a .csv file.", variant: "destructive"});
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        parseAndProcessCSV(text);
      } else {
        toast({ title: "Error Reading File", description: "Could not read the CSV file.", variant: "destructive"});
      }
    };
    reader.onerror = () => {
        toast({ title: "Error Reading File", description: "An error occurred while reading the file.", variant: "destructive"});
    }
    reader.readAsText(file);
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
              {editingEmployee ? `Update details for ${editingEmployee.firstName} ${editingEmployee.lastName}.` : 'Add new employees or update existing ones. You can also import/export employee lists.'}
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
              <div className="flex justify-between items-center border-b pb-2 mb-3 gap-2">
                <h3 className="text-lg font-semibold">Existing Employees ({employees.length})</h3>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    accept=".csv" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    id="csv-employee-upload"
                  />
                  <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                  </Button>
                  <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onExportEmployeesCSV}
                      disabled={employees.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                  </Button>
                </div>
              </div>
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

