import { createFileRoute } from "@tanstack/react-router";
import { Bell, Moon, Palette, Settings as SettingsIcon, Shield, Sun, User } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile, preferences, and workspace."
        icon={<SettingsIcon className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Profile
            </CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-lg font-semibold text-primary-foreground">
                  AN
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Change photo
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="name" className="mb-1.5 block">
                  Name
                </Label>
                <Input id="name" defaultValue="Alex Nguyen" />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1.5 block">
                  Email
                </Label>
                <Input id="email" type="email" defaultValue="alex@work.com" />
              </div>
              <div>
                <Label htmlFor="role" className="mb-1.5 block">
                  Role
                </Label>
                <Input id="role" defaultValue="Product Manager" />
              </div>
              <div>
                <Label htmlFor="tz" className="mb-1.5 block">
                  Time zone
                </Label>
                <Input id="tz" defaultValue="America/Los_Angeles" />
              </div>
            </div>
            <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" /> Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex-1 gap-1"
                >
                  <Sun className="h-4 w-4" /> Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex-1 gap-1"
                >
                  <Moon className="h-4 w-4" /> Dark
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle label="Deadline reminders" defaultChecked />
              <Toggle label="Weekly summary" defaultChecked />
              <Toggle label="Product updates" />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle label="Store chat history locally" defaultChecked />
              <Toggle label="Share anonymous usage analytics" />
              <p className="text-xs text-muted-foreground">
                Your data stays in your browser. AI outputs are for reference only — always review
                before sharing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
