import { features } from "../../data";

export default function Features() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-bold text-dark mb-3">
          Everything you need to thrive
        </h2>
        <p className="text-gray-500 mb-12">
          A comprehensive ecosystem designed for your continuous professional
          development.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-gray-100 rounded-2xl p-8"
            >
              <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center mb-5">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-dark mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
