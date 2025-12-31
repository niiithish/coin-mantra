"use client";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { signInAction } from "@/app/actions/auth"
import { useState } from "react"
import { EyeIcon, EyeOff } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const LoginForm = () => {

    const [visible, setVisible] = useState(false);

    return (
        <Card className="ring-0 flex flex-col gap-6 w-full max-w-[350px] justify-center bg-transparent">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={signInAction}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                            />
                        </Field>
                        <Field>
                            <div className="flex items-center">
                                <FieldLabel htmlFor="password" >Password</FieldLabel>
                                <a
                                    href="#"
                                    className="ml-auto inline-block text-xs underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </a>
                            </div>
                            <div className="relative">
                                <Input id="password" name="password" type={visible ? "text" : "password"} required />
                                <HugeiconsIcon
                                    icon={visible ? EyeOff : EyeIcon}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-all"
                                    onClick={() => setVisible(!visible)}
                                    size={16}
                                />
                            </div>
                        </Field>
                        <Field>
                            <Button type="submit">Login</Button>
                            <FieldDescription className="text-center">
                                Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
export default LoginForm;
