import { Github, LogOut } from "lucide-react";
import {
  useGitHubStore,
  GITHUB_CLIENT_ID,
  GITHUB_REDIRECT_URI,
} from "../../store/github";
import { generateOAuthURL } from "../../utils/github-service";
import Button from "../ui/Button";

export function GitHubAuth() {
  const { isAuthenticated, user, isAuthenticating, error, logout, clearError } =
    useGitHubStore();

  const handleLogin = () => {
    clearError();
    const oauthUrl = generateOAuthURL(GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI);
    window.location.href = oauthUrl;
  };

  const handleLogout = () => {
    logout();
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
            <div className="text-xs text-gray-500 dark:text-gray-400">
              @{user.login}
            </div>
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
      <Button
        onClick={handleLogin}
        disabled={isAuthenticating}
        className="flex items-center gap-2"
      >
        <Github className="w-4 h-4" />
        {isAuthenticating ? "Connecting..." : "Connect GitHub"}
      </Button>
    </div>
  );
}
