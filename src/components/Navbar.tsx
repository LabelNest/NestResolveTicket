import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const navItems = ["Product", "Solutions", "Developers", "Pricing"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 lg:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">IR</span>
          </div>
          <span className="font-serif text-lg font-semibold text-foreground tracking-tight">
            Refinery
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {/* {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="nav-link text-sm font-medium"
            >
              {item}
            </a>
          ))} */}
        </div>

        {/* CTA Button */}
        {/* <div className="hidden lg:block">
          <Button 
            variant="outline" 
            className="rounded-full px-6 border-border text-foreground hover:bg-secondary hover:text-foreground"
          >
            LAUNCH CONSOLE
          </Button>
        </div> */}

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 glass-card mt-2 mx-4 rounded-2xl p-6 animate-slide-up">
          <div className="flex flex-col gap-4">
            {/* {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="nav-link text-sm font-medium py-2"
              >
                {item}
              </a>
            ))} */}
            {/* <Button 
              variant="outline" 
              className="rounded-full mt-4 border-border text-foreground hover:bg-secondary"
            >
              LAUNCH CONSOLE
            </Button> */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
