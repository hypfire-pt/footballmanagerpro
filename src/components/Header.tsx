import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-pitch-green">
              Football Manager
            </h1>
            <nav className="hidden md:flex gap-6">
              <NavLink
                to="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/squad"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground"
              >
                Squad
              </NavLink>
              <NavLink
                to="/tactics"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground"
              >
                Tactics
              </NavLink>
              <NavLink
                to="/league"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground"
              >
                League
              </NavLink>
            </nav>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
