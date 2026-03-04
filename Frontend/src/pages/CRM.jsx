import { useState } from "react";
import "../styles/dashboard.css";

const dummyCustomers = [
  {
    id: 1,
    name: "Rohan Mehta",
    phone: "+91 9876543210",
    visits: 12,
    lastVisit: "2026-02-10",
    loyaltyPoints: 420,
    segment: "VIP",
  },
  {
    id: 2,
    name: "Ananya Sharma",
    phone: "+91 9988776655",
    visits: 5,
    lastVisit: "2026-02-08",
    loyaltyPoints: 150,
    segment: "Regular",
  },
  {
    id: 3,
    name: "Karthik Rao",
    phone: "+91 9123456780",
    visits: 1,
    lastVisit: "2026-02-11",
    loyaltyPoints: 20,
    segment: "New",
  },
];

function CRM() {
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");

  const filteredCustomers = dummyCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search);

    const matchesSegment =
      segmentFilter === "all" || customer.segment === segmentFilter;

    return matchesSearch && matchesSegment;
  });

  const totalCustomers = dummyCustomers.length;
  const vipCustomers = dummyCustomers.filter(
    (c) => c.segment === "VIP"
  ).length;
  const avgVisits = (
    dummyCustomers.reduce((sum, c) => sum + c.visits, 0) /
    dummyCustomers.length
  ).toFixed(1);

  return (
    <div className="dashboard-content">

      <h2 className="page-title">
        Customer Relationship Management
      </h2>

      {/* Filters */}
      <div className="filters-row">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Segments</option>
          <option value="VIP">VIP</option>
          <option value="Regular">Regular</option>
          <option value="New">New</option>
        </select>

        <button className="primary-btn">
          + Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h4>Total Customers</h4>
          <p className="metric-number">{totalCustomers}</p>
        </div>

        <div className="metric-card">
          <h4>VIP Customers</h4>
          <p className="metric-number">{vipCustomers}</p>
        </div>

        <div className="metric-card">
          <h4>Average Visits</h4>
          <p className="metric-number">{avgVisits}</p>
        </div>

        <div className="metric-card">
          <h4>Total Loyalty Points</h4>
          <p className="metric-number">
            {dummyCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="section-card">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Visits</th>
              <th>Last Visit</th>
              <th>Loyalty Points</th>
              <th>Segment</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.visits}</td>
                <td>{customer.lastVisit}</td>
                <td>{customer.loyaltyPoints}</td>
                <td>
                  <span className={`badge ${customer.segment.toLowerCase()}`}>
                    {customer.segment}
                  </span>
                </td>
              </tr>
            ))}

            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default CRM;
