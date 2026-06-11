import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layouts/DashboardLayout'
import MapShell from '../components/MapShell'
import HeatMapShell from '../components/HeatMapShell'
import { supabase } from '../services/supabase'

const AdminDashboard = () => {

  const userData = {
    ...JSON.parse(
      localStorage.getItem('user') || '{}'
    ),
    role: 'admin'
  }

  const [activeTab, setActiveTab] =
    useState('dashboard')

  const [complaints, setComplaints] =
    useState([])

  const [complaintSearch, setComplaintSearch] =
    useState('')

  const [temperature, setTemperature] =
    useState('--')

  const [weatherType, setWeatherType] =
    useState('Loading...')

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {

    fetchComplaints()

    const complaintsChannel =
      supabase
        .channel('admin-complaints-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'complaints'
          },
          () => {
            fetchComplaints()
          }
        )
        .subscribe()

    // =========================
    // WEATHER API
    // =========================

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          const latitude =
            position.coords.latitude

          const longitude =
            position.coords.longitude

          try {

            const weatherResponse =
              await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
              )

            const weatherData =
              await weatherResponse.json()

            setTemperature(
              weatherData.current_weather.temperature
            )

            const weatherCode =
              weatherData.current_weather.weathercode

            if (weatherCode === 0) {

              setWeatherType('Clear')
            }

            else if (
              weatherCode >= 1 &&
              weatherCode <= 3
            ) {

              setWeatherType('Cloudy')
            }

            else if (
              weatherCode >= 51 &&
              weatherCode <= 67
            ) {

              setWeatherType('Rain')
            }

            else {

              setWeatherType('Weather')
            }

          }

          catch (err) {

            console.log(err)
          }
        }
      )
    }

    return () => {
      supabase.removeChannel(complaintsChannel)
    }

  }, [])

  // =========================
  // FETCH COMPLAINTS
  // =========================

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

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (
    id,
    value
  ) => {

    let progressValue = 0

    if (value === 'Pending') {
      progressValue = 25
    }

    if (
      value === 'Reached to Department' ||
      value === 'In Progress'
    ) {
      progressValue = 65
    }

    if (value === 'Resolved') {
      progressValue = 100
    }

    setComplaints((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: value,
              progress: progressValue
            }
          : item
      )
    )

    const {
      data,
      error
    } =
      await supabase
        .from('complaints')
        .update({
          status: value,
          progress: progressValue
        })
        .eq('id', id)
        .select()

    if (error) {

      console.log('STATUS UPDATE ERROR:', error)
      alert(`Status update failed: ${error.message}`)
      fetchComplaints()
      return
    }

    if (!data || data.length === 0) {

      console.log(
        'STATUS UPDATE RETURNED NO ROWS',
        { id, value, progressValue }
      )
      alert(
        'Status update failed: Supabase did not update this complaint. Check update/RLS policy for complaints table.'
      )
      fetchComplaints()
      return
    }

    setComplaints((prev) =>
      prev.map((item) =>
        item.id === id
          ? data[0]
          : item
      )
    )
  }

  const approveComplaint = (id) => {
    updateStatus(id, 'Reached to Department')
  }

  const getDepartmentName = (type) => {

    const complaintType =
      String(type || '').toLowerCase()

    if (
      complaintType.includes('garbage') ||
      complaintType.includes('drainage')
    ) {
      return 'Cleaning'
    }

    if (
      complaintType.includes('pothole') ||
      complaintType.includes('road')
    ) {
      return 'Roads'
    }

    if (complaintType.includes('streetlight')) {
      return 'Electric'
    }

    return 'Civic'
  }

  const getProgressValue = (item) => {

    if (item.status === 'Resolved') {
      return 100
    }

    if (
      item.status === 'Reached to Department' ||
      item.status === 'In Progress'
    ) {
      return 65
    }

    if (
      !item.status ||
      item.status === 'Pending'
    ) {
      return 25
    }

    if (Number.isFinite(Number(item.progress))) {
      return Number(item.progress)
    }

    return 25
  }

  const getProgressText = (item) => {

    if (item.status === 'Resolved') {
      return 'Completed by department'
    }

    if (
      item.status === 'Reached to Department' ||
      item.status === 'In Progress'
    ) {
      return `Reached to ${getDepartmentName(item.complaint_type)}`
    }

    return 'Registered, waiting for admin approval'
  }

  const getStatusClass = (status) => {

    if (status === 'Resolved') {
      return 'resolved-badge'
    }

    if (
      status === 'Reached to Department' ||
      status === 'In Progress'
    ) {
      return 'progress-badge'
    }

    return 'pending-badge'
  }

  const getDisplayStatus = (status) => {

    if (
      status === 'In Progress' ||
      status === 'Reached to Department'
    ) {
      return 'Reached to Department'
    }

    return status || 'Pending'
  }

  const getLocationText = (item) => {

    const latitude =
      Number(item.latitude)

    const longitude =
      Number(item.longitude)

    const coordinates =
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
        ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        : ''

    return (
      item.location_name ||
      item.area_name ||
      item.area ||
      item.location ||
      coordinates ||
      'Location not available'
    )
  }

  // =========================
  // COUNTS
  // =========================

  const totalComplaints =
    complaints.length

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
      item =>
        item.status === 'Reached to Department' ||
        item.status === 'In Progress'
    ).length

  const complaintsWithLocation =
    complaints.filter(
      item =>
        Number.isFinite(Number(item.latitude)) &&
        Number.isFinite(Number(item.longitude))
    ).length

  const mostCommonIssue =
    complaints.length
      ? Object.entries(
          complaints.reduce((acc, item) => {

            const issue =
              item.complaint_type || 'Unknown'

            acc[issue] =
              (acc[issue] || 0) + 1

            return acc

          }, {})
        ).sort((a, b) => b[1] - a[1])[0][0]
      : 'No complaints'

  const resolutionRate =
    complaints.length
      ? Math.round(
          (
            resolvedCount /
            complaints.length
          ) * 100
        )
      : 0

  const activeComplaintList =
    complaints.filter(
      item => item.status !== 'Resolved'
    )

  const complaintSearchText =
    complaintSearch.trim().toLowerCase()

  const matchesComplaintSearch = (item) => {

    if (!complaintSearchText) {
      return true
    }

    return [
      item.id,
      item.full_name,
      item.phone,
      item.complaint_type,
      item.description,
      item.status,
      getDepartmentName(item.complaint_type),
      getLocationText(item)
    ]
      .map(value => String(value || '').toLowerCase())
      .some(value => value.includes(complaintSearchText))
  }

  const visibleActiveComplaintList =
    activeComplaintList.filter(matchesComplaintSearch)

  const resolvedComplaintList =
    complaints.filter(
      item => item.status === 'Resolved'
    )

  // =========================
  // DASHBOARD
  // =========================

  const renderDashboard = () => {

    return (

      <>

        {/* HEADER */}

        <div className="admin-dashboard-top">

          <div>

            <h1 className="page-title">
              Admin Dashboard
            </h1>

            <p className="admin-subtitle">
              Smart Public Complaint Monitoring System
            </p>

          </div>

          <div className="top-buttons">

            <button className="top-btn">

              🌤️ {temperature}°C • {weatherType}

            </button>

            <button className="top-btn">

              Smart Monitoring

            </button>

          </div>

        </div>

        {/* MAP */}

        <div className="admin-map-wrapper">

          <MapShell />

        </div>

        {/* STATS */}

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
              At Department
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

      </>
    )
  }

  // =========================
  // MANAGE COMPLAINTS
  // =========================

  const renderManageComplaints = () => {

    return (

      <div className="tab-page">

        <div className="track-header">

          <h1 className="page-title">
            Manage Complaints
          </h1>

          <div className="track-count">
            Total : {visibleActiveComplaintList.length}
          </div>

        </div>

        <div className="complaint-search-bar">

          <input
            type="text"
            value={complaintSearch}
            onChange={(event) =>
              setComplaintSearch(event.target.value)
            }
            placeholder="Search by name, type, status, department, location..."
            className="search-input complaint-search-input"
          />

        </div>

        <div className="complaint-progress-list">

          {
            visibleActiveComplaintList.map((item) => (

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
                    ${getStatusClass(item.status)}`}
                  >

                    {getDisplayStatus(item.status)}

                  </span>

                </div>

                <div className="progress-location">

                  📍

                  {getLocationText(item)}

                </div>

                <div className="department-line">
                  Department : {getDepartmentName(item.complaint_type)}
                </div>

                <div className="progress-bar-wrapper">

                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${getProgressValue(item)}%`
                    }}
                  ></div>

                </div>

                <div className="progress-bottom">

                  <span>

                    Progress : {getProgressValue(item)}% - {getProgressText(item)}

                  </span>

                  {
                    item.status === 'Resolved'
                    ? (
                      <button
                        type="button"
                        className="workflow-action-btn completed-action"
                        disabled
                      >
                        Completed
                      </button>
                    )
                    : (
                      item.status === 'Reached to Department' ||
                      item.status === 'In Progress'
                    )
                    ? (
                      <button
                        type="button"
                        className="workflow-action-btn forwarded-action"
                        disabled
                      >
                        Forwarded
                      </button>
                    )
                    : (
                      <button
                        type="button"
                        className="workflow-action-btn"
                        onClick={() =>
                          approveComplaint(item.id)
                        }
                      >
                        Approve
                      </button>
                    )
                  }

                </div>

              </div>

            ))
          }

        </div>

      </div>
    )
  }

  const renderResolvedComplaints = () => {

    return (

      <div className="tab-page">

        <div className="track-header">

          <h1 className="page-title">
            Resolved Complaints
          </h1>

          <div className="track-count">
            Total : {resolvedComplaintList.length}
          </div>

        </div>

        <div className="complaint-progress-list">

          {
            resolvedComplaintList.length
            ? resolvedComplaintList.map((item) => (

              <div
                key={item.id}
                className="progress-card-box"
              >

                <div className="progress-top">

                  <div>
                    <h2>{item.complaint_type}</h2>
                    <p>{item.full_name}</p>
                  </div>

                  <span className="status-badge resolved-badge">
                    Completed
                  </span>

                </div>

                <div className="progress-location">
                  Location : {getLocationText(item)}
                </div>

                <div className="department-line">
                  Department : {getDepartmentName(item.complaint_type)}
                </div>

                {
                  item.completion_image_url && (
                    <img
                      src={item.completion_image_url}
                      alt="completion proof"
                      className="table-image proof-image"
                    />
                  )
                }

                <div className="progress-bottom">

                  <span>
                    {
                      item.notification_sent
                      ? 'User has been notified'
                      : 'Notification handled by department'
                    }
                  </span>

                </div>

              </div>
            ))
            : (
              <div className="empty-workflow-state">
                No resolved complaints yet.
              </div>
            )
          }

        </div>

      </div>
    )
  }

  // =========================
  // HEATMAP
  // =========================

  const renderAnalytics = () => {

    return (

      <div className="tab-page">

        <h1 className="page-title">
          Heatmap Analytics
        </h1>

        <div className="admin-map-wrapper">

          <HeatMapShell complaints={complaints} />

        </div>

        <div className="analytics-grid">

          <div className="analytics-card">

            <h2>
              Mapped Complaints
            </h2>

            <p>
              {complaintsWithLocation}
            </p>

          </div>

          <div className="analytics-card">

            <h2>
              Most Common Issue
            </h2>

            <p>
              {mostCommonIssue}
            </p>

          </div>

          <div className="analytics-card">

            <h2>
              Resolution Rate
            </h2>

            <p>

              {
                resolutionRate
              }%

            </p>

          </div>

        </div>

      </div>
    )
  }

  // =========================
  // CONTENT SWITCH
  // =========================

  const renderContent = () => {

    if (activeTab === 'complaints') {
      return renderManageComplaints()
    }

    if (activeTab === 'resolved') {
      return renderResolvedComplaints()
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
      userData={userData}
    >

      {renderContent()}

    </DashboardLayout>
  )
}

export default AdminDashboard
