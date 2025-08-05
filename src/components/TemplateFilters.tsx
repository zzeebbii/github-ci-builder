import React from "react";
import { Search, Filter } from "lucide-react";

interface TemplateFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: string) => void;
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Frontend", label: "Frontend" },
  { value: "Backend", label: "Backend" },
  { value: "DevOps", label: "DevOps" },
  { value: "Full Stack", label: "Full Stack" },
];

const DIFFICULTIES = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  searchQuery,
  selectedCategory,
  selectedDifficulty,
  onSearchChange,
  onCategoryChange,
  onDifficultyChange,
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => onCategoryChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => onDifficultyChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            {DIFFICULTIES.map(difficulty => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedCategory || selectedDifficulty) && (
          <button
            onClick={() => {
              onSearchChange("");
              onCategoryChange("");
              onDifficultyChange("");
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};
