import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const spotifyScopes = [
    "user-read-email",
    "user-top-read",
    "user-read-private",
    "user-library-read",
].join(" ");

export const authOptions: NextAuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent(spotifyScopes)}`,
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }: any) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
                token.country = profile?.country;
            }
            return token;
        },
        async session({ session, token }: any) {
            session.accessToken = token.accessToken;
            session.country = token.country;
            session.error = token.error;
            return session;
        },
    },
    pages: {
        signIn: '/create',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
