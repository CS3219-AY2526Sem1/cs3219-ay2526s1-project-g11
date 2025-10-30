import { twMerge } from "tailwind-merge";
import { Badge, BadgeColor } from "../../../components/Badge";

export type DifficultyItem = {
  id: string;
  name: string;
  description: string;
  badgeColor: BadgeColor;
};

const difficultyOptions: DifficultyItem[] = [
  {
    id: "easy",
    name: "Easy",
    description: "Great for beginners",
    badgeColor: BadgeColor.GREEN,
  },
  {
    id: "medium",
    name: "Medium",
    description: "Most common in interviews",
    badgeColor: BadgeColor.YELLOW,
  },
  {
    id: "hard",
    name: "Hard",
    description: "Advanced challenges",
    badgeColor: BadgeColor.RED,
  },
];

interface SelectDifficultyProps {
  value: DifficultyItem | undefined;
  onChange: (item: DifficultyItem) => void;
}

export const SelectDifficulty = ({
  value,
  onChange,
}: SelectDifficultyProps) => {
  return (
    <div className="grid gap-3 lg:grid-cols-3 sm:grid-cols-1">
      {difficultyOptions.map((item) => (
        <DifficultyCard
          key={item.name}
          item={item}
          onSelect={onChange}
          isSelected={value?.id === item.id}
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
        "flex flex-col items-center text-center gap-1 rounded-xl border-2 py-6 px-6 cursor-pointer border-gray-200 transition-colors duration-300 hover:border-blue-300 hover:shadow-lg",
        isSelected && "border-blue-500 hover:border-blue-500 shadow-lg",
      )}
      onClick={() => onSelect(item)}
      type="button"
    >
      <Badge text={item.name} color={item.badgeColor} />
      <h3 className="text-sm text-gray-500">{item.description}</h3>
      {isSelected && (
        <div
          className={twMerge(
            "mt-3 w-6 h-6 rounded-full flex items-center justify-center",
            isSelected && "bg-blue-500",
          )}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </button>
  );
};
