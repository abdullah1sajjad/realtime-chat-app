import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { NextAuthOptions } from "next-auth";
import { redis } from "./db";
import Google from "next-auth/providers/google";

function getGoogleCred() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }

  return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(redis),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: getGoogleCred().clientId,
      clientSecret: getGoogleCred().clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const dbUser = (await redis.get(`user:${token.id}`)) as User | null;

      if (!dbUser) {
        token.id = user?.id;
        return token;
      }

      return {
        name: dbUser?.name,
        id: dbUser?.id,
        image: dbUser?.image,
        email: dbUser?.email,
      };
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.email = token.email;
      }

      return session;
    },
    redirect() {
      return "/dashboard";
    },
  },
};
