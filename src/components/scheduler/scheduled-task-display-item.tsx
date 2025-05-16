
import type { Task } from '@/lib/types';
import { getTaskIcon } from '@/components/icons/task-icon-map';
import { cn } from '@/lib/utils';
import type React from 'react';
import { Badge } from '@/components/ui/badge';

interface ScheduledTaskDisplayItemProps {
  task: Task;
  isCompact?: boolean;
  scheduledTaskId: string;
  onClick?: (scheduledTaskId: string, event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
  employeeName?: string;
  isSelected?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  tags?: string[];
}

export function ScheduledTaskDisplayItem({
  task,
  isCompact = false,
  scheduledTaskId,
  onClick,
  employeeName,
  isSelected = false,
  onDragStart,
  tags,
}: ScheduledTaskDisplayItemProps) {
  const IconComponent = getTaskIcon(task.iconName);

  const handleClick = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick) {
      event.stopPropagation(); // Prevent day cell click or other parent handlers
      onClick(scheduledTaskId, event);
    }
  };

  const displayTitle = employeeName ? `${employeeName} - ${task.name}` : task.name;
  const displayText = employeeName && isCompact ? `${employeeName}: ${task.name}` : task.name;


  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      data-is-task-item="true"
      className={cn(
        'p-1 rounded-md text-xs flex flex-col items-start gap-0.5 shadow-sm w-full', // Use flex-col for tags below
        task.colorClasses,
        onClick ? 'cursor-pointer hover:opacity-80' : (onDragStart ? 'cursor-grab' : ''),
        isSelected && !isCompact ? 'ring-2 ring-primary ring-offset-1' : '',
        isSelected && isCompact ? 'ring-1 ring-primary' : ''
      )}
      title={displayTitle}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); } : undefined}
    >
      <div className="flex items-start gap-1.5 w-full">
        <IconComponent className={cn('h-3 w-3 shrink-0 mt-0.5', isCompact ? 'h-2.5 w-2.5' : '')} />
        <span className="whitespace-normal break-words">{displayText}</span>
      </div>
      {tags && tags.length > 0 && !isCompact && (
        <div className="mt-1 flex flex-wrap gap-1 pl-[calc(0.375rem+0.375rem)]"> {/* Indent to align with text */}
          {tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 leading-tight">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 leading-tight">
              +{tags.length - 2} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
