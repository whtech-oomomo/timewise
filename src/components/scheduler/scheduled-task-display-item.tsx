
import type { Task } from '@/lib/types';
import { getTaskIcon } from '@/components/icons/task-icon-map';
import { cn } from '@/lib/utils';
import type React from 'react';

interface ScheduledTaskDisplayItemProps {
  task: Task;
  isCompact?: boolean;
  scheduledTaskId: string; // ID of the ScheduledTask instance
  onClick?: (scheduledTaskId: string, event: React.MouseEvent<HTMLDivElement>) => void; // Updated signature
  employeeName?: string; // New prop
}

export function ScheduledTaskDisplayItem({ task, isCompact = false, scheduledTaskId, onClick, employeeName }: ScheduledTaskDisplayItemProps) {
  const IconComponent = getTaskIcon(task.iconName);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => { 
    if (onClick) {
      event.stopPropagation(); 
      onClick(scheduledTaskId, event);
    }
  };

  const displayTitle = employeeName ? `${employeeName} - ${task.name}` : task.name;

  return (
    <div
      className={cn(
        'p-1 rounded-md text-xs flex items-start gap-1.5 shadow-sm', // items-start to align icon with first line of wrapped text
        task.colorClasses,
        isCompact ? 'text-[10px] leading-tight' : '',
        onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-grab'
      )}
      title={displayTitle}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as any); } : undefined} 
    >
      <IconComponent className={cn('h-3 w-3 shrink-0 mt-0.5', isCompact ? 'h-2.5 w-2.5' : '')} />
      {!isCompact && <span className="whitespace-normal break-words">{displayTitle}</span>}
      {isCompact && (
        <span className="whitespace-normal break-words">
          {employeeName ? `${employeeName}: ${task.name}` : task.name}
        </span>
      )}
    </div>
  );
}

