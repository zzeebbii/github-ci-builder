import { useState } from "react";
import { Github, LogOut, Key, ExternalLink } from "lucide-react";
import {
  useGitHubStore,
  GITHUB_CLIENT_ID,
  GITHUB_REDIRECT_URI,
} from "../../store/github";
import { generateOAuthURL } from "../../utils/github-service";
import Button from "../ui/Button";

export function GitHubAuth() {
  const {
    isAuthenticated,
    user,
    isAuthenticating,
    error,
    logout,
    clearError,
    authenticateWithPersonalToken,
  } = useGitHubStore();

  const [showTokenInput, setShowTokenInput] = useState(false);
  const [personalToken, setPersonalToken] = useState("");

  const handleOAuthLogin = () => {
    clearError();
    const oauthUrl = generateOAuthURL(GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI);
    window.location.href = oauthUrl;
  };

  const handleTokenLogin = async () => {
    if (!personalToken.trim()) {
      return;
    }
    await authenticateWithPersonalToken(personalToken.trim());
    if (useGitHubStore.getState().isAuthenticated) {
      setPersonalToken("");
      setShowTokenInput(false);
    }
  };

  const handleLogout = () => {
    logout();
    setPersonalToken("");
    setShowTokenInput(false);
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-8 h-8 rounded-full"
          />
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.name || user.login}
            </div>
            <div className="text-xs text-gray-600">@{user.login}</div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 max-w-xs truncate">
          {error}
        </div>
      )}

      {showTokenInput ? (
        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder="Enter GitHub Personal Access Token"
            value={personalToken}
            onChange={e => setPersonalToken(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={e => {
              if (e.key === "Enter") {
                handleTokenLogin();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleTokenLogin}
            disabled={isAuthenticating || !personalToken.trim()}
          >
            {isAuthenticating ? "Connecting..." : "Connect"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setShowTokenInput(false);
              setPersonalToken("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOAuthLogin}
            disabled={isAuthenticating}
            className="flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            {isAuthenticating ? "Connecting..." : "OAuth Login"}
          </Button>
          <span className="text-gray-400">or</span>
          <Button
            variant="secondary"
            onClick={() => setShowTokenInput(true)}
            className="flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            Use Token
          </Button>
        </div>
      )}

      {!showTokenInput && (
        <div className="text-xs text-gray-500 max-w-xs">
          <a
            href="https://github.com/settings/tokens/new?scopes=repo,workflow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Create Personal Access Token <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
