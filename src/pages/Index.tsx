
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LoginCard from "@/components/LoginCard";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />

      <main className="relative z-10 min-h-screen flex items-center px-6 lg:px-12 pt-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <HeroSection />
            </div>

            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <LoginCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

