import { Quote } from "lucide-react";
import UserAvatar from "../common/UserAvatar";

const stories = [
  {
    quote:
      "The mentorship program connected me with a senior VP in my target industry. Her guidance was instrumental in helping me navigate my career transition and land my current leadership role.",
    name: "Jessica Lee",
    role: "Product Manager at InnovateTech",
  },
  {
    quote:
      "Through a local alumni chapter event, I met my future co-founder. The network provided not only the connections but also the initial funding leads that got our startup off the ground.",
    name: "Marcus Johnson",
    role: "Co-Founder of GreenEnergy Solutions",
  },
];

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
              <Quote size={22} className="text-primary/30 mb-4" fill="currentColor" />
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
