import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API, useAuth } from "@/App";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  MoreVertical,
  Ban,
  Check,
  Activity
} from "lucide-react";

export default function AlertHistory() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const response = await axios.get(`${API}/alerts`, {
        params: { ...params, limit: 100 },
        withCredentials: true,
      });
      setAlerts(response.data);
    } catch (error) {
      toast.error("Failed to load alerts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (eventId) => {
    try {
      await axios.put(`${API}/alerts/${eventId}/resolve`, {}, {
        withCredentials: true,
      });
      toast.success("Alert resolved");
      fetchAlerts();
    } catch (error) {
      toast.error("Failed to resolve alert");
    }
  };

  const handleFalseAlarm = async (eventId) => {
    try {
      await axios.put(`${API}/alerts/${eventId}/false-alarm`, {}, {
        withCredentials: true,
      });
      toast.success("Marked as false alarm");
      fetchAlerts();
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "fall":
        return <Activity className="w-5 h-5 text-red-500" />;
      case "sos":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-amber-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="destructive" className="gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Active
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="default" className="gap-1 bg-emerald-500">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </Badge>
        );
      case "false_alarm":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            False Alarm
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const resolvedCount = alerts.filter((a) => a.status === "resolved").length;
  const falseAlarmCount = alerts.filter((a) => a.status === "false_alarm").length;

  return (
    <Layout>
      <div data-testid="alert-history-page" className="space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Alert History
          </h1>
          <p className="text-muted-foreground">
            View and manage all detected events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => setFilter("active")}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-500">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={() => setFilter("resolved")}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-500">{resolvedCount}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => setFilter("false_alarm")}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-500">{falseAlarmCount}</p>
              <p className="text-sm text-muted-foreground">False Alarms</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="false_alarm">False Alarm</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {isLoading ? (
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
            ) : alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const { date, time } = formatDate(alert.created_at);
                  return (
                    <Card
                      key={alert.event_id}
                      data-testid={`alert-${alert.event_id}`}
                      className={`alert-card ${alert.severity}`}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                              {getEventIcon(alert.event_type)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground capitalize">
                                  {alert.event_type} Detected
                                </h3>
                                {getStatusBadge(alert.status)}
                                <Badge variant={getSeverityColor(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {date} at {time}
                              </p>
                              {alert.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                                </p>
                              )}
                              {alert.ml_confidence && (
                                <p className="text-sm text-muted-foreground">
                                  Confidence: {(alert.ml_confidence * 100).toFixed(0)}%
                                </p>
                              )}
                              {alert.notifications_sent?.length > 0 && (
                                <p className="text-sm text-emerald-500">
                                  {alert.notifications_sent.length} notification(s) sent
                                </p>
                              )}
                            </div>
                          </div>

                          {alert.status === "active" && (
                            <div className="flex gap-2 sm:flex-col">
                              <Button
                                size="sm"
                                onClick={() => handleResolve(alert.event_id)}
                                data-testid={`resolve-${alert.event_id}`}
                                className="flex-1 sm:flex-initial"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFalseAlarm(alert.event_id)}
                                data-testid={`false-alarm-${alert.event_id}`}
                                className="flex-1 sm:flex-initial"
                              >
                                <Ban className="w-4 h-4 mr-1" />
                                False Alarm
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Alerts Found</h3>
                  <p className="text-muted-foreground">
                    {filter !== "all"
                      ? `No ${filter.replace("_", " ")} alerts found.`
                      : "Your alert history will appear here."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
