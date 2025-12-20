export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">CH</div>
        <span className="brand">Campus Aura</span>
      </div>

      <ul className="nav-links">
        <li>Events</li>
        <li>Marketplace</li>
        <li>Community</li>
      </ul>

      <div className="nav-actions">
        <button className="btn-primary">Sign In</button>
        <button className="btn-primary">Join Campus</button>
      </div>
    </nav>
  );
}
