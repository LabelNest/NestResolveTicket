import { Menu, X, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 lg:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">IR</span>
          </div>
          <span className="font-serif text-lg font-semibold">
            Refinery
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/raise-ticket">
            <Button className="btn-gradient flex items-center gap-2">
              <PlusCircle size={16} />
              Raise Ticket
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden glass-card mt-2 mx-4 rounded-2xl p-6">
          <Link to="/raise-ticket">
            <Button className="w-full btn-gradient">
              Raise Ticket
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
