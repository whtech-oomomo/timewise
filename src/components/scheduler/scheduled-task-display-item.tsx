import type { Task } from '@/lib/types';
import { getTaskIcon } from '@/components/icons/task-icon-map';
import { cn } from '@/lib/utils';

interface ScheduledTaskDisplayItemProps {
  task: Task;
  isCompact?: boolean; // For monthly view, might be more compact
}

export function ScheduledTaskDisplayItem({ task, isCompact = false }: ScheduledTaskDisplayItemProps) {
  const IconComponent = getTaskIcon(task.iconName);

  return (
    <div
      className={cn(
        'p-1 rounded-md text-xs flex items-center gap-1.5 shadow-sm cursor-grab',
        task.colorClasses,
        isCompact ? 'text-[10px] leading-tight' : ''
      )}
      title={task.name}
    >
      <IconComponent className={cn('h-3 w-3 shrink-0', isCompact ? 'h-2.5 w-2.5' : '')} />
      {!isCompact && <span className="truncate">{task.name}</span>}
    </div>
  );
}
