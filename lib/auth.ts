import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            country: {
                type: "string",
                required: false,
            },
        },
    },
    plugins: [
        nextCookies(),
    ],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // Cache for 5 minutes
        }
    }
});


export const getSession = async () => auth.api.getSession({
    headers: await headers() // Better Auth needs headers to find the session cookie
});