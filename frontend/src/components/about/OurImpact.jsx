import { IMPACT_STATS } from "../../consts/publicContent";

export default function OurImpact() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-dark mb-14">Our Impact</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          {IMPACT_STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                {s.value}
              </p>
              <p className="text-xs font-medium tracking-wider text-gray-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
