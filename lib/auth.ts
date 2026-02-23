import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        // Spotify removed
    ],
    callbacks: {
        async jwt({ token }: any) {
            return token;
        },
        async session({ session }: any) {
            return session;
        },
    },
    pages: {
        signIn: '/create',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
