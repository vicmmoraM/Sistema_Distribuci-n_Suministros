export default function Topbar({
  user,
  fecha,
  showLogout,
  onLogout,
  onMenuClick,
}) {
  return (
    <header className="main-navbar">
      <button onClick={onMenuClick} className="hamburger-btn" aria-label="Menú">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="navbar-brand">
        <div className="navbar-logo">
          <img src="/images/LOGO FC SINTETIZADO FONDO BLANCO.jpg" alt="FarmCorp Logo" />
        </div>
        <div className="navbar-title">
          <h1>Sistema Integral de Adquisiciones FC</h1>
          <p>Sistema de Distribución de Suministros</p>
        </div>
      </div>

      <div style={{ flex: 1 }}></div>

      <div className="navbar-actions">
        <div className="navbar-user">
          <p className="user-name">Bienvenido, {user?.nombre}</p>
          <p className="user-date">{fecha}</p>
        </div>

        {showLogout && (
          <button onClick={onLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        )}
      </div>
    </header>
  );
}
