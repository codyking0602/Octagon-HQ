export function RouteLoading() {
  return (
    <section className="route-loading" aria-label="Loading section" aria-busy="true">
      <div className="route-loading__line route-loading__line--short" />
      <div className="route-loading__card" />
      <div className="route-loading__card" />
    </section>
  );
}
