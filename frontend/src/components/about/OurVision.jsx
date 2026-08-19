import { HeartHandshake, GraduationCap } from "lucide-react";

export default function OurVision() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-dark mb-4">Our Vision</h2>
          <p className="text-gray-500 leading-relaxed">
            We believe in a world where every student has access to the
            guidance and network needed to reach their full potential.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl p-8 flex flex-col">
            <div className="h-11 w-11 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <HeartHandshake size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">
              Meaningful Mentorship
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connecting ambitious students with seasoned professionals for
              1-on-1 guidance that shapes careers.
            </p>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden flex flex-col">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=80"
              alt="Global opportunity network"
              className="w-full h-56 object-cover"
            />
            <div className="p-8">
              <h3 className="text-lg font-semibold text-dark mb-2">
                Global Opportunity Network
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Access a curated platform of exclusive job postings,
                internships, and collaborative projects shared directly by
                alumni in leading industries worldwide.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden flex flex-col">
            <img
              src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000&q=80"
              alt="Community driven events"
              className="w-full h-56 object-cover"
            />
            <div className="p-8">
              <h3 className="text-lg font-semibold text-dark mb-2">
                Community Driven Events
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                From intimate fireside chats to large-scale industry mixers,
                we facilitate events that foster lifelong connections and
                continuous learning.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1 bg-primary rounded-2xl p-8 flex flex-col text-white">
            <div className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center mb-6">
              <GraduationCap size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Lifelong Learning</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Education doesn't stop at graduation. Gain access to exclusive
              workshops and resources.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
