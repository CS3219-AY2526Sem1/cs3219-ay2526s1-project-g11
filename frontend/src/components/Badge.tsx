import { twMerge } from "tailwind-merge";

interface BadgeProps {
  text: string;
  className?: string;
}

export const Badge = ({ text, className }: BadgeProps) => {
  return (
    <div
      className={twMerge(
        "text-xs text-white font-bold rounded-4xl bg-amber-600 px-2 py-0.5",
        className,
      )}
    >
      {text}
    </div>
  );
};
