import { GitBranch, HelpCircle, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              GitHub CI Builder
            </h1>
          </div>

          <div className="text-sm text-gray-500">
            Visual workflow builder for GitHub Actions
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <HelpCircle className="w-5 h-5" />
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
