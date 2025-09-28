import { type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Badge } from "../../../components/Badge";

type TopicItem = {
  id: string;
  name: string;
  icon?: ReactNode;
};

const sampleDifficultyData: TopicItem[] = [
  {
    id: "arrays_and_strings",
    name: "Arrays & Strings",
    icon: "📚",
  },
  {
    id: "linked_lists",
    name: "Linked Lists",
    icon: "🔗",
  },
  {
    id: "trees_and_graphs",
    name: "Trees & Graphs",
    icon: "🌳",
  },
  {
    id: "dynamic_programming",
    name: "Dynamic Programming",
    icon: "⚡",
  },
  {
    id: "sorting_and_searching",
    name: "Sorting & Searching",
    icon: "🔍",
  },
  {
    id: "system_design",
    name: "System Design",
    icon: "🏗️",
  },
];

interface SelectTopicProps {
  value?: "";
}

export const SelectTopic = ({ value }: SelectTopicProps) => {
  const [selected, setSelected] = useState<TopicItem>();
  return (
    <div className="grid gap-3 lg:grid-cols-2 sm:grid-cols-1">
      {sampleDifficultyData.map((item) => (
        <TopicCard
          key={item.name}
          item={item}
          onSelect={setSelected}
          isSelected={selected?.id === item.id}
        />
      ))}
    </div>
  );
};

interface TopicCardProps {
  item: TopicItem;
  isSelected?: boolean;
  onSelect: (item: TopicItem) => void;
}

const TopicCard = ({ item, isSelected, onSelect }: TopicCardProps) => {
  return (
    <button
      className={twMerge(
        "flex flex-row items-center gap-4 rounded-xl border-2 py-4 px-6 cursor-pointer border-gray-200",
        isSelected && "border-blue-500"
      )}
      onClick={() => onSelect(item)}
      type="button"
    >
      <div className="text-2xl">{item.icon && item.icon}</div>
      <div className="flex flex-col items-start gap-1 flex-1">
        <h3 className="font-bold">{item.name}</h3>
        <Badge text="Popular" className="bg-blue-400" />
      </div>
      <div
        className={twMerge(
          "w-6 h-6 rounded-full flex items-center justify-center",
          isSelected && "bg-blue-500"
        )}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>
    </button>
  );
};
