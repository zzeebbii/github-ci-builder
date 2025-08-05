import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { TemplateGrid } from "../TemplateGrid";
import { WORKFLOW_TEMPLATES } from "../../data/default-workflows";

export const TemplateBrowserView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  const templates = Object.values(WORKFLOW_TEMPLATES);
  const categories = Array.from(new Set(templates.map(t => t.category)));
  const difficulties = Array.from(new Set(templates.map(t => t.difficulty)));

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDifficulty("");
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Workflow Templates
        </h1>
        <p className="text-gray-600">
          Choose from our collection of pre-built workflow templates to get
          started quickly
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Levels</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>

          {(searchQuery || selectedCategory || selectedDifficulty) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing{" "}
          {
            Object.values(WORKFLOW_TEMPLATES).filter(template => {
              const matchesSearch =
                searchQuery === "" ||
                template.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                template.description
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                template.tags.some(tag =>
                  tag.toLowerCase().includes(searchQuery.toLowerCase())
                );

              const matchesCategory =
                selectedCategory === "" ||
                template.category === selectedCategory;

              const matchesDifficulty =
                selectedDifficulty === "" ||
                template.difficulty === selectedDifficulty;

              return matchesSearch && matchesCategory && matchesDifficulty;
            }).length
          }{" "}
          of {Object.keys(WORKFLOW_TEMPLATES).length} templates
        </p>
      </div>

      {/* Template Grid */}
      <TemplateGrid
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedDifficulty={selectedDifficulty}
      />
    </div>
  );
};
