import { createFileRoute } from "@tanstack/react-router";
import { Bell, Moon, Palette, Settings as SettingsIcon, Shield, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useProfile, updateProfile } from "@/lib/profile-store";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const profileSchema = z.object({
  name: z.string().trim().nonempty("Name is required").max(80, "Name is too long"),
  email: z.string().trim().email("Invalid email").max(255),
  role: z.string().trim().max(80, "Role is too long"),
  timezone: z.string().trim().max(80, "Time zone is too long"),
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const profile = useProfile();

  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    role: profile.role,
    timezone: profile.timezone,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const set = <K extends keyof typeof form>(key: K, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSave = () => {
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof typeof form, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof typeof form;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the errors before saving");
      return;
    }
    setErrors({});
    updateProfile(result.data);
    toast.success("Profile saved");
  };

  const onReset = () => {
    setForm({
      name: profile.name,
      email: profile.email,
      role: profile.role,
      timezone: profile.timezone,
    });
    setErrors({});
  };

  const dirty =
    form.name !== profile.name ||
    form.email !== profile.email ||
    form.role !== profile.role ||
    form.timezone !== profile.timezone;

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
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                Your initials update automatically from your name.
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field
                id="name"
                label="Name"
                value={form.name}
                onChange={(v) => set("name", v)}
                error={errors.name}
                maxLength={80}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
                error={errors.email}
                maxLength={255}
              />
              <Field
                id="role"
                label="Role"
                value={form.role}
                onChange={(v) => set("role", v)}
                error={errors.role}
                maxLength={80}
              />
              <Field
                id="tz"
                label="Time zone"
                value={form.timezone}
                onChange={(v) => set("timezone", v)}
                error={errors.timezone}
                maxLength={80}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={onSave} disabled={!dirty}>
                Save changes
              </Button>
              <Button variant="outline" onClick={onReset} disabled={!dirty}>
                Cancel
              </Button>
            </div>
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

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        aria-invalid={!!error}
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
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
