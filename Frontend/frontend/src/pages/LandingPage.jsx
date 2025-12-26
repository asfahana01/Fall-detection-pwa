import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Activity, MapPin, Bell, Users, Zap } from "lucide-react";
import axios from "axios";
import { API } from "@/App";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true,
        });
        if (response.data) {
          navigate("/dashboard", { state: { user: response.data } });
        }
      } catch (error) {
        // Not authenticated, stay on landing
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Activity,
      title: "Real-Time Detection",
      description: "Advanced sensor monitoring using accelerometer and gyroscope data",
    },
    {
      icon: Zap,
      title: "Hybrid AI Analysis",
      description: "Combines threshold rules with ML for accurate fall detection",
    },
    {
      icon: Bell,
      title: "Instant Alerts",
      description: "Multi-channel notifications via SMS, Email, and Push",
    },
    {
      icon: MapPin,
      title: "Live Location",
      description: "Real-time GPS tracking shared with emergency contacts",
    },
    {
      icon: Users,
      title: "Emergency Contacts",
      description: "Manage trusted contacts who receive instant alerts",
    },
    {
      icon: Shield,
      title: "False Alarm Reduction",
      description: "Smart algorithms minimize unnecessary notifications",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Navigation */}
          <nav className="flex justify-between items-center mb-20">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-foreground">SafeGuard</span>
            </div>
            <Button
              data-testid="login-btn"
              onClick={handleLogin}
              className="rounded-full px-6"
            >
              Get Started
            </Button>
          </nav>

          {/* Hero content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Real-Time Protection
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Emergency Detection{" "}
                <span className="text-red-500">When It Matters</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Advanced fall detection system using smartphone sensors and AI to keep you and your loved ones safe. Instant alerts, live location sharing, and 24/7 monitoring.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  data-testid="get-started-btn"
                  onClick={handleLogin}
                  size="lg"
                  className="rounded-full px-8 bg-red-600 hover:bg-red-700 text-white"
                >
                  Start Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">99.2%</p>
                  <p className="text-sm text-muted-foreground">Detection Rate</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">&lt;3s</p>
                  <p className="text-sm text-muted-foreground">Alert Time</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">24/7</p>
                  <p className="text-sm text-muted-foreground">Monitoring</p>
                </div>
              </div>
            </div>

            {/* Hero image/illustration */}
            <div className="relative hidden lg:block animate-fade-in stagger-2">
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Phone mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] shadow-2xl p-4">
                  <div className="h-full w-full bg-slate-950 rounded-[2.5rem] overflow-hidden relative">
                    {/* Screen content */}
                    <div className="absolute inset-4 flex flex-col items-center justify-center">
                      {/* Status indicator */}
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-emerald-400 font-medium mb-6">System Active</p>
                      
                      {/* Sensor bars */}
                      <div className="w-full max-w-xs space-y-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-8">X</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-blue-500 rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-8">Y</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-1/2 bg-emerald-500 rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-8">Z</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-amber-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -right-4 top-1/4 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg animate-slide-up stagger-3">
                  <Bell className="w-6 h-6 text-red-500" />
                </div>
                <div className="absolute -left-4 bottom-1/3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg animate-slide-up stagger-4">
                  <MapPin className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Comprehensive Protection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our system combines cutting-edge technology with reliable notification systems to ensure help arrives when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="card-hover border-0 bg-white dark:bg-slate-800/50 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-emerald-500/20 blur-3xl" />
            
            <div className="relative bg-slate-900 dark:bg-slate-800 rounded-3xl p-12 text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Stay Protected?
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust SafeGuard for their personal safety. Set up takes less than 2 minutes.
              </p>
              <Button
                data-testid="cta-signup-btn"
                onClick={handleLogin}
                size="lg"
                className="rounded-full px-10 bg-white text-slate-900 hover:bg-slate-100"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="font-bold text-foreground">SafeGuard</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 SafeGuard. Your safety is our priority.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
