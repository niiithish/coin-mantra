"use client";
import { EyeIcon, EyeOff } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const LoginForm = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      router.push("/dashboard");
    } catch (_error) {
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex w-full w-[350px] flex-col justify-center gap-6 bg-transparent ring-0">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    className="ml-auto inline-block text-xs underline-offset-4 hover:underline"
                    href="/forgot-password"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    required
                    type={visible ? "text" : "password"}
                  />
                  <HugeiconsIcon
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-all hover:text-foreground"
                    icon={visible ? EyeOff : EyeIcon}
                    onClick={() => setVisible(!visible)}
                    size={16}
                  />
                </div>
              </Field>
              <Field>
                <Button disabled={isLoading} type="submit">
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <Card className=" flex w-full w-[350px] flex-col gap-2 bg-muted/50">
        <CardHeader>
          <CardDescription className="text-sm">
            Test credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Email:</span>
            <code className="rounded bg-background px-2 py-0.5 text-xs font-mono">
              test@gmail.com
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Password:</span>
            <code className="rounded bg-background px-2 py-0.5 text-xs font-mono">
              password
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default LoginForm;
