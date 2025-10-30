import cn, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// utility function to combine class names and merge Tailwind classes
export const twcn = (...args: ClassValue[]) => {
  return twMerge(cn(...args));
};

export const computeCodeDiff = (oldText: string, newText: string) => {
  // Normalize line endings to handle newlines
  const oldNormalized = oldText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const newNormalized = newText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  if (oldNormalized === newNormalized) {
    return { from: 0, to: 0, text: "" };
  }

  let start = 0;
  while (
    start < oldNormalized.length &&
    start < newNormalized.length &&
    oldNormalized[start] === newNormalized[start]
  ) {
    start++;
  }

  let oldEnd = oldNormalized.length - 1;
  let newEnd = newNormalized.length - 1;

  while (
    oldEnd >= start &&
    newEnd >= start &&
    oldNormalized[oldEnd] === newNormalized[newEnd]
  ) {
    oldEnd--;
    newEnd--;
  }

  return {
    from: start,
    to: oldEnd + 1,
    text: newNormalized.slice(start, newEnd + 1),
  };
};

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

type MatchParams =
  | {
      userId: string;
      topics: string[];
      difficulty: string;
    }
  | Record<string, never>;

export function getMatchParams(): MatchParams {
  const params = sessionStorage.getItem("matchingParams");
  if (!params) return {};
  try {
    return JSON.parse(params) as MatchParams;
  } catch {
    return {};
  }
}
