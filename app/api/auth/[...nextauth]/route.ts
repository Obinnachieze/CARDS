import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const spotifyScopes = [
    "user-read-email",
    "user-top-read",
    "user-read-private",
].join(" ");

const handler = NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent(spotifyScopes)}`,
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
            }
            return token;
        },
        async session({ session, token }: any) {
            session.accessToken = token.accessToken;
            session.error = token.error;
            return session;
        },
    },
    pages: {
        signIn: '/create', // Redirect to create page if not signed in (we'll handle login in sidebar)
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
