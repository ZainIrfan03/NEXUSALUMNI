import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Users } from "lucide-react";

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
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-[4/3] flex flex-col justify-between p-8">
          {/* background photo */}
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
            alt="Alumni network"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* dark gradient overlay so text/icons stay readable on top of the photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/30 to-dark/10" />

          <div className="relative flex items-center justify-center gap-6">
            {["member-a", "member-b", "member-c", "member-d"].map((memberKey) => (
              <div
                key={memberKey}
                className="h-16 w-16 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm border border-white/40 flex items-center justify-center"
              >
                <Users size={22} className="text-primary" />
              </div>
            ))}
          </div>

          <div className="relative flex items-end justify-between">
            <div>
              <p className="text-white font-semibold text-lg">Global Elite Network</p>
              <p className="text-gray-200 text-xs mt-1">
                Empowering leaders · Fostering elite institutions
              </p>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap hover:opacity-90 transition-opacity"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}