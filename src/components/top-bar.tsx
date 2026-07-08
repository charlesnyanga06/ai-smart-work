import { useNavigate } from "@tanstack/react-router";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/lib/profile-store";
import { useTheme } from "@/lib/theme";

const searchItems: { label: string; url: string; group: string }[] = [
  { label: "Dashboard", url: "/", group: "Pages" },
  { label: "Email Generator", url: "/email", group: "Tools" },
  { label: "Meeting Notes", url: "/notes", group: "Tools" },
  { label: "Task Planner", url: "/tasks", group: "Tools" },
  { label: "Research Assistant", url: "/research", group: "Tools" },
  { label: "AI Chat", url: "/chat", group: "Tools" },
  { label: "Analytics", url: "/analytics", group: "Pages" },
  { label: "Settings", url: "/settings", group: "Pages" },
];

export function TopBar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:px-4">
      <SidebarTrigger />
      <div className="mx-auto hidden max-w-md flex-1 sm:block">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search anything…</span>
          <kbd className="rounded border bg-background px-1.5 py-0.5 text-xs">⌘K</kbd>
        </button>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setOpen(true)}>
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="text-sm">Project brief due tomorrow</span>
              <span className="text-xs text-muted-foreground">Task planner</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="text-sm">New meeting notes ready to review</span>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="text-sm">Weekly analytics report is available</span>
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
                  AI
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">Alex Nguyen</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>Alex Nguyen</span>
                <span className="text-xs font-normal text-muted-foreground">alex@work.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Plan</span>
              <Badge className="ml-auto" variant="secondary">
                Pro
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, tools, and actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {["Pages", "Tools"].map((group) => (
            <CommandGroup key={group} heading={group}>
              {searchItems
                .filter((i) => i.group === group)
                .map((i) => (
                  <CommandItem
                    key={i.url}
                    onSelect={() => {
                      setOpen(false);
                      navigate({ to: i.url });
                    }}
                  >
                    {i.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
