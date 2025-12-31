"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const country = formData.get("country") as string;

    await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
            country,
        },
    });

    redirect("/");
}

export async function signInAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await auth.api.signInEmail({
        body: {
            email,
            password,
        },
    });

    redirect("/");
}

export async function signOutAction() {
    await auth.api.signOut({
        headers: await headers(),
    });
    redirect("/");
}
