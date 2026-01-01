"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { UnfoldMoreIcon, UserCircleIcon } from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  return (
    <header className="flex px-8 py-4 border-b items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Image src="logo.svg" alt="Coin Mantra" width={26} height={26} />
        <h1 className="text-xl font-bold">CoinWatch</h1>
      </Link>
      <div className="flex text-sm font-regular gap-[24px]">
        <Link
          href="/dashboard"
          className={
            pathname === "/dashboard" ? "text-primary font-semibold" : ""
          }
        >
          Dashboard
        </Link>
        <Popover>
          <PopoverTrigger className="cursor-pointer">Search</PopoverTrigger>
          <PopoverContent className="w-[400px] h-[200px] p-0">
            <Input />
          </PopoverContent>
        </Popover>
        <Link
          href="/watchlist"
          className={
            pathname === "/watchlist" ? "text-primary font-semibold" : ""
          }
        >
          Watchlist
        </Link>
        <Link
          href="/news"
          className={pathname === "/news" ? "text-primary font-semibold" : ""}
        >
          News
        </Link>
      </div>
      <div className="flex gap-4 items-center">
        {session ? (
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger className="cursor-pointer flex gap-2 items-center justify-center">
                <HugeiconsIcon icon={UserCircleIcon} size={24} />
                <p className="flex text-sm font-regular">
                  {session.user?.name}
                </p>
                <HugeiconsIcon icon={UnfoldMoreIcon} size={16} />
              </PopoverTrigger>
              <PopoverContent>
                <form action={signOutAction}>
                  <Button type="submit">Sign Out</Button>
                </form>
              </PopoverContent>
            </Popover>
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
  );
}
