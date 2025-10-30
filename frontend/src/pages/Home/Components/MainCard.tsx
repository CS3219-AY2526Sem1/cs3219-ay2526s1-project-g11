import type { ReactNode } from "react";
import { Card } from "./Card";

interface MainCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}

export const MainCard = ({
  title,
  description,
  icon,
  children,
}: MainCardProps) => {
  return (
    <Card>
      <div>
        <div className="flex flex-row items-center gap-2">
          {icon}
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <p className="text-gray-500">{description}</p>
      </div>
      {children}
    </Card>
  );
};
