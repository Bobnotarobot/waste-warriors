import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../lib/prisma";

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {},
      async authorize(credentials, req) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        // perform you login logic
        // find out user from db
        console.log("looking for username: ", username);
        const user = (await prisma.user.findMany({
          where: { username: username },
        }))[0]
        if (user.password != password) {
          throw new Error("invalid credentials");
        }

        // if everything is fine
        return {
          id: "1",
          name: username,
          email: username,
          role: "admin",
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    // error: '/auth/error',
    // signOut: '/auth/signout'
  },
  callbacks: {
    jwt(params) {
      // update token
      // if (params.user?.role) {
      //   params.token.role = params.user.role;
      // }
      // return final_token
      return params.token;
    },
  },
};

export default NextAuth(authOptions);