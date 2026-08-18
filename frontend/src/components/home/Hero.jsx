import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
        {/* Left: text content */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold tracking-wide text-gray-600">
              JOIN 50,000+ ALUMNI WORLDWIDE
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-[1.05] text-dark">
            Connect. Mentor.
            <br />
            <span className="text-primary">Grow.</span>
          </h1>

          <p className="text-gray-500 text-base mt-6 max-w-md leading-relaxed">
            Build lifelong relationships. Unlock the power of your university
            network. Discover career opportunities, find industry mentors, and
            stay connected with the brightest minds in your field.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="mt-9 inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>

        {/* Right: illustration card */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-[4/3]">
          {/* background photo */}
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
            alt="Alumni network"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* dark gradient overlay so text stays readable on top of the photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/30 to-dark/10" />

          {/* text — absolutely positioned so it always sits at the bottom
              regardless of how many/few other children this card has */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="text-white font-semibold text-lg">Global Elite Network</p>
            <p className="text-gray-200 text-xs mt-1">
              Empowering leaders · Fostering elite institutions
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
