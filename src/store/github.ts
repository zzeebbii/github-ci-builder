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

  // Device flow state
  deviceCode: string | null;
  userCode: string | null;
  verificationUri: string | null;
  isPollingForToken: boolean;

  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: GitHubUser) => void;
  authenticate: (code: string) => Promise<void>;
  authenticateWithDeviceFlow: () => Promise<void>;
  pollForDeviceToken: () => Promise<void>;
  authenticateWithPersonalToken: (token: string) => Promise<void>;
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
      deviceCode: null,
      userCode: null,
      verificationUri: null,
      isPollingForToken: false,

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

          // Use a CORS proxy for development to avoid CORS issues
          // In production, this should be handled by your backend
          const proxyUrl = "https://cors-anywhere.herokuapp.com/";
          const tokenUrl = "https://github.com/login/oauth/access_token";

          const tokenResponse = await fetch(proxyUrl + tokenUrl, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify({
              client_id: GITHUB_CLIENT_ID,
              client_secret: GITHUB_CLIENT_SECRET,
              code,
              redirect_uri: GITHUB_REDIRECT_URI,
            }),
          });

          if (!tokenResponse.ok) {
            throw new Error(
              `Failed to exchange code for token: ${tokenResponse.status}`
            );
          }

          const tokenData = await tokenResponse.json();

          if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
          }

          const accessToken = tokenData.access_token;
          if (!accessToken) {
            throw new Error("No access token received from GitHub");
          }

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

      // Authenticate with Personal Access Token (no CORS issues)
      authenticateWithPersonalToken: async (token: string) => {
        const { setAccessToken, setUser } = get();

        try {
          set({ isAuthenticating: true, error: null });

          // Test the token by fetching user info
          const octokit = new Octokit({ auth: token });
          const { data: user } = await octokit.rest.users.getAuthenticated();

          setAccessToken(token);
          setUser({
            id: user.id,
            login: user.login,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
          });
        } catch (error) {
          console.error("GitHub token authentication error:", error);
          set({
            error: error instanceof Error ? error.message : "Invalid token",
            isAuthenticated: false,
            accessToken: null,
            user: null,
            octokit: null,
          });
        } finally {
          set({ isAuthenticating: false });
        }
      },

      // Device flow implementation (placeholder for now)
      authenticateWithDeviceFlow: async () => {
        set({ error: "Device flow not implemented yet" });
      },

      pollForDeviceToken: async () => {
        // Placeholder for device flow polling
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
