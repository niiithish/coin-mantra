"use client";

import { EyeIcon, EyeOff } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import countries from "world-countries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const countryMap = new Map(
  countries.map((c) => [c.name.common, { flag: c.flag, code: c.cca3 }])
);

const countryNames = Array.from(countryMap.keys()).sort();

const SignUpForm = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const country = formData.get("country") as string;

    try {
      // First sign up
      await authClient.signUp.email({
        email,
        password,
        name,
        country,
      });

      // Then sign in to create a session
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      router.push("/dashboard");
    } catch (_error) {
      toast.error("Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[350px] bg-transparent ring-0">
      <CardHeader>
        <CardTitle>Sign Up to your account</CardTitle>
        <CardDescription>
          Enter your email below to Sign Up to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                type="text"
              />
            </Field>
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
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  className="pr-10"
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
              <FieldLabel htmlFor="country">Country</FieldLabel>
              <Combobox items={countryNames}>
                <ComboboxInput
                  name="country"
                  placeholder="Select Country"
                  required
                />
                <ComboboxContent>
                  <ComboboxEmpty>No country found.</ComboboxEmpty>
                  <ComboboxList>
                    {(name: string) => {
                      const data = countryMap.get(name);
                      return (
                        <ComboboxItem key={data?.code} value={name}>
                          <span className="flex items-center gap-2">
                            <span>{data?.flag}</span>
                            <span>{name}</span>
                          </span>
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
            <Field>
              <Button disabled={isLoading} type="submit">
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/login">Login</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
