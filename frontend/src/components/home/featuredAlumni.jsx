import React from "react";
import { ArrowRight } from "lucide-react";

const alumni = [
  {
    name: "Sarah Jenkins",
    role: "VP of Engineering",
    company: "TechGlobal Inc.",
    img: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "David Chen",
    role: "Founder & CEO",
    company: "Nexus Innovations",
    img: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Elena Rodriguez",
    role: "Design Director",
    company: "Creative Studio",
    img: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Michael Chang",
    role: "Chief Financial Officer",
    company: "Global Finance Corp",
    img: "https://i.pravatar.cc/150?img=13",
  },
];

export default function FeaturedAlumni() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-3">Featured Alumni</h2>
            <p className="text-gray-500">Meet leaders shaping the future across industries.</p>
          </div>
          <a
            href="#"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            View All Alumni <ArrowRight size={15} />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {alumni.map((a) => (
            <div
              key={a.name}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center"
            >
              <img
                src={a.img}
                alt={a.name}
                className="h-20 w-20 rounded-full object-cover mb-4"
              />
              <h3 className="font-semibold text-dark">{a.name}</h3>
              <p className="text-sm text-primary font-medium mt-1">{a.role}</p>
              <p className="text-xs text-gray-500 mt-0.5 mb-5">{a.company}</p>
              <button className="w-full border border-gray-200 text-dark text-sm font-medium py-2 rounded-full hover:border-primary hover:text-primary transition-colors">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}