
import type { Task } from '@/lib/types';
import { getTaskIcon } from '@/components/icons/task-icon-map';
import { cn } from '@/lib/utils';
import type React from 'react';

interface ScheduledTaskDisplayItemProps {
  task: Task;
  isCompact?: boolean;
  scheduledTaskId: string; 
  onClick?: (scheduledTaskId: string, event: React.MouseEvent<HTMLDivElement>) => void; 
  employeeName?: string; 
  isSelected?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function ScheduledTaskDisplayItem({ 
  task, 
  isCompact = false, 
  scheduledTaskId, 
  onClick, 
  employeeName,
  isSelected = false,
  onDragStart,
}: ScheduledTaskDisplayItemProps) {
  const IconComponent = getTaskIcon(task.iconName);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => { 
    if (onClick) {
      // Stop propagation handled by individual task click vs cell click
      onClick(scheduledTaskId, event);
    }
  };

  const displayTitle = employeeName ? `${employeeName} - ${task.name}` : task.name;
  const displayText = employeeName && isCompact ? `${employeeName}: ${task.name}` : task.name;


  return (
    <div
      draggable={!!onDragStart} // Only draggable if onDragStart is provided
      onDragStart={onDragStart}
      data-is-task-item="true"
      className={cn(
        'p-1 rounded-md text-xs flex items-start gap-1.5 shadow-sm', 
        task.colorClasses,
        isCompact ? 'text-[10px] leading-tight' : '',
        onClick ? 'cursor-pointer hover:opacity-80' : (onDragStart ? 'cursor-grab' : ''),
        isSelected && !isCompact ? 'ring-2 ring-primary ring-offset-1' : '', // Visual cue for selection
        isSelected && isCompact ? 'ring-1 ring-primary' : ''
      )}
      title={displayTitle}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as any); } : undefined} 
    >
      <IconComponent className={cn('h-3 w-3 shrink-0 mt-0.5', isCompact ? 'h-2.5 w-2.5' : '')} />
      <span className="whitespace-normal break-words">{displayText}</span>
    </div>
  );
}
