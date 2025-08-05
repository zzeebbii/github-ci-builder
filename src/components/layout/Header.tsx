import { GitBranch, HelpCircle, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Builder", href: "/", description: "Visual workflow builder" },
  { name: "Import", href: "/import", description: "Import YAML workflows" },
  { name: "Export", href: "/export", description: "Export to YAML" },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="border-b bg-white">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                GitHub CI Builder
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navigation.map(item => {
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    title={item.description}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-2 bg-gray-50 border-t">
        <div className="text-sm text-gray-600">
          {navigation.find(item => item.href === location.pathname)
            ?.description || "GitHub Actions workflow builder"}
        </div>
      </div>
    </header>
  );
}
