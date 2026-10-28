type PlaceholderPageProps = {
  title: string;
  eyebrow: string;
};

export default function PlaceholderPage({ title, eyebrow }: PlaceholderPageProps) {
  return (
    <div className="page">
      <section className="page-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>This destination has its own route and loading boundary. Its feature migration comes next.</p>
      </section>

      <section className="surface-card placeholder-card">
        <span className="placeholder-card__mark" aria-hidden="true">OHQ</span>
        <h2>{title} is ready for migration</h2>
        <p>No legacy scripts, fallback owners, or hidden startup dependencies have been copied into V2.</p>
      </section>
    </div>
  );
}
