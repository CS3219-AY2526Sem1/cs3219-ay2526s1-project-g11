import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export const Card = ({ children }: CardProps) => {
  return (
    <div className="grow bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
      {children}
    </div>
  );
};
