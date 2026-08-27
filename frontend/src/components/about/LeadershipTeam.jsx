import { LEADERSHIP_TEAM } from "../../consts/publicContent";

export default function LeadershipTeam() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-bold text-dark mb-2">Leadership Team</h2>
        <p className="text-gray-500 mb-8">
          The dedicated professionals driving our mission forward.
        </p>
        <div className="border-t border-gray-100 mb-12" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {LEADERSHIP_TEAM.map((member) => (
            <div key={member.name}>
              <img
                src={member.img}
                alt={member.name}
                className="w-full aspect-square object-cover rounded-2xl mb-4"
              />
              <h3 className="font-semibold text-dark">{member.name}</h3>
              <p className="text-sm text-primary font-medium mt-1 mb-2">
                {member.role}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {member.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
