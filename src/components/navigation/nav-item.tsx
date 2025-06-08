import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

export function NavItem({
  icon: Icon,
  label,
  onClick,
  isActive,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full",
        isActive
          ? "bg-indigo-50 text-indigo-600"
          : "bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600"
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5 transition-colors",
          isActive
            ? "text-indigo-600"
            : "text-gray-600 group-hover:text-indigo-600"
        )}
      />
      <span className='font-medium text-sm'>{label}</span>
    </button>
  );
}
