import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { API, useAuth } from "@/App";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Activity, 
  MapPin, 
  Bell, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState({
    accelerometer: { x: 0, y: 0, z: 9.8 },
    gyroscope: { alpha: 0, beta: 0, gamma: 0 },
  });
  const [location, setLocation] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [systemStatus, setSystemStatus] = useState("active"); // active, warning, emergency
  const [analysisResult, setAnalysisResult] = useState(null);
  const analysisTimeoutRef = useRef(null);

  // Fetch stats and recent alerts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          axios.get(`${API}/stats`, { withCredentials: true }),
          axios.get(`${API}/alerts?limit=5`, { withCredentials: true }),
        ]);
        setStats(statsRes.data);
        setRecentAlerts(alertsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.warn("Location error:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Sensor monitoring simulation (in real app, use DeviceMotion API)
  useEffect(() => {
    if (!isMonitoring) return;

    // Try to use real device sensors
    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity || { x: 0, y: 0, z: 9.8 };
      setSensorData((prev) => ({
        ...prev,
        accelerometer: {
          x: acc.x || 0,
          y: acc.y || 0,
          z: acc.z || 9.8,
        },
      }));
    };

    const handleOrientation = (event) => {
      setSensorData((prev) => ({
        ...prev,
        gyroscope: {
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0,
        },
      }));
    };

    // Request permission for iOS
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleMotion);
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Fallback: simulate sensor data for demo
    const simulateInterval = setInterval(() => {
      setSensorData((prev) => ({
        accelerometer: {
          x: prev.accelerometer.x + (Math.random() - 0.5) * 0.2,
          y: prev.accelerometer.y + (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3,
        },
        gyroscope: {
          alpha: (prev.gyroscope.alpha + (Math.random() - 0.5) * 2) % 360,
          beta: Math.max(-90, Math.min(90, prev.gyroscope.beta + (Math.random() - 0.5) * 2)),
          gamma: Math.max(-90, Math.min(90, prev.gyroscope.gamma + (Math.random() - 0.5) * 2)),
        },
      }));
    }, 100);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
      clearInterval(simulateInterval);
    };
  }, [isMonitoring]);

  // Analyze sensor data periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const analyzeData = async () => {
      try {
        const response = await axios.post(
          `${API}/analyze`,
          { sensor_data: sensorData, location },
          { withCredentials: true }
        );
        setAnalysisResult(response.data);

        if (response.data.is_fall) {
          setSystemStatus("emergency");
          toast.error("Fall detected! Sending alerts...", {
            description: "Emergency contacts will be notified.",
          });
          
          // Trigger alert
          await axios.post(
            `${API}/alerts`,
            {
              event_type: "fall",
              severity: response.data.severity || "high",
              sensor_data: sensorData,
              location,
              ml_confidence: response.data.confidence,
            },
            { withCredentials: true }
          );
        } else if (response.data.is_anomaly) {
          setSystemStatus("warning");
        } else {
          setSystemStatus("active");
        }
      } catch (error) {
        console.error("Analysis error:", error);
      }
    };

    analysisTimeoutRef.current = setTimeout(analyzeData, 5000);

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [sensorData, location, isMonitoring]);

  // Trigger SOS
  const triggerSOS = async () => {
    try {
      setSystemStatus("emergency");
      await axios.post(
        `${API}/sos`,
        { location },
        { withCredentials: true }
      );
      toast.error("SOS Alert Sent!", {
        description: "Emergency contacts have been notified with your location.",
      });

      // Refresh alerts
      const alertsRes = await axios.get(`${API}/alerts?limit=5`, { withCredentials: true });
      setRecentAlerts(alertsRes.data);
    } catch (error) {
      toast.error("Failed to send SOS", {
        description: "Please try again or contact emergency services directly.",
      });
    }
  };

  // Format acceleration for display
  const formatAccel = (value) => {
    const normalized = Math.min(100, Math.abs(value) * 10);
    return normalized;
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case "emergency":
        return "bg-red-500";
      case "warning":
        return "bg-amber-500";
      default:
        return "bg-emerald-500";
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case "emergency":
        return "EMERGENCY DETECTED";
      case "warning":
        return "Anomaly Detected";
      default:
        return "System Normal";
    }
  };

  return (
    <Layout>
      <div data-testid="dashboard-page" className="space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome, {user?.name?.split(" ")[0] || "User"}
            </h1>
            <p className="text-muted-foreground">
              Your safety monitoring dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`status-dot ${systemStatus === "active" ? "active" : systemStatus === "warning" ? "warning" : "danger"}`} />
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* SOS Button - Takes 2 columns on desktop */}
          <Card className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 border-0">
            <CardContent className="h-full flex flex-col items-center justify-center p-8">
              <button
                data-testid="sos-button"
                onClick={triggerSOS}
                className="emergency-btn animate-pulse-emergency"
              >
                <Shield className="w-12 h-12 mb-2" />
                <span>SOS</span>
              </button>
              <p className="text-slate-400 mt-6 text-center text-sm">
                Press to send emergency alert with your location
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-slate-300 border-slate-600 hover:bg-slate-700"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? "Pause Monitoring" : "Resume Monitoring"}
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.active_alerts || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contacts</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.contacts_count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sensor Data Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Sensor Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  Accelerometer
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">X</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="sensor-axis-bar x"
                        style={{ width: `${formatAccel(sensorData.accelerometer.x)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {sensorData.accelerometer.x.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">Y</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="sensor-axis-bar y"
                        style={{ width: `${formatAccel(sensorData.accelerometer.y)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {sensorData.accelerometer.y.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">Z</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="sensor-axis-bar z"
                        style={{ width: `${formatAccel(sensorData.accelerometer.z)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {sensorData.accelerometer.z.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  Gyroscope
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-mono font-medium">
                      {sensorData.gyroscope.alpha.toFixed(0)}°
                    </p>
                    <p className="text-xs text-muted-foreground">Alpha</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono font-medium">
                      {sensorData.gyroscope.beta.toFixed(0)}°
                    </p>
                    <p className="text-xs text-muted-foreground">Beta</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono font-medium">
                      {sensorData.gyroscope.gamma.toFixed(0)}°
                    </p>
                    <p className="text-xs text-muted-foreground">Gamma</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Current Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="map-container rounded-xl h-48 flex items-center justify-center relative">
                {location ? (
                  <>
                    <div className="location-pulse" />
                    <div className="map-marker z-10" />
                    <div className="absolute bottom-4 left-4 text-white text-sm">
                      <p className="font-mono">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Accuracy: ±{location.accuracy?.toFixed(0) || "N/A"}m
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400">Location unavailable</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts Card */}
          <Card className="md:col-span-2 md:row-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/history")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((alert) => (
                    <div
                      key={alert.event_id}
                      className={`alert-card ${alert.severity} p-3 rounded-lg bg-muted/50`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {alert.status === "resolved" ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : alert.status === "false_alarm" ? (
                            <Clock className="w-4 h-4 text-amber-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-medium capitalize">
                            {alert.event_type}
                          </span>
                        </div>
                        <Badge
                          variant={
                            alert.status === "active"
                              ? "destructive"
                              : alert.status === "resolved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No recent alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Stats */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">This Week</h3>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.recent_alerts || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Alerts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.false_alarms || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">False Alarms</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">
                    {stats?.total_alerts ? 
                      Math.round((1 - (stats.false_alarms / stats.total_alerts)) * 100) : 100}%
                  </p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
