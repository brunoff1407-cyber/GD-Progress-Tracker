import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  isCompleted?: boolean;
}

export function ProgressBar({ value, isCompleted = false }: ProgressBarProps) {
  return (
    <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${isCompleted ? 'bg-accent shadow-[0_0_10px_hsl(var(--accent))]' : 'bg-primary shadow-[0_0_10px_hsl(var(--primary))]'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
