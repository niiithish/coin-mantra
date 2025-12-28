"use client"

import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Switch } from "@/components/ui/switch";

export const ThemeSwitch = () => {
  const { setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <HugeiconsIcon icon={Sun01Icon} size={16} className="text-muted-foreground" />
      <Switch
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <HugeiconsIcon icon={Moon02Icon} size={16} className="text-muted-foreground" />
    </div>
  );
};