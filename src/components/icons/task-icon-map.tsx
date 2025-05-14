import {
  Briefcase,
  ClipboardCheck,
  Coffee,
  Presentation,
  Users,
  Phone,
  FileText,
  Sunrise,
  MessageSquare,
  Settings,
  LucideIcon,
  type Icon as LucideIconType, // Import Icon type for the map
} from 'lucide-react';

export const iconMap: Record<string, LucideIconType> = {
  Briefcase,
  ClipboardCheck,
  Coffee,
  Presentation,
  Users,
  Phone,
  FileText,
  Sunrise,
  MessageSquare,
  Settings,
};

export const availableIcons = [
  { name: 'Briefcase', label: 'Briefcase' },
  { name: 'ClipboardCheck', label: 'Clipboard Check' },
  { name: 'Coffee', label: 'Coffee Break' },
  { name: 'Presentation', label: 'Presentation' },
  { name: 'Users', label: 'Meeting' },
  { name: 'Phone', label: 'Phone Call' },
  { name: 'FileText', label: 'Documentation' },
  { name: 'Sunrise', label: 'Morning Task' },
  { name: 'MessageSquare', label: 'Chat/Discussion' },
  { name: 'Settings', label: 'Configuration' },
];

export const availableColors = [
  { classes: 'bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200', name: 'Sky Blue' },
  { classes: 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200', name: 'Green' },
  { classes: 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200', name: 'Yellow' },
  { classes: 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200', name: 'Purple' },
  { classes: 'bg-pink-100 text-pink-700 border border-pink-300 hover:bg-pink-200', name: 'Pink' },
  { classes: 'bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200', name: 'Indigo' },
  { classes: 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200', name: 'Red' },
  { classes: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200', name: 'Gray' },
];

export const DefaultTaskIcon = Briefcase;

export const getTaskIcon = (iconName?: string): LucideIconType => {
  return iconName && iconMap[iconName] ? iconMap[iconName] : DefaultTaskIcon;
};
