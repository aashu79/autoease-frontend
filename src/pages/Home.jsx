function Home() {
  return (
    <section className="route-card">
      <span className="route-eyebrow">Home</span>
      <h1 className="route-title">A basic React Router setup</h1>
      <p className="route-copy">
        This starter now uses a dedicated routes component in{" "}
        <strong>src/routes</strong> so all route definitions live in one place.
      </p>
      <ul className="route-list">
        <li>
          Navigation is handled with <code>NavLink</code>.
        </li>
        <li>
          Route rendering is handled with <code>Routes</code> and{" "}
          <code>Route</code>.
        </li>
        <li>Unknown paths fall back to a simple 404 page.</li>
      </ul>
    </section>
  );
}

export default Home;
