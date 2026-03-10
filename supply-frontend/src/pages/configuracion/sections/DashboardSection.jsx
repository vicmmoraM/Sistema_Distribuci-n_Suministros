export default function DashboardSection({ overview }) {
  return (
    <div className="admin-dashboard-grid">
      <article className="admin-stat-card">
        <h3>Usuarios Totales</h3>
        <p>{overview?.totalUsers || 0}</p>
      </article>
      <article className="admin-stat-card">
        <h3>Usuarios Activos</h3>
        <p>{overview?.activeUsers || 0}</p>
      </article>
      <article className="admin-stat-card">
        <h3>Suministros</h3>
        <p>{overview?.totalSupplies || 0}</p>
      </article>
      <article className="admin-stat-card warning">
        <h3>Stock Bajo</h3>
        <p>{overview?.lowStockSupplies || 0}</p>
      </article>
    </div>
  );
}
