const HeroSection = () => {
  return (
    <div className="flex flex-col justify-center h-full animate-slide-right">
      {/* Label Pill */}
      <div className="pill-label inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit mb-8">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span className="text-xs font-medium text-primary tracking-wide uppercase">
          Enterprise Intelligence Platform
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold text-foreground leading-[1.05] mb-6">
        The Intelligence
        <br />
        <span className="text-primary">Refinery.</span>
      </h1>

      {/* Subtext */}
      <p className="text-muted-foreground text-base sm:text-lg max-w-md leading-relaxed">
        Transform raw data into actionable insights. 
        Our enterprise-grade AI platform processes, refines, and 
        delivers intelligence at scale.
      </p>

      {/* Stats or Trust Indicators */}
      {/* <div className="flex items-center gap-8 mt-12">
        <div>
          <p className="text-2xl font-semibold text-foreground">10M+</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Queries Daily</p>
        </div>
        <div className="w-px h-10 bg-border"></div>
        <div>
          <p className="text-2xl font-semibold text-foreground">99.9%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Uptime SLA</p>
        </div>
        <div className="w-px h-10 bg-border hidden sm:block"></div>
        <div className="hidden sm:block">
          <p className="text-2xl font-semibold text-foreground">500+</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Enterprises</p>
        </div>
      </div> */}
    </div>
  );
};

export default HeroSection;
