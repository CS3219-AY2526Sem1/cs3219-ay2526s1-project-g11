import cn, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// utility function to combine class names and merge Tailwind classes
export const twcn = (...args: ClassValue[]) => {
  return twMerge(cn(...args));
};

// compute a minimal {from,to,text} by LCP/LCSuffix against previous value
export const computeCodeDiff = (oldText: string, newText: string) => {
  if (oldText === newText) {
    return { from: 0, to: 0, text: "" };
  }
  let start = 0;
  while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) {
    start++;
  }
  let oldEnd = oldText.length - 1;
  let newEnd = newText.length - 1;
  while (oldEnd >= start && newEnd >= start && oldText[oldEnd] === newText[newEnd]) {
    oldEnd--;
    newEnd--;
  }
  
  return {
    from: start,
    to: oldEnd + 1,
    text: newText.slice(start, newEnd + 1)
  };
};