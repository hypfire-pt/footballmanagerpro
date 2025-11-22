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
import { AlertCircle, User, Lock, LogOut, Calendar, Settings, Palette, Pencil, Check, X, Bell, Volume2, Eye, Wrench, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";

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

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    in_game_alerts: true,
    notification_sound: true,
  });

  const [audioSettings, setAudioSettings] = useState({
    master_volume: 80,
    sfx_volume: 80,
    music_volume: 60,
    commentary_volume: 70,
    mute_all: false,
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    font_size: "medium",
    high_contrast_mode: false,
    reduce_motion: false,
    color_blind_mode: "none",
  });

  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: "private",
    allow_data_collection: true,
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    auto_save_frequency: "normal",
    default_dashboard_view: "overview",
  });

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
        setNotificationSettings({
          email_notifications: data.email_notifications ?? true,
          in_game_alerts: data.in_game_alerts ?? true,
          notification_sound: data.notification_sound ?? true,
        });
        setAudioSettings({
          master_volume: data.master_volume ?? 80,
          sfx_volume: data.sfx_volume ?? 80,
          music_volume: data.music_volume ?? 60,
          commentary_volume: data.commentary_volume ?? 70,
          mute_all: data.mute_all ?? false,
        });
        setAccessibilitySettings({
          font_size: data.font_size || "medium",
          high_contrast_mode: data.high_contrast_mode || false,
          reduce_motion: data.reduce_motion || false,
          color_blind_mode: data.color_blind_mode || "none",
        });
        setPrivacySettings({
          profile_visibility: data.profile_visibility || "private",
          allow_data_collection: data.allow_data_collection ?? true,
        });
        setAdvancedSettings({
          auto_save_frequency: data.auto_save_frequency || "normal",
          default_dashboard_view: data.default_dashboard_view || "overview",
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

  const handleSaveNotifications = async () => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_notifications: notificationSettings.email_notifications,
        in_game_alerts: notificationSettings.in_game_alerts,
        notification_sound: notificationSettings.notification_sound,
      })
      .eq("user_id", user?.id);

    if (updateError) {
      setError(updateError.message);
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    }

    setLoading(false);
  };

  const handleSaveAudio = async () => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        master_volume: audioSettings.master_volume,
        sfx_volume: audioSettings.sfx_volume,
        music_volume: audioSettings.music_volume,
        commentary_volume: audioSettings.commentary_volume,
        mute_all: audioSettings.mute_all,
      })
      .eq("user_id", user?.id);

    if (updateError) {
      setError(updateError.message);
      toast({
        title: "Error",
        description: "Failed to save audio settings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings Saved",
        description: "Your audio settings have been updated.",
      });
    }

    setLoading(false);
  };

  const handleSaveAccessibility = async () => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        font_size: accessibilitySettings.font_size,
        high_contrast_mode: accessibilitySettings.high_contrast_mode,
        reduce_motion: accessibilitySettings.reduce_motion,
        color_blind_mode: accessibilitySettings.color_blind_mode,
      })
      .eq("user_id", user?.id);

    if (updateError) {
      setError(updateError.message);
      toast({
        title: "Error",
        description: "Failed to save accessibility settings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings Saved",
        description: "Your accessibility settings have been updated.",
      });
    }

    setLoading(false);
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        profile_visibility: privacySettings.profile_visibility,
        allow_data_collection: privacySettings.allow_data_collection,
      })
      .eq("user_id", user?.id);

    if (updateError) {
      setError(updateError.message);
      toast({
        title: "Error",
        description: "Failed to save privacy settings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings Saved",
        description: "Your privacy settings have been updated.",
      });
    }

    setLoading(false);
  };

  const handleSaveAdvanced = async () => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        auto_save_frequency: advancedSettings.auto_save_frequency,
        default_dashboard_view: advancedSettings.default_dashboard_view,
      })
      .eq("user_id", user?.id);

    if (updateError) {
      setError(updateError.message);
      toast({
        title: "Error",
        description: "Failed to save advanced settings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings Saved",
        description: "Your advanced settings have been updated.",
      });
    }

    setLoading(false);
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast({
      title: "Cache Cleared",
      description: "All cached data has been cleared. Please refresh the page.",
    });
  };

  const handleExportData = () => {
    const data = {
      profile,
      gamePreferences,
      displaySettings,
      notificationSettings,
      audioSettings,
      accessibilitySettings,
      privacySettings,
      advancedSettings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `football-manager-data-${new Date().toISOString()}.json`;
    a.click();
    toast({
      title: "Data Exported",
      description: "Your data has been downloaded successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-6">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="game">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Game</span>
            </TabsTrigger>
            <TabsTrigger value="display">
              <Palette className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Volume2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility">
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Accessibility</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Lock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Wrench className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="support">
              <HelpCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Support</span>
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

          <TabsContent value="notifications">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive match results and important updates via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, email_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="in-game-alerts">In-Game Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Show notifications for transfers, injuries, and events
                      </p>
                    </div>
                    <Switch
                      id="in-game-alerts"
                      checked={notificationSettings.in_game_alerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, in_game_alerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="notification-sound">Notification Sound</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sound effects for notifications
                      </p>
                    </div>
                    <Switch
                      id="notification-sound"
                      checked={notificationSettings.notification_sound}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, notification_sound: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button onClick={handleSaveNotifications} disabled={loading}>
                    {loading ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Audio Settings</CardTitle>
                <CardDescription>
                  Adjust volume levels and sound preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="mute-all">Mute All</Label>
                      <p className="text-sm text-muted-foreground">
                        Disable all audio
                      </p>
                    </div>
                    <Switch
                      id="mute-all"
                      checked={audioSettings.mute_all}
                      onCheckedChange={(checked) =>
                        setAudioSettings({ ...audioSettings, mute_all: checked })
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="master-volume">Master Volume</Label>
                      <span className="text-sm text-muted-foreground">{audioSettings.master_volume}%</span>
                    </div>
                    <Slider
                      id="master-volume"
                      value={[audioSettings.master_volume]}
                      onValueChange={([value]) => setAudioSettings({ ...audioSettings, master_volume: value })}
                      max={100}
                      step={1}
                      disabled={audioSettings.mute_all}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sfx-volume">Sound Effects</Label>
                      <span className="text-sm text-muted-foreground">{audioSettings.sfx_volume}%</span>
                    </div>
                    <Slider
                      id="sfx-volume"
                      value={[audioSettings.sfx_volume]}
                      onValueChange={([value]) => setAudioSettings({ ...audioSettings, sfx_volume: value })}
                      max={100}
                      step={1}
                      disabled={audioSettings.mute_all}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="music-volume">Music</Label>
                      <span className="text-sm text-muted-foreground">{audioSettings.music_volume}%</span>
                    </div>
                    <Slider
                      id="music-volume"
                      value={[audioSettings.music_volume]}
                      onValueChange={([value]) => setAudioSettings({ ...audioSettings, music_volume: value })}
                      max={100}
                      step={1}
                      disabled={audioSettings.mute_all}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="commentary-volume">Commentary</Label>
                      <span className="text-sm text-muted-foreground">{audioSettings.commentary_volume}%</span>
                    </div>
                    <Slider
                      id="commentary-volume"
                      value={[audioSettings.commentary_volume]}
                      onValueChange={([value]) => setAudioSettings({ ...audioSettings, commentary_volume: value })}
                      max={100}
                      step={1}
                      disabled={audioSettings.mute_all}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button onClick={handleSaveAudio} disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Accessibility Settings</CardTitle>
                <CardDescription>
                  Customize the interface for better accessibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Select
                      value={accessibilitySettings.font_size}
                      onValueChange={(value) =>
                        setAccessibilitySettings({ ...accessibilitySettings, font_size: value })
                      }
                    >
                      <SelectTrigger id="font-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color-blind-mode">Color Blind Mode</Label>
                    <Select
                      value={accessibilitySettings.color_blind_mode}
                      onValueChange={(value) =>
                        setAccessibilitySettings({ ...accessibilitySettings, color_blind_mode: value })
                      }
                    >
                      <SelectTrigger id="color-blind-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                        <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                        <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-contrast">High Contrast Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Increase contrast for better visibility
                      </p>
                    </div>
                    <Switch
                      id="high-contrast"
                      checked={accessibilitySettings.high_contrast_mode}
                      onCheckedChange={(checked) =>
                        setAccessibilitySettings({ ...accessibilitySettings, high_contrast_mode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="reduce-motion">Reduce Motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch
                      id="reduce-motion"
                      checked={accessibilitySettings.reduce_motion}
                      onCheckedChange={(checked) =>
                        setAccessibilitySettings({ ...accessibilitySettings, reduce_motion: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button onClick={handleSaveAccessibility} disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>
                  Manage your privacy preferences and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <Select
                      value={privacySettings.profile_visibility}
                      onValueChange={(value) =>
                        setPrivacySettings({ ...privacySettings, profile_visibility: value })
                      }
                    >
                      <SelectTrigger id="profile-visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-collection">Allow Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve the game by sharing anonymous usage data
                      </p>
                    </div>
                    <Switch
                      id="data-collection"
                      checked={privacySettings.allow_data_collection}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({ ...privacySettings, allow_data_collection: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label>Data Management</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExportData}>
                        Export My Data
                      </Button>
                      <Button variant="outline" onClick={handleClearCache}>
                        Clear Cache
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button onClick={handleSavePrivacy} disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Fine-tune advanced game behavior and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="auto-save">Auto-Save Frequency</Label>
                    <Select
                      value={advancedSettings.auto_save_frequency}
                      onValueChange={(value) =>
                        setAdvancedSettings({ ...advancedSettings, auto_save_frequency: value })
                      }
                    >
                      <SelectTrigger id="auto-save">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="low">Low (Every 30 minutes)</SelectItem>
                        <SelectItem value="normal">Normal (Every 15 minutes)</SelectItem>
                        <SelectItem value="high">High (Every 5 minutes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dashboard-view">Default Dashboard View</Label>
                    <Select
                      value={advancedSettings.default_dashboard_view}
                      onValueChange={(value) =>
                        setAdvancedSettings({ ...advancedSettings, default_dashboard_view: value })
                      }
                    >
                      <SelectTrigger id="dashboard-view">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overview">Overview</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button onClick={handleSaveAdvanced} disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Support & Legal</CardTitle>
                <CardDescription>
                  Get help and view legal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <h3 className="font-semibold mb-2">App Version</h3>
                    <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Help & Documentation</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        View FAQ
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Contact Support
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Report a Bug
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Legal</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Terms of Service
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Privacy Policy
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Licenses
                      </Button>
                    </div>
                  </div>
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
