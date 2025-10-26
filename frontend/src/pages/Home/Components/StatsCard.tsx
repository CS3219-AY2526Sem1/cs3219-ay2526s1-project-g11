import type { JSX } from "react";
import { Card } from "./Card";

interface StatsCardProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

export const StatsCard = ({ title, description, icon }: StatsCardProps) => {
  return (
    <Card>
      <div className="flex flex-row items-center gap-5">
        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 font-semibold text-xs flex items-center justify-center">
          {icon}
        </span>
        <div>
          <h1 className="font-bold text-2xl">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Card>
  );
};
