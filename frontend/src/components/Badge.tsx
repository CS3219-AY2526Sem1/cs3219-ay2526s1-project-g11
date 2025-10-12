import { twMerge } from "tailwind-merge";

export enum BadgeColor {
  GREEN = "bg-green-600",
  BLUE = "bg-blue-600",
  YELLOW = "bg-yellow-400",
  ORANGE = "bg-orange-600",
  RED = "bg-red-600",
}

interface BadgeProps {
  text: string;
  color?: BadgeColor;
}

export const Badge = ({ text, color }: BadgeProps) => {
  return (
    <div
      className={twMerge(
        "text-xs text-white font-bold rounded-4xl bg-amber-600 px-2 py-0.5",
        color,
      )}
    >
      {text}
    </div>
  );
};
