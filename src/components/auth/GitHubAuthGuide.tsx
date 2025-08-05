import { AlertCircle, ExternalLink, Key, Shield } from "lucide-react";

export function GitHubAuthGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-blue-900 font-semibold mb-2">
            GitHub Authentication Options
          </h3>

          <div className="space-y-4 text-sm">
            <div className="bg-white rounded p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">
                  Recommended: Personal Access Token
                </span>
              </div>
              <p className="text-gray-700 mb-2">
                Create a Personal Access Token for secure, reliable
                authentication.
              </p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>
                  1. Go to GitHub Settings → Developer settings → Personal
                  access tokens
                </p>
                <p>
                  2. Generate new token (classic) with <strong>repo</strong> and{" "}
                  <strong>workflow</strong> scopes
                </p>
                <p>3. Copy the token and paste it above</p>
              </div>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=GitHub%20CI%20Builder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-2"
              >
                Create Token <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">
                  OAuth Login (May have CORS issues)
                </span>
              </div>
              <p className="text-gray-700 text-xs">
                OAuth authentication might fail due to CORS restrictions in some
                browsers. If it doesn't work, please use the Personal Access
                Token method instead.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
            <strong>Required Permissions:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                <code>repo</code> - Access repositories and read/write
                repository contents
              </li>
              <li>
                <code>workflow</code> - Update GitHub Action workflow files
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
