import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { Session } from 'next-auth/types';

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

export const userMock: Session = {
  user: {
    id: '1', // Id do usuário
    name: 'Ismael Benjamim', // Nome do usuário
    email: 'ibsb@cin.ufpe.br', // Endereço de e-mail do usuário
  },
  expires: '90000'
};

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [], //GitHub
  /*callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.id = profile.id
        token.image = profile.avatar_url || profile.picture
      }
      return token
    },
    session: ({ session, token }) => {
      if (session?.user && token?.id) {
        session.user.id = String(token.id)
      }
      return session
    },
    authorized({ auth }) {
      return !!auth?.user // this ensures there is a logged in user for -every- request
    }
  },
  pages: {
    signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }*/
})
