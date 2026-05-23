import {
  FaClipboardList,
  FaMapMarkedAlt,
  FaFire,
  FaChartPie
} from 'react-icons/fa'

const Sidebar = ({
  activeTab,
  setActiveTab,
  userData
}) => {

  const displayName =
    userData?.full_name ||
    userData?.name ||
    userData?.dept_name ||
    'Citizen'

  const isDepartment =
    userData?.role === 'department' ||
    Boolean(userData?.dept_name)

  // =========================
  // PROFILE IMAGE BY ROLE
  // =========================

  let profileImage =
    'https://i.pravatar.cc/150?img=12'

if (userData?.role === 'admin') {

  profileImage =
    'https://i.pravatar.cc/150?img=68'
}

else if (isDepartment) {

  profileImage =
    'https://i.pravatar.cc/150?img=12'
}

else {

  profileImage =
    'https://i.pravatar.cc/150?img=32'
}

  return (

    <div className="sidebar">

      <div>

        <div className="profile-section">

          <img
            src={profileImage}
            alt="profile"
            className="profile-image"
          />

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

          {
            !isDepartment && (
              <>
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
              </>
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
