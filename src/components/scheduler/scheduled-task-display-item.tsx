
import type { Task } from '@/lib/types';
import { getTaskIcon } from '@/components/icons/task-icon-map';
import { cn } from '@/lib/utils';
import type React from 'react';

interface ScheduledTaskDisplayItemProps {
  task: Task;
  isCompact?: boolean;
  scheduledTaskId: string; // ID of the ScheduledTask instance
  onClick?: (scheduledTaskId: string, event: React.MouseEvent<HTMLDivElement>) => void; // Updated signature
}

export function ScheduledTaskDisplayItem({ task, isCompact = false, scheduledTaskId, onClick }: ScheduledTaskDisplayItemProps) {
  const IconComponent = getTaskIcon(task.iconName);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => { // Updated signature
    if (onClick) {
      event.stopPropagation(); // Prevent click from bubbling to parent elements
      onClick(scheduledTaskId, event);
    }
  };

  return (
    <div
      className={cn(
        'p-1 rounded-md text-xs flex items-center gap-1.5 shadow-sm',
        task.colorClasses,
        isCompact ? 'text-[10px] leading-tight' : '',
        onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-grab'
      )}
      title={task.name}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as any); } : undefined} // Cast needed if strict
    >
      <IconComponent className={cn('h-3 w-3 shrink-0', isCompact ? 'h-2.5 w-2.5' : '')} />
      {!isCompact && <span className="truncate">{task.name}</span>}
      {isCompact && <span className="truncate">{task.name}</span>} {/* Ensure name shows in compact for monthly view */}
    </div>
  );
}
