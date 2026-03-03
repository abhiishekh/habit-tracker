import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            id: string
            phone?: string | null
            whatsappEnabled?: boolean
            wakatimeApiKey?: string | null
            githubApiKey?: string | null
        } & DefaultSession["user"]
    }

    interface User {
        phone?: string | null
        whatsappEnabled?: boolean
        wakatimeApiKey?: string | null
        githubApiKey?: string | null
    }
}
