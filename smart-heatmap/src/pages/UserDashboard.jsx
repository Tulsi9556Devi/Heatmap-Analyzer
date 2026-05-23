import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layouts/DashboardLayout'
import MapShell from '../components/MapShell'
import { supabase } from '../services/supabase'

const UserDashboard = () => {
  
  const [userData, setUserData] =
  useState(null)

  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('dashboard')

  const [previewImage, setPreviewImage] =
    useState(null)

  const [complaints, setComplaints] =
    useState([])

  const [userName, setUserName] =
    useState('Citizen')

  const [userLocation, setUserLocation] =
    useState('Fetching location...')
const [temperature, setTemperature] =
  useState('--')

const [weatherType, setWeatherType] =
  useState('Loading...')

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    complaintType: '',
    description: '',
    autoLocation: '',
    latitude: null,
    longitude: null,
    date: new Date().toLocaleDateString()
  })

useEffect(() => {

  fetchComplaints()

  const storedUser =
    JSON.parse(
      localStorage.getItem('user')
    )

  if (storedUser) {

    setUserData(storedUser)

    setFormData((prev) => ({
      ...prev,
      fullName:
        storedUser.full_name || ''
    }))
  }

  const complaintsChannel =
    supabase
      .channel('user-complaints-realtime')
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
  // FETCH USER LOCATION
  // =========================

  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const latitude =
          position.coords.latitude

        const longitude =
          position.coords.longitude

        try {

          // =========================
          // LOCATION API
          // =========================

          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )

          const data =
            await response.json()

          const area =
            data.address.suburb ||
            data.address.city ||
            data.address.town ||
            data.address.village ||
            'Navi Mumbai'

          setUserLocation(area)

          setUserData((prev) => ({
            ...prev,
            location: area
          }))

          // =========================
          // WEATHER API
          // =========================

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

  const fetchUserLocation = () => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          const latitude =
            position.coords.latitude

          const longitude =
            position.coords.longitude

          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
            autoLocation:
              `${latitude.toFixed(4)},
               ${longitude.toFixed(4)}`
          }))

          try {

            const response =
              await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              )

            const data =
              await response.json()

            const area =
              data.address.suburb ||
              data.address.city ||
              data.address.town ||
              data.address.village ||
              'Unknown Area'

            setUserLocation(area)

          } catch {

            setUserLocation(
              'Location unavailable'
            )
          }
        },

        () => {

          setUserLocation(
            'Location unavailable'
          )
        }
      )
    }
  }

  const detectLocation = () => {

    fetchUserLocation()
  }

  const handleLogout = () => {

   localStorage.removeItem('user')

    navigate('/')
  }

  const handleImageChange = (e) => {

    const file = e.target.files[0]

    if (file) {

      setPreviewImage(
        URL.createObjectURL(file)
      )
    }
  }

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {

  e.preventDefault()

  if (
    !formData.fullName ||
    !formData.phone ||
    !formData.complaintType ||
    !formData.description ||
    !formData.latitude ||
    !previewImage
  ) {

    alert('Please fill all required fields')
    return
  }

  try {

    const fileInput =
      document.querySelector(
        'input[type="file"]'
      )

    const file =
      fileInput.files[0]

    const fileName =
      `${Date.now()}-${file.name}`

    // =========================
    // IMAGE UPLOAD
    // =========================

    const { error: uploadError } =
      await supabase.storage
        .from('complaint-images')
        .upload(fileName, file)

    if (uploadError) {

      console.log(uploadError)

      alert('Image upload failed')
      return
    }

    // =========================
    // GET PUBLIC URL
    // =========================

    const {
      data: imageData
    } = supabase.storage
      .from('complaint-images')
      .getPublicUrl(fileName)

    const imageUrl =
      imageData.publicUrl

    // =========================
    // DATABASE INSERT
    // =========================

    const { error } =
      await supabase
        .from('complaints')
        .insert([
          {
            full_name:
              formData.fullName,

            phone:
              formData.phone,

            complaint_type:
              formData.complaintType,

            description:
              formData.description,

            latitude:
              formData.latitude,

            longitude:
              formData.longitude,

            image_url:
              imageUrl,

            status:
              'Pending',

            progress: 25
          }
        ])

    if (error) {

      console.log(
        'SUPABASE ERROR:',
        error
      )

      alert('Database insert failed')
      return
    }

    alert(
      'Complaint Submitted Successfully'
    )

    // =========================
    // REFRESH COMPLAINTS
    // =========================

    fetchComplaints()

    // =========================
    // RESET FORM
    // =========================

    setFormData({
      fullName:
        userData?.full_name || '',
      phone: '',
      complaintType: '',
      description: '',
      autoLocation: '',
      latitude: null,
      longitude: null,
      date:
        new Date().toLocaleDateString()
    })

    setPreviewImage(null)

  }

  catch (err) {

    console.log(err)

    alert('Something went wrong')
  }
}

  const renderDashboard = () => {

    return (
      <>

        <div className="topbar">

          <div className="search-section">

            <input
              type="text"
              placeholder="Search"
              className="search-input"
            />

          </div>

          <div className="top-buttons">

  <button className="top-btn">

    🌤️ {temperature}°C • {weatherType}

  </button>

  <button className="top-btn">

    Smart Alerts

  </button>

</div>

        </div>


        <div className="map-section">
          <MapShell />
        </div>

        <div className="bottom-panel">

          <div className="status-section">

            <div className="status-item">
              <div className="status-dot red"></div>
              Pending
            </div>

            <div className="status-item">
              <div className="status-dot green"></div>
              Completed
            </div>

            <div className="status-item">
              <div className="status-dot yellow"></div>
              In Progress
            </div>

          </div>

          <div className="complaint-cards">

            <div className="complaint-card red-card">
              Live Complaint Tracking
            </div>

            <div className="complaint-card green-card">
              Smart City Monitoring
            </div>

            <div className="complaint-card yellow-card">
              Real Time Updates
            </div>

          </div>

        </div>

      </>
    )
  }

  const renderComplaints = () => {

    return (

      <div className="tab-page">

        <div className="complaint-header">

          <h1 className="page-title">
            Register Complaint
          </h1>

          <p className="complaint-subtitle">
            Report civic issues in your area quickly.
          </p>

        </div>

        <div className="complaint-form-wrapper">

          <form
            className="complaint-form modern-form"
            onSubmit={handleSubmit}
          >

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Full Name *
                </label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Phone Number *
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10 Digit Phone Number"
                  value={formData.phone}
                  onChange={(e) => {

                    const value =
                      e.target.value.replace(/\D/g, '')

                    if (value.length <= 10) {

                      setFormData({
                        ...formData,
                        phone: value
                      })
                    }
                  }}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Complaint Type *
                </label>

                <select
                  name="complaintType"
                  value={formData.complaintType}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Complaint
                  </option>

                  <option>Pothole</option>
                  <option>Garbage</option>
                  <option>Drainage</option>
                  <option>Streetlight</option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Date
                </label>

                <input
                  type="text"
                  value={formData.date}
                  readOnly
                  className="location-input"
                />

              </div>

              <div className="form-group">

                <label>
                  Location *
                </label>

                <div className="location-row">

                  <input
                    type="text"
                    value={formData.autoLocation}
                    readOnly
                    placeholder="Auto detected location"
                    className="location-input"
                    required
                  />

                  <button
                    type="button"
                    className="location-btn"
                    onClick={detectLocation}
                  >
                    Detect
                  </button>

                </div>

              </div>

            </div>

            <div className="bottom-form-grid">

              <div className="form-group description-group">

                <label>
                  Description *
                </label>

                <textarea
                  name="description"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>

              </div>

              <div className="upload-section">

                <label>
                  Upload Evidence *
                </label>

                <div className="upload-box">

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />

                  {
                    previewImage ? (

                      <img
                        src={previewImage}
                        alt="preview"
                        className="preview-image"
                      />

                    ) : (

                      <div className="empty-preview">
                        Image Preview
                      </div>

                    )
                  }

                </div>

              </div>

            </div>

            <button
              type="submit"
              className="submit-btn large-submit-btn"
            >
              Submit Complaint
            </button>

          </form>

        </div>

      </div>
    )
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

  const renderTrackComplaints = () => {

    return (

      <div className="tab-page">

        <div className="track-header">

          <h1 className="page-title">
            Track Complaints
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
                      Complaint #{item.id}
                    </p>

                  </div>

                  <span
                    className={`status-badge ${getStatusClass(item.status)}`}
                  >
                    {getDisplayStatus(item.status)}
                  </span>

                </div>

                <div className="user-progress-card-body">

                  <div>

                    <div className="progress-location">
                      Location :
                      {' '}
                      {item.latitude?.toFixed(4)},
                      {' '}
                      {item.longitude?.toFixed(4)}
                    </div>

                    <div className="department-line">
                      Department : {getDepartmentName(item.complaint_type)}
                    </div>

                  </div>

                  <img
                    src={item.image_url}
                    alt="complaint"
                    className="table-image"
                  />

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

                </div>

              </div>

            ))
          }

        </div>

      </div>
    )
  }

  const renderHeatmap = () => {

    return (

      <div className="tab-page">

        <h1 className="page-title">
          Heatmap Analytics
        </h1>

        <div className="heatmap-coming">

          <h2>
            Heatmap Visualization Coming Soon
          </h2>

          <p>
            Complaint density and analytics
            will be shown here.
          </p>

        </div>

      </div>
    )
  }

  const renderContent = () => {

    if (activeTab === 'complaints') {
      return renderComplaints()
    }

    if (activeTab === 'track') {
      return renderTrackComplaints()
    }

    if (activeTab === 'heatmap') {
      return renderHeatmap()
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

export default UserDashboard
