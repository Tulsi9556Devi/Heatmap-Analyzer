import {
  FaClipboardList,
  FaMapMarkedAlt,
  FaFire,
  FaChartPie,
  FaUserCircle,
  FaBell,
  FaCheckCircle
} from 'react-icons/fa'

const Sidebar = ({
  activeTab,
  setActiveTab,
  userData
}) => {

  const displayName =
    userData?.full_name ||
    userData?.name ||
    userData?.department ||
    userData?.dept_name ||
    'Citizen'

  const isDepartment =
    userData?.role === 'department' ||
    Boolean(userData?.department) ||
    Boolean(userData?.dept_name)

  const isAdmin =
    userData?.role === 'admin'

  return (

    <div className="sidebar">

      <div>

        <div className="profile-section">

          <div className="profile-image profile-placeholder">
            <FaUserCircle />
          </div>

          <h2>
            Welcome {displayName}!
          </h2>

          <p>
            📍 {
              userData?.location ||
              'Navi Mumbai'
            }
          </p>

        </div>

        <div className="menu-container">

          <button
            className={`menu-btn ${
              activeTab === 'dashboard'
                ? 'active-btn'
                : ''
            }`}
            onClick={() =>
              setActiveTab('dashboard')
            }
          >
            <FaChartPie />
            Dashboard
          </button>

          {
            !isDepartment && (
              <button
                className={`menu-btn ${
                  activeTab === 'complaints'
                    ? 'active-btn'
                    : ''
                }`}
                onClick={() =>
                  setActiveTab('complaints')
                }
              >
                <FaClipboardList />
                Complaints
              </button>
            )
          }

          {
            isAdmin && (
              <button
                className={`menu-btn ${
                  activeTab === 'resolved'
                    ? 'active-btn'
                    : ''
                }`}
                onClick={() =>
                  setActiveTab('resolved')
                }
              >
                <FaCheckCircle />
                Resolved
              </button>
            )
          }

          {
            !isDepartment && !isAdmin && (
                <button
                  className={`menu-btn ${
                    activeTab === 'track'
                      ? 'active-btn'
                      : ''
                  }`}
                  onClick={() =>
                    setActiveTab('track')
                  }
                >
                  <FaMapMarkedAlt />
                  Track Complaint
                </button>
            )
          }

          {
            isDepartment || isAdmin
              ? (
                <button
                  className={`menu-btn ${
                    activeTab === 'heatmap'
                      ? 'active-btn'
                      : ''
                  }`}
                  onClick={() =>
                    setActiveTab('heatmap')
                  }
                >
                  <FaFire />
                  Heatmap
                </button>
              )
              : (
                <button
                  className={`menu-btn ${
                    activeTab === 'notifications'
                      ? 'active-btn'
                      : ''
                  }`}
                  onClick={() =>
                    setActiveTab('notifications')
                  }
                >
                  <FaBell />
                  Notifications
                </button>
              )
          }

        </div>

      </div>

      <button
        className="logout-btn"
        onClick={() => {

          localStorage.removeItem('user')

          window.location.href = '/'
        }}
      >
        Logout
      </button>

    </div>
  )
}

export default Sidebar
