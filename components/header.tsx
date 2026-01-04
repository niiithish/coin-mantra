"use client";
import { UnfoldMoreIcon, UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import SearchDialog from "@/components/search-dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  return (
    <header className="flex items-center justify-between border-b px-8 py-4">
      <Link className="flex items-center gap-2" href="/">
        <Image alt="Coin Mantra" height={26} src="logo.svg" width={26} />
        <h1 className="font-bold text-xl">CoinWatch</h1>
      </Link>
      <div className="flex gap-[24px] font-regular text-sm">
        <Link
          className={
            pathname === "/dashboard" ? "font-semibold text-primary" : ""
          }
          href="/dashboard"
        >
          Dashboard
        </Link>
        <SearchDialog />
        <Link
          className={
            pathname === "/watchlist" ? "font-semibold text-primary" : ""
          }
          href="/watchlist"
        >
          Watchlist
        </Link>
        <Link
          className={pathname === "/news" ? "font-semibold text-primary" : ""}
          href="/news"
        >
          News
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger className="flex cursor-pointer items-center justify-center gap-2">
                <HugeiconsIcon icon={UserCircleIcon} size={24} />
                <p className="flex font-regular text-sm">
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
