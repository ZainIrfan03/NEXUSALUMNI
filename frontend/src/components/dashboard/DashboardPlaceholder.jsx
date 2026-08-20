export default function DashboardPlaceholder({ title, description }) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-dark">{title}</h1>
      <p className="mt-2 text-gray-500">{description}</p>
    </section>
  );
}
