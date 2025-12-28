import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/app/actions/auth";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ThemeSwitch } from "./theme-switch";

export default async function Header() {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        return (
        <header className="flex px-8 py-4 border-b items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="logo.svg" alt="Coin Mantra" width={26} height={26} />
            <h1 className="text-xl font-bold">CoinMantra</h1>
          </Link>
          <div className="flex gap-4 items-center">
            <ThemeSwitch/>
          {session ? (
            <div className="flex gap-4">
              <Button variant="secondary">Go to Dashboard <HugeiconsIcon icon={ArrowRightIcon}/></Button>
            <form action={signOutAction}>
              <Button type="submit">Sign Out</Button>
            </form>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Sign Up</Button> 
              </Link>
            </div>
          )}
          </div>
        </header>
        )
}