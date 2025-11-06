import { twMerge } from "tailwind-merge";
import { Badge, BadgeColor } from "../../../components/Badge";

export type TopicItem = {
  id: string;
  topics: string[];
  label: string;
  icon: string;
};

const sampleDifficultyData: TopicItem[] = [
  {
    id: "array",
    topics: ["array", "string"],
    label: "Arrays & Strings",
    icon: "📚",
  },
  {
    id: "linked_lists",
    topics: ["linked-list", "doubly-linked-list"],
    label: "Linked Lists",
    icon: "🔗",
  },
  {
    id: "trees_and_graphs",
    topics: [
      "tree",
      "trie",
      "binary-tree",
      "binary-search-tree",
      "binary-indexed-tree",
      "segment-tree",
      "breadth-first-search",
      "depth-first-search",
      "topological-sort",
      "graph",
    ],
    label: "Trees & Graphs",
    icon: "🌳",
  },
  {
    id: "dynamic_programming",
    topics: ["dynamic-programming", "divide-and-conquer", "greedy"],
    label: "Dynamic Programming",
    icon: "⚡",
  },
  {
    id: "sorting_and_searching",
    topics: [
      "sorting",
      "bucket-sort",
      "counting-sort",
      "merge-sort",
      "radix-sort",
      "topological-sort",
    ],
    label: "Sorting & Searching",
    icon: "🔍",
  },
];

interface SelectTopicProps {
  value: TopicItem | undefined;
  onChange: (item: TopicItem) => void;
}

export const SelectTopic = ({ value, onChange }: SelectTopicProps) => {
  return (
    <div className="grid gap-3 lg:grid-cols-2 sm:grid-cols-1">
      {sampleDifficultyData.map((item) => (
        <TopicCard
          key={item.name}
          item={item}
          onSelect={onChange}
          isSelected={value?.id === item.id}
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
        "flex flex-row items-center gap-4 rounded-xl border-2 py-4 px-6 cursor-pointer border-gray-200 transition-colors duration-300 hover:border-blue-300 hover:shadow-lg",
        isSelected && "border-blue-500 hover:border-blue-500 shadow-lg"
      )}
      onClick={() => onSelect(item)}
      type="button"
    >
      <div className="text-2xl">{item.icon && item.icon}</div>
      <div className="flex flex-col items-start gap-1 flex-1">
        <h3 className="font-bold">{item.name}</h3>
        <Badge text="Popular" color={BadgeColor.BLUE} />
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
