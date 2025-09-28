import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Badge } from "../../../components/Badge";

type DifficultyItem = {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
};

const difficultyOptions: DifficultyItem[] = [
  {
    id: "easy",
    name: "Easy",
    description: "Great for beginners",
    badgeColor: "bg-green-600",
  },
  {
    id: "medium",
    name: "Medium",
    description: "Most common in interviews",
    badgeColor: "bg-yellow-600",
  },
  {
    id: "hard",
    name: "Hard",
    description: "Advanced challenges",
    badgeColor: "bg-red-600",
  },
];

interface SelectDifficultyProps {
  value?: "";
}

export const SelectDifficulty = ({ value }: SelectDifficultyProps) => {
  const [selected, setSelected] = useState<DifficultyItem>();
  return (
    <div className="grid gap-3 lg:grid-cols-3 sm:grid-cols-1">
      {difficultyOptions.map((item) => (
        <DifficultyCard
          key={item.name}
          item={item}
          onSelect={setSelected}
          isSelected={selected?.id === item.id}
        />
      ))}
    </div>
  );
};

interface DifficultyCardProps {
  item: DifficultyItem;
  isSelected?: boolean;
  onSelect: (item: DifficultyItem) => void;
}

const DifficultyCard = ({
  item,
  isSelected,
  onSelect,
}: DifficultyCardProps) => {
  return (
    <button
      className={twMerge(
        "flex flex-col items-center text-center gap-1 rounded-xl border-2 py-6 px-6 cursor-pointer border-gray-200",
        isSelected && "border-blue-500"
      )}
      onClick={() => onSelect(item)}
      type="button"
    >
      <Badge text={item.name} className={item.badgeColor} />
      <h3 className="text-sm text-gray-500">{item.description}</h3>
      {isSelected && (
        <div
          className={twMerge(
            "mt-3 w-6 h-6 rounded-full flex items-center justify-center",
            isSelected && "bg-blue-500"
          )}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </button>
  );
};
