import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { signUpAction } from "@/app/actions/auth";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form action={signUpAction} className="flex flex-col gap-3 w-64">
        <Input type="text" name="name" placeholder="Name" required />
        <Input type="email" name="email" placeholder="Email" required />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <Button type="submit">Sign Up</Button>
      </form>
    </div>
  );
}