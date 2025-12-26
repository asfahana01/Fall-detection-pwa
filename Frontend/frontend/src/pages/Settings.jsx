import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API, useAuth } from "@/App";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  Activity,
  MapPin,
  Bell,
  MessageSquare,
  Mail,
  Clock,
  Save,
  Gauge
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    fall_detection_enabled: true,
    sensitivity: "medium",
    auto_alert_delay: 30,
    location_tracking_enabled: true,
    alert_sms: true,
    alert_email: true,
    alert_push: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`, {
        withCredentials: true,
      });
      setSettings(response.data);
      setOriginalSettings(response.data);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${API}/settings`, settings, {
        withCredentials: true,
      });
      setOriginalSettings(settings);
      setHasChanges(false);
      toast.success("Settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const getSensitivityDescription = (sensitivity) => {
    switch (sensitivity) {
      case "low":
        return "Fewer alerts, higher threshold for detection. Best for active users.";
      case "medium":
        return "Balanced detection suitable for most users.";
      case "high":
        return "More sensitive detection, may result in more alerts. Recommended for elderly.";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 pb-20 md:pb-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your safety preferences</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div data-testid="settings-page" className="space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your safety preferences</p>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>

        {/* Detection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Fall Detection
            </CardTitle>
            <CardDescription>
              Configure how the system detects falls and anomalies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="settings-row">
              <div>
                <Label className="font-medium">Enable Fall Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Monitor sensors for fall events
                </p>
              </div>
              <Switch
                data-testid="fall-detection-switch"
                checked={settings.fall_detection_enabled}
                onCheckedChange={(checked) =>
                  handleChange("fall_detection_enabled", checked)
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Detection Sensitivity
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {getSensitivityDescription(settings.sensitivity)}
                  </p>
                </div>
              </div>
              <Select
                value={settings.sensitivity}
                onValueChange={(value) => handleChange("sensitivity", value)}
              >
                <SelectTrigger data-testid="sensitivity-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Sensitivity</SelectItem>
                  <SelectItem value="medium">Medium Sensitivity</SelectItem>
                  <SelectItem value="high">High Sensitivity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Auto-Alert Delay
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Wait {settings.auto_alert_delay} seconds before sending alerts after detection
                  </p>
                </div>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {settings.auto_alert_delay}s
                </span>
              </div>
              <Slider
                data-testid="delay-slider"
                value={[settings.auto_alert_delay]}
                onValueChange={([value]) => handleChange("auto_alert_delay", value)}
                min={5}
                max={120}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 sec</span>
                <span>120 sec</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </CardTitle>
            <CardDescription>
              Configure location tracking and sharing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="settings-row border-none">
              <div>
                <Label className="font-medium">Enable Location Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Share your location with emergency contacts during alerts
                </p>
              </div>
              <Switch
                data-testid="location-tracking-switch"
                checked={settings.location_tracking_enabled}
                onCheckedChange={(checked) =>
                  handleChange("location_tracking_enabled", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you and your contacts receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="settings-row">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send text message alerts to contacts
                  </p>
                </div>
              </div>
              <Switch
                data-testid="sms-alerts-switch"
                checked={settings.alert_sms}
                onCheckedChange={(checked) => handleChange("alert_sms", checked)}
              />
            </div>

            <div className="settings-row">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email alerts to contacts
                  </p>
                </div>
              </div>
              <Switch
                data-testid="email-alerts-switch"
                checked={settings.alert_email}
                onCheckedChange={(checked) => handleChange("alert_email", checked)}
              />
            </div>

            <div className="settings-row">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications
                  </p>
                </div>
              </div>
              <Switch
                data-testid="push-alerts-switch"
                checked={settings.alert_push}
                onCheckedChange={(checked) => handleChange("alert_push", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button (Mobile) */}
        {hasChanges && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur border-t md:hidden">
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
