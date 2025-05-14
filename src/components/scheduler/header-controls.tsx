
'use client';

import type { Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarIcon, ListChecks, UserSearch, FilterX, UsersRound } from 'lucide-react';

interface HeaderControlsProps {
  currentView: 'weekly' | 'monthly';
  onViewChange: (view: 'weekly' | 'monthly') => void;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSetDate: (date: Date) => void;
  onManageTasks: () => void;
  onManageEmployees: () => void; // New prop
  employees: Employee[]; // Should be active employees for filtering
  selectedEmployeeId: string | null;
  onEmployeeFilterChange: (employeeId: string | null) => void;
}

export function HeaderControls({
  currentView,
  onViewChange,
  currentDate,
  onPrev,
  onNext,
  onToday,
  onSetDate,
  onManageTasks,
  onManageEmployees, // New prop
  employees, // Active employees
  selectedEmployeeId,
  onEmployeeFilterChange,
}: HeaderControlsProps) {
  
  const displayDateRange = () => {
    if (currentView === 'weekly') {
      return `${format(currentDate, 'MMMM d')} - ${format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 6), 'd, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b bg-card rounded-t-lg shadow">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrev} aria-label="Previous period">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && onSetDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" onClick={onNext} aria-label="Next period">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          Today
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={selectedEmployeeId || 'all'}
          onValueChange={(value) => onEmployeeFilterChange(value === 'all' ? null : value)}
          disabled={employees.length === 0 && !selectedEmployeeId}
        >
          <SelectTrigger className="w-[180px]">
            <UserSearch className="mr-2 h-4 w-4"/>
            <SelectValue placeholder={employees.length > 0 ? "Filter by Employee" : "No active employees"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedEmployeeId && (
          <Button variant="ghost" size="icon" onClick={() => onEmployeeFilterChange(null)} title="Clear employee filter">
            <FilterX className="h-4 w-4"/>
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant={currentView === 'weekly' ? 'default' : 'outline'}
          onClick={() => onViewChange('weekly')}
        >
          Weekly
        </Button>
        <Button
          variant={currentView === 'monthly' ? 'default' : 'outline'}
          onClick={() => onViewChange('monthly')}
        >
          Monthly
        </Button>
        <Button variant="outline" onClick={onManageTasks}>
          <ListChecks className="mr-2 h-4 w-4" /> Manage Tasks
        </Button>
        <Button variant="outline" onClick={onManageEmployees}> {/* New Button */}
          <UsersRound className="mr-2 h-4 w-4" /> Manage Employees
        </Button>
      </div>
    </div>
  );
}
