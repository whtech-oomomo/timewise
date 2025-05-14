import type { Task } from '@/lib/types';
import { getTaskIcon } from '@/components/icons/task-icon-map';
import { cn } from '@/lib/utils';

interface ScheduledTaskDisplayItemProps {
  task: Task;
  isCompact?: boolean;
  scheduledTaskId: string; // ID of the ScheduledTask instance
  onClick?: (scheduledTaskId: string) => void; // Click handler
}

export function ScheduledTaskDisplayItem({ task, isCompact = false, scheduledTaskId, onClick }: ScheduledTaskDisplayItemProps) {
  const IconComponent = getTaskIcon(task.iconName);

  const handleClick = () => {
    if (onClick) {
      onClick(scheduledTaskId);
    }
  };

  return (
    <div
      className={cn(
        'p-1 rounded-md text-xs flex items-center gap-1.5 shadow-sm',
        task.colorClasses,
        isCompact ? 'text-[10px] leading-tight' : '',
        onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-grab' // Make it look clickable if handler exists
      )}
      title={task.name}
      onClick={onClick ? handleClick : undefined} // Attach click handler
      role={onClick ? "button" : undefined} // Accessibility
      tabIndex={onClick ? 0 : undefined} // Accessibility
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); } : undefined} // Keyboard accessibility
    >
      <IconComponent className={cn('h-3 w-3 shrink-0', isCompact ? 'h-2.5 w-2.5' : '')} />
      {!isCompact && <span className="truncate">{task.name}</span>}
    </div>
  );
}
