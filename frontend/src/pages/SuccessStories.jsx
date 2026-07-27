import React, { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

/**
 * Success Stories — full page (Navbar/Footer come from PublicLayout, not here)
 * File: src/pages/SuccessStories.jsx
 */

const filters = ["All Stories", "Technology", "Finance", "Healthcare", "Arts & Design"];

const stories = [
  {
    tag: "Architecture",
    title: "Building Sustainable Cities of the Future",
    desc: "Elena Rodriguez leveraged university grants to research eco-materials, now leading urban development projects across Europe.",
    name: "Elena Rodriguez",
    year: "Class of '18",
    initials: "ER",
    img: "https://images.unsplash.com/photo-1494522358652-f30e61a60313?w=600&q=80",
    dark: false,
  },
  {
    tag: "Biotech",
    title: "Breakthroughs in Genetic Therapies",
    desc: "Dr. James Chen's lab recently published findings that could revolutionize how we approach rare genetic disorders, a journey that started in our very own labs.",
    name: "Dr. James Chen",
    year: "Class of '08",
    initials: "JC",
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    dark: false,
  },
  {
    tag: "Entrepreneurship",
    title: "From Dorm Room to Global App",
    desc: "How a simple idea sketched in the student union became a platform used by millions to manage personal finances efficiently.",
    name: "Aisha Khan",
    year: "Class of '20",
    initials: "AK",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
    dark: false,
  },
];

const quoteStory = {
  tag: "Education",
  title: "Empowering the Next Generation",
  desc: `"The true value of my education was learning how to teach others to learn. That's the legacy I strive to pass on every day in my classroom."`,
  name: "David Brooks",
  year: "Class of '95",
  initials: "DB",
};

export default function SuccessStoriesPage() {
  const [activeFilter, setActiveFilter] = useState("All Stories");

  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Page title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-dark mb-3">Success Stories</h1>
          <p className="text-gray-500">
            Discover the inspiring journeys of our alumni and see how they are
            shaping the world.
          </p>
        </div>

        {/* Featured grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Big featured story */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80"
              alt="Dr. Sarah Jenkins"
              className="w-full h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex gap-2 mb-4">
                <span className="text-xs font-medium text-white bg-white/15 border border-white/30 rounded-md px-2.5 py-1">
                  Technology
                </span>
                <span className="text-xs font-medium text-white bg-white/15 border border-white/30 rounded-md px-2.5 py-1">
                  Class of '14
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Pioneering AI for Global Healthcare
              </h2>
              <p className="text-white/80 text-sm max-w-lg mb-4 leading-relaxed">
                Dr. Sarah Jenkins shares her journey from a curious computer
                science undergrad to founding one of the most innovative
                health-tech startups of the decade.
              </p>
              <a
                href="#"
                className="text-white text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                Read Full Story <ArrowUpRight size={15} />
              </a>
            </div>
          </div>

          {/* Right column: quote + small story */}
          <div className="flex flex-col gap-6">
            <div className="bg-primary rounded-2xl p-8 text-white flex-1">
              <p className="italic text-base leading-relaxed mb-6">
                "The network I built here didn't just open doors; it helped
                me build the entire building. The mentorship was invaluable."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                  SJ
                </div>
                <div>
                  <p className="text-sm font-semibold">Dr. Sarah Jenkins</p>
                  <p className="text-xs text-white/70">CEO, NovaHealth AI</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <p className="text-xs font-medium text-gray-400 mb-2">Finance</p>
              <h3 className="font-semibold text-dark mb-2">
                Redefining Sustainable Investing
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Marcus Chen's innovative approach to green bonds is changing
                how Wall Street views environmental responsibility.
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-600">Marcus Chen, '10</span>
                <ArrowUpRight size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
                  activeFilter === f
                    ? "bg-dark text-white border-dark"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Sort by:</span>
            <button className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-dark font-medium">
              Most Recent <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Story cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl overflow-hidden">
              <div className="relative">
                <img src={s.img} alt={s.title} className="w-full h-48 object-cover" />
                <span className="absolute top-3 right-3 text-xs font-medium text-white bg-black/40 rounded-md px-2.5 py-1">
                  {s.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-dark text-lg mb-2 leading-snug">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{s.desc}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-50 text-primary text-xs font-semibold flex items-center justify-center">
                      {s.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.year}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          ))}

          {/* Highlighted quote-style story */}
          <div className="bg-gray-100 rounded-2xl p-6 flex flex-col">
            <span className="self-start text-xs font-medium text-white bg-dark rounded-md px-2.5 py-1 mb-4">
              {quoteStory.tag}
            </span>
            <h3 className="font-semibold text-dark text-lg mb-2 leading-snug">
              {quoteStory.title}
            </h3>
            <p className="text-sm text-gray-500 italic leading-relaxed mb-5">
              {quoteStory.desc}
            </p>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-auto">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white text-dark text-xs font-semibold flex items-center justify-center">
                  {quoteStory.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-dark">{quoteStory.name}</p>
                  <p className="text-xs text-gray-400">{quoteStory.year}</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Load more */}
        <div className="text-center mt-12">
          <button className="text-sm font-medium text-dark hover:text-primary transition-colors">
            Load More Stories
          </button>
        </div>
      </div>
    </section>
  );
}