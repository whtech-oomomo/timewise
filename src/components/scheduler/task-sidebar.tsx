
import type { Task } from '@/lib/types';
import { TaskItem } from './task-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TaskSidebarProps {
  tasks: Task[];
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

export function TaskSidebar({ tasks, onDragTaskStart }: TaskSidebarProps) {
  return (
    <Card className="w-64 h-full flex flex-col shadow-lg rounded-lg">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg">Available Tasks</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-4 space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem key={task.id} task={task} onDragStart={onDragTaskStart} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No tasks available. Add tasks via "Manage Tasks".</p>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
