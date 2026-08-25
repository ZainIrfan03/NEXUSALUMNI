import { Quote } from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import { stories } from "../../data";

export default function SuccessStories() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-bold text-dark mb-3">Success Stories</h2>
        <p className="text-gray-500 mb-12">
          Hear how the network has propelled careers forward.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {stories.map((s) => (
            <div
              key={s.name}
              className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col"
            >
              <Quote
                size={22}
                className="text-primary/30 mb-4"
                fill="currentColor"
              />
              <p className="text-sm text-gray-600 leading-relaxed mb-8">
                "{s.quote}"
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <UserAvatar name={s.name} className="h-10 w-10" />
                <div>
                  <p className="text-sm font-semibold text-dark">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
