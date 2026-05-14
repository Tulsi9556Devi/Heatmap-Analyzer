import {
  FaClipboardList,
  FaMapMarkedAlt,
  FaFire,
  FaChartPie,
  FaSignOutAlt
} from 'react-icons/fa'

const Sidebar = ({ activeTab, setActiveTab }) => {

  return (

    <div className="sidebar">

      <div>

        <div className="profile-section">

          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="profile"
            className="profile-image"
          />

          <h2>Welcome Alex!</h2>

          <p>📍 Nerul, Navi Mumbai</p>

        </div>

        <div className="menu-container">

          <button
            className={`menu-btn ${
              activeTab === 'dashboard'
                ? 'active-btn'
                : ''
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartPie />
            Dashboard
          </button>

          <button
            className={`menu-btn ${
              activeTab === 'complaints'
                ? 'active-btn'
                : ''
            }`}
            onClick={() => setActiveTab('complaints')}
          >
            <FaClipboardList />
            Complaints
          </button>

          <button
            className={`menu-btn ${
              activeTab === 'track'
                ? 'active-btn'
                : ''
            }`}
            onClick={() => setActiveTab('track')}
          >
            <FaMapMarkedAlt />
            Track Complaint
          </button>

          <button
            className={`menu-btn ${
              activeTab === 'heatmap'
                ? 'active-btn'
                : ''
            }`}
            onClick={() => setActiveTab('heatmap')}
          >
            <FaFire />
            Heatmap
          </button>

        </div>

      </div>

      <button className="logout-btn">

        <FaSignOutAlt />
        Log Out

      </button>

    </div>
  )
}

export default Sidebar