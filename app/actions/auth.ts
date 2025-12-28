"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    
    await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        }
    })
    redirect("/");
}

export const signInAction = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    await auth.api.signInEmail({
        body: {
            email,
            password,
        }
    })
    redirect("/");
}

export const signOutAction = async () => {
    await auth.api.signOut();
    redirect("/");
}