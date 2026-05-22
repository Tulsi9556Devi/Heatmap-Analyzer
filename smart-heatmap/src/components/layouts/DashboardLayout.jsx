import Sidebar from '../map/Sidebar'

const DashboardLayout = ({
  children,
  activeTab,
  setActiveTab,
  userData
}) => {

  return (

    <div className="dashboard-layout">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userData={userData}
      />

      <div className="dashboard-main">
        {children}
      </div>

    </div>
  )
}

export default DashboardLayout