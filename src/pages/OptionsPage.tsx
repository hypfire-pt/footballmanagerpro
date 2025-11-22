import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, User, Lock, LogOut, Calendar, Settings, Palette, Pencil, Check, X } from "lucide-react";
import { format } from "date-fns";

const OptionsPage = () => {
  const { user, updatePassword, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [gamePreferences, setGamePreferences] = useState({
    preferred_language: "en",
    match_speed_default: "normal",
    tutorial_hints_enabled: true,
  });

  const [displaySettings, setDisplaySettings] = useState({
    theme_mode: "dark",
    ui_compact_mode: false,
    sidebar_default_collapsed: false,
    animations_enabled: true,
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedManagerName, setEditedManagerName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
        // Load preferences into state
        setGamePreferences({
          preferred_language: data.preferred_language || "en",
          match_speed_default: data.match_speed_default || "normal",
          tutorial_hints_enabled: data.tutorial_hints_enabled ?? true,
        });
        setDisplaySettings({
          theme_mode: data.theme_mode || "dark",
          ui_compact_mode: data.ui_compact_mode || false,
          sidebar_default_collapsed: data.sidebar_default_collapsed || false,
          animations_enabled: data.animations_enabled ?? true,
        });
      }
    };

    fetchProfile();
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error: updateError } = await updatePassword(passwordForm.newPassword);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Password updated successfully!");
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveGamePreferences = async () => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        preferred_language: gamePreferences.preferred_language,
        match_speed_default: gamePreferences.match_speed_default,
        tutorial_hints_enabled: gamePreferences.tutorial_hints_enabled,
      })
      .eq("user_id", user?.id);

    if (updateError) {
      setError(updateError.message);
      toast({
        title: "Error",
        description: "Failed to save game preferences.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Preferences Saved",
        description: "Your game preferences have been updated successfully.",
      });
    }

    setLoading(false);
  };

  const handleSaveDisplaySettings = async () => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        theme_mode: displaySettings.theme_mode,
        ui_compact_mode: displaySettings.ui_compact_mode,
        sidebar_default_collapsed: displaySettings.sidebar_default_collapsed,
        animations_enabled: displaySettings.animations_enabled,
      })
      .eq("user_id", user?.id);

    if (updateError) {
      setError(updateError.message);
      toast({
        title: "Error",
        description: "Failed to save display settings.",
        variant: "destructive",
      });
    } else {
      // Apply theme changes immediately
      if (displaySettings.theme_mode === "dark") {
        document.documentElement.classList.add("dark");
      } else if (displaySettings.theme_mode === "light") {
        document.documentElement.classList.remove("dark");
      }

      toast({
        title: "Settings Saved",
        description: "Your display settings have been updated successfully.",
      });
    }

    setLoading(false);
  };

  const handleEditManagerName = () => {
    setEditedManagerName(profile?.manager_name || "");
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedManagerName("");
  };

  const handleSaveManagerName = async () => {
    const trimmedName = editedManagerName.trim();
    
    if (!trimmedName) {
      toast({
        title: "Validation Error",
        description: "Manager name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length > 50) {
      toast({
        title: "Validation Error",
        description: "Manager name must be less than 50 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ manager_name: trimmedName })
      .eq("user_id", user?.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update manager name.",
        variant: "destructive",
      });
    } else {
      setProfile({ ...profile, manager_name: trimmedName });
      setIsEditingName(false);
      toast({
        title: "Manager Name Updated",
        description: "Your manager name has been updated successfully.",
      });
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="game">
              <Settings className="h-4 w-4 mr-2" />
              Game
            </TabsTrigger>
            <TabsTrigger value="display">
              <Palette className="h-4 w-4 mr-2" />
              Display
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View your account details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Manager Name</Label>
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedManagerName}
                          onChange={(e) => setEditedManagerName(e.target.value)}
                          placeholder="Enter manager name"
                          maxLength={50}
                          disabled={loading}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleSaveManagerName}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelEditName}
                          disabled={loading}
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium flex-1">{profile?.manager_name || "Loading..."}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleEditManagerName}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email Address</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                      <span className="font-medium">{user?.email || "Loading..."}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Account Created</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {profile?.created_at
                          ? format(new Date(profile.created_at), "MMMM d, yyyy")
                          : "Loading..."}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Language</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                      <span className="font-medium">
                        {profile?.preferred_language?.toUpperCase() || "EN"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full md:w-auto"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 border-primary/50 bg-primary/10">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPasswordForm({
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setError(null);
                        setSuccess(null);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="game">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Game Preferences</CardTitle>
                <CardDescription>
                  Customize your gameplay experience and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={gamePreferences.preferred_language}
                      onValueChange={(value) =>
                        setGamePreferences({ ...gamePreferences, preferred_language: value })
                      }
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="match-speed">Default Match Speed</Label>
                    <Select
                      value={gamePreferences.match_speed_default}
                      onValueChange={(value) =>
                        setGamePreferences({ ...gamePreferences, match_speed_default: value })
                      }
                    >
                      <SelectTrigger id="match-speed">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="instant">Instant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="tutorial-hints">Tutorial Hints</Label>
                      <p className="text-sm text-muted-foreground">
                        Show helpful tooltips and guidance
                      </p>
                    </div>
                    <Switch
                      id="tutorial-hints"
                      checked={gamePreferences.tutorial_hints_enabled}
                      onCheckedChange={(checked) =>
                        setGamePreferences({ ...gamePreferences, tutorial_hints_enabled: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button onClick={handleSaveGamePreferences} disabled={loading}>
                    {loading ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize the appearance and interface of the game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme Mode</Label>
                    <Select
                      value={displaySettings.theme_mode}
                      onValueChange={(value) =>
                        setDisplaySettings({ ...displaySettings, theme_mode: value })
                      }
                    >
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use a more dense layout with smaller spacing
                      </p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={displaySettings.ui_compact_mode}
                      onCheckedChange={(checked) =>
                        setDisplaySettings({ ...displaySettings, ui_compact_mode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="sidebar-collapsed">Sidebar Default State</Label>
                      <p className="text-sm text-muted-foreground">
                        Start with sidebar collapsed on page load
                      </p>
                    </div>
                    <Switch
                      id="sidebar-collapsed"
                      checked={displaySettings.sidebar_default_collapsed}
                      onCheckedChange={(checked) =>
                        setDisplaySettings({ ...displaySettings, sidebar_default_collapsed: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="animations">Enable Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Show smooth transitions and visual effects
                      </p>
                    </div>
                    <Switch
                      id="animations"
                      checked={displaySettings.animations_enabled}
                      onCheckedChange={(checked) =>
                        setDisplaySettings({ ...displaySettings, animations_enabled: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button onClick={handleSaveDisplaySettings} disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OptionsPage;
