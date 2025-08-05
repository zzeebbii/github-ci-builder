import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGitHubStore } from "../../store/github";

export function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authenticate, isAuthenticating, error } = useGitHubStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        console.error("GitHub OAuth error:", errorParam);
        navigate("/", { replace: true });
        return;
      }

      if (code) {
        try {
          await authenticate(code);
          navigate("/builder", { replace: true });
        } catch (error) {
          console.error("Authentication failed:", error);
          navigate("/", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, authenticate, navigate]);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Connecting to GitHub...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg font-medium">
            Authentication Failed
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
