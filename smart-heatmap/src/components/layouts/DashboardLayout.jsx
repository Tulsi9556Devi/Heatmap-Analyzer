import Sidebar from '../map/Sidebar'

const DashboardLayout = ({
  children,
  activeTab,
  setActiveTab
}) => {

  return (

    <div className="dashboard-layout">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="dashboard-main">
        {children}
      </div>

    </div>
  )
}

export default DashboardLayout