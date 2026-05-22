import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layouts/DashboardLayout'
import MapShell from '../components/MapShell'
import HeatMapShell from '../components/HeatMapShell'
import { supabase } from '../services/supabase'

const AdminDashboard = () => {

  const [activeTab, setActiveTab] = useState('dashboard')

const [complaints, setComplaints] =
  useState([])
  useEffect(() => {

  fetchComplaints()

}, [])

const fetchComplaints = async () => {

  const { data, error } =
    await supabase
      .from('complaints')
      .select('*')
      .order('id', { ascending: false })

  if (error) {

    console.log(error)
    return
  }

  setComplaints(data)
}
const updateStatus = async (id, value) => {

  let progressValue = 0

  if (value === 'Pending') {
    progressValue = 25
  }

  if (value === 'In Progress') {
    progressValue = 65
  }

  if (value === 'Resolved') {
    progressValue = 100
  }

  const { error } =
    await supabase
      .from('complaints')
      .update({
        status: value,
        progress: progressValue
      })
      .eq('id', id)

  if (error) {

    console.log(error)
    return
  }

  fetchComplaints()
}

  const totalComplaints = complaints.length

  const pendingCount =
    complaints.filter(
      item => item.status === 'Pending'
    ).length

  const resolvedCount =
    complaints.filter(
      item => item.status === 'Resolved'
    ).length

  const progressCount =
    complaints.filter(
      item => item.status === 'In Progress'
    ).length

  const renderDashboard = () => {

    return (

      <div className="tab-page">

        <div className="admin-header">

          <div>

            <h1 className="page-title">
              Admin Dashboard
            </h1>

            <p className="admin-subtitle">
              Smart Public Complaint Monitoring System
            </p>

          </div>

        </div>

        <div className="admin-stats-grid">

          <div className="admin-stat-card">

            <h2>
              {totalComplaints}
            </h2>

            <p>
              Total Complaints
            </p>

          </div>

          <div className="admin-stat-card pending-card">

            <h2>
              {pendingCount}
            </h2>

            <p>
              Pending
            </p>

          </div>

          <div className="admin-stat-card progress-card">

            <h2>
              {progressCount}
            </h2>

            <p>
              In Progress
            </p>

          </div>

          <div className="admin-stat-card resolved-card">

            <h2>
              {resolvedCount}
            </h2>

            <p>
              Resolved
            </p>

          </div>

        </div>

        <div className="admin-map-wrapper">

          <MapShell />

        </div>

      </div>
    )
  }

  const renderManageComplaints = () => {

  return (

    <div className="tab-page">

      <div className="track-header">

        <h1 className="page-title">
          Manage Complaints
        </h1>

        <div className="track-count">
          Total : {complaints.length}
        </div>

      </div>

      <div className="complaint-progress-list">

        {
          complaints.map((item) => (

            <div
              key={item.id}
              className="progress-card-box"
            >

              <div className="progress-top">

                <div>

                  <h2>
                    {item.complaint_type}
                  </h2>

                  <p>
                    {item.full_name}
                  </p>

                </div>

                <span
                  className={`status-badge
                  ${
                    item.status === 'Resolved'
                    ? 'resolved-badge'
                    : item.status === 'In Progress'
                    ? 'progress-badge'
                    : 'pending-badge'
                  }`}
                >

                  {item.status || 'Pending'}

                </span>

              </div>

              <div className="progress-location">

                📍
                {
                  item.latitude &&
                  item.longitude
                  ? `${item.latitude.toFixed(4)},
                     ${item.longitude.toFixed(4)}`
                  : 'N/A'
                }

              </div>

              <div className="progress-bar-wrapper">

                <div
                  className="progress-bar-fill"
                  style={{
                   width:
                item.status === 'Resolved'
                 ? '100%'
                   : item.status === 'In Progress'
                  ? '60%'
                     : '25%'
                  }}
                ></div>

              </div>

              <div className="progress-bottom">

                <span>
                 Progress :
                      {
                    item.status === 'Resolved'
                    ? '100'
                    : item.status === 'In Progress'
                    ? '60'
                    : '25'
                }%
                </span>

                <select
                  className="admin-action-select"
                  value={item.status || 'Pending'}
                  onChange={(e) =>
                    updateStatus(
                      item.id,
                      e.target.value
                    )
                  }
                >

                  <option>
                    Pending
                  </option>

                  <option>
                    In Progress
                  </option>

                  <option>
                    Resolved
                  </option>

                </select>

              </div>

            </div>

          ))
        }

      </div>

    </div>
  )
}
const renderAnalytics = () => {

  return (

    <div className="tab-page">

      <h1 className="page-title">
        Heatmap Analytics
      </h1>

      <div className="admin-map-wrapper">

        <HeatMapShell />

      </div>

      <div className="analytics-grid">

        <div className="analytics-card">

          <h2>
            Total Complaints
          </h2>

          <p>
            {complaints.length}
          </p>

        </div>

        <div className="analytics-card">

          <h2>
            Most Common Issue
          </h2>

          <p>
            Potholes
          </p>

        </div>

        <div className="analytics-card">

          <h2>
            Resolution Rate
          </h2>

          <p>
            {
              complaints.length
              ? Math.floor(
                  (resolvedCount / complaints.length) * 100
                )
              : 0
            }%
          </p>

        </div>

      </div>

    </div>
  )
}
  const renderContent = () => {

    if (activeTab === 'complaints') {
      return renderManageComplaints()
    }

    if (activeTab === 'heatmap') {
      return renderAnalytics()
    }

    return renderDashboard()
  }

  return (

    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >

      {renderContent()}

    </DashboardLayout>
  )
}

export default AdminDashboard