import { ArrowRight } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.15] text-dark">
            Bridging the gap between{" "}
            <span className="text-primary">students</span> and{" "}
            <span className="text-primary">success</span>.
          </h1>

          <p className="text-gray-500 text-base mt-6 max-w-lg leading-relaxed">
            Alumni Nexus empowers the next generation of leaders by facilitating
            meaningful connections, mentorship, and opportunities within a
            global network of accomplished graduates.
          </p>

          <button className="mt-9 inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
            Get Involved <ArrowRight size={16} />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&q=80"
            alt="Alumni Nexus team collaborating"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
