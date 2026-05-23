import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Your Name" },
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone (UAE)", type: "text", placeholder: "0501234567" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: credentials.name,
              email: credentials.email,
              password: credentials.password,
              phone: credentials.phone,
            }),
          });

          const data = await res.json();

          if (res.ok && data.user) {
            // Include backend cookies in the response to the client if needed,
            // NextAuth manages its own session, but we also got the backend JWT via cookies if we pass them.
            // For a pure NextAuth setup, we return the user object to be saved in the NextAuth JWT.
            return data.user;
          }

          // Return null if user data could not be retrieved
          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    // signIn: '/login', // uncomment to use custom login page
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
});

export { handler as GET, handler as POST };
