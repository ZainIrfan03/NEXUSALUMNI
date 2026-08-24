const team = [
  {
    name: "Dr. Sarah Jenkins",
    role: "Executive Director",
    desc: "Leading strategic initiatives and fostering global partnerships.",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
  },
  {
    name: "Marcus Chen",
    role: "Head of Product",
    desc: "Overseeing platform development and user experience.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Elena Rodriguez",
    role: "Director of Community",
    desc: "Curating events and managing mentorship programs.",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
  },
  {
    name: "David Thompson",
    role: "VP of Alumni Relations",
    desc: "Maintaining relationships with our most distinguished graduates.",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  },
];

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
          {team.map((member) => (
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
