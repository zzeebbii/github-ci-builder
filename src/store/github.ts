import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Octokit } from "@octokit/rest";

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  updated_at: string;
}

export interface GitHubAuthState {
  // Auth state
  isAuthenticated: boolean;
  accessToken: string | null;
  user: GitHubUser | null;

  // Loading states
  isLoading: boolean;
  isAuthenticating: boolean;

  // Error state
  error: string | null;

  // Octokit instance
  octokit: Octokit | null;

  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: GitHubUser) => void;
  authenticate: (code: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// GitHub OAuth App configuration
// Note: In production, these would be environment variables
export const GITHUB_CLIENT_ID =
  import.meta.env.VITE_GITHUB_CLIENT_ID || "your-github-client-id";
export const GITHUB_CLIENT_SECRET =
  import.meta.env.VITE_GITHUB_CLIENT_SECRET || "your-github-client-secret";
export const GITHUB_REDIRECT_URI =
  import.meta.env.VITE_GITHUB_REDIRECT_URI ||
  `${window.location.origin}/auth/callback`;

export const useGitHubStore = create<GitHubAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      accessToken: null,
      user: null,
      isLoading: false,
      isAuthenticating: false,
      error: null,
      octokit: null,

      // Set access token and create Octokit instance
      setAccessToken: (token: string) => {
        const octokit = new Octokit({ auth: token });
        set({
          accessToken: token,
          octokit,
          isAuthenticated: true,
          error: null,
        });
      },

      // Set user information
      setUser: (user: GitHubUser) => {
        set({ user, error: null });
      },

      // Authenticate with GitHub using OAuth code
      authenticate: async (code: string) => {
        const { setAccessToken, setUser } = get();

        try {
          set({ isAuthenticating: true, error: null });

          // Exchange code for access token
          // Note: In production, this should be done on the backend for security
          const tokenResponse = await fetch(
            "https://github.com/login/oauth/access_token",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: GITHUB_REDIRECT_URI,
              }),
            }
          );

          if (!tokenResponse.ok) {
            throw new Error("Failed to exchange code for token");
          }

          const tokenData = await tokenResponse.json();

          if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
          }

          const accessToken = tokenData.access_token;
          setAccessToken(accessToken);

          // Fetch user information
          const octokit = new Octokit({ auth: accessToken });
          const { data: user } = await octokit.rest.users.getAuthenticated();

          setUser({
            id: user.id,
            login: user.login,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
          });
        } catch (error) {
          console.error("GitHub authentication error:", error);
          set({
            error:
              error instanceof Error ? error.message : "Authentication failed",
            isAuthenticated: false,
            accessToken: null,
            user: null,
            octokit: null,
          });
        } finally {
          set({ isAuthenticating: false });
        }
      },

      // Logout and clear all auth data
      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          octokit: null,
          error: null,
        });
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "github-auth-storage",
      partialize: state => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
