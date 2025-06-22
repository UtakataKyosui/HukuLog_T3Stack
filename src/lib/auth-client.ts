import { passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Function to get the correct base URL for the current environment
function getBaseURL() {
	if (typeof window !== "undefined") {
		// Client-side: use current origin
		return window.location.origin;
	}

	// Server-side
	if (process.env.NODE_ENV === "production") {
		return process.env.NEXT_PUBLIC_APP_URL || "";
	}

	// Development: Check for CodeSpace
	if (process.env.CODESPACE_NAME) {
		return `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
	}

	return "http://localhost:3000";
}

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
	plugins: [passkeyClient()],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
