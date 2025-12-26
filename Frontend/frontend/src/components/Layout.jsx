import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  History, 
  Settings, 
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { API } from "@/App";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/contacts", label: "Contacts", icon: Users },
  { path: "/history", label: "History", icon: History },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      navigate("/");
    } catch (error) {
      navigate("/");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur border-b border-border z-50">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-red-500" />
            <span className="text-lg font-bold text-foreground">SafeGuard</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link flex items-center gap-2 text-sm font-medium ${
                  location.pathname === item.path
                    ? "text-foreground active"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur border-b border-border z-50">
        <div className="flex items-center justify-between h-full px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            <span className="font-bold text-foreground">SafeGuard</span>
          </Link>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname === item.path
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="pt-14 md:pt-16 px-4 md:px-6 pb-4">
        <div className="max-w-7xl mx-auto py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
