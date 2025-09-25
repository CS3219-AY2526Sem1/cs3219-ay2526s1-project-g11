import cn, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// utility function to combine class names and merge Tailwind classes
export const twcn = (...args: ClassValue[]) => {
  return twMerge(cn(...args));
};
