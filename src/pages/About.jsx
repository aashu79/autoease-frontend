function About() {
  return (
    <section className="route-card">
      <span className="route-eyebrow">About</span>
      <h1 className="route-title">Keep routing centralized</h1>
      <p className="route-copy">
        This structure makes it easier to add nested routes, protected routes,
        or shared layout content later without spreading route declarations
        across the app.
      </p>
    </section>
  );
}

export default About;
