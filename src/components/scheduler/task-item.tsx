
import type { Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { getTaskIcon } from '@/components/icons/task-icon-map';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

export function TaskItem({ task, onDragStart }: TaskItemProps) {
  const IconComponent = getTaskIcon(task.iconName);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    // Use the existing onDragStart from props, which expects taskId
    // This function is handleDragTaskStart in page.tsx which now expects type 'new-task'
    onDragStart(event, task.id);
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className={cn("cursor-grab transition-shadow duration-150 hover:shadow-lg active:shadow-xl", task.colorClasses)}
    >
      <CardContent className="p-3 flex items-center gap-2">
        <IconComponent className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium truncate">{task.name}</span>
      </CardContent>
    </Card>
  );
}
