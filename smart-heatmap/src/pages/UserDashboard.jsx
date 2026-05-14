import { useState } from 'react'
import DashboardLayout from '../components/layouts/DashboardLayout'
import MapShell from '../components/MapShell'

const UserDashboard = () => {

  const [activeTab, setActiveTab] = useState('dashboard')

  const [previewImage, setPreviewImage] = useState(null)

  const [complaints, setComplaints] = useState([
    {
      id: 1,
      type: 'Pothole',
      area: 'Nerul Sector 5',
      status: 'Pending',
      image:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 2,
      type: 'Garbage',
      area: 'Kharghar Sector 11',
      status: 'Resolved',
      image:
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=400&auto=format&fit=crop'
    }
  ])

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    complaintType: '',
    description: '',
    autoLocation: ''
  })

  const detectLocation = () => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        (position) => {

          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          setFormData((prev) => ({
            ...prev,
            autoLocation: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }))
        },
        () => {
          alert('Unable to fetch location')
        }
      )
    }
  }

  const handleImageChange = (e) => {

    const file = e.target.files[0]

    if (file) {
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {

    e.preventDefault()

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.complaintType ||
      !formData.description ||
      !formData.autoLocation ||
      !previewImage
    ) {
      alert('Please fill all required fields')
      return
    }

    const newComplaint = {
      id: complaints.length + 1,
      type: formData.complaintType,
      area: formData.autoLocation,
      status: 'Pending',
      image: previewImage
    }

    setComplaints([...complaints, newComplaint])

    alert('Complaint Submitted Successfully')

    setFormData({
      fullName: '',
      phone: '',
      complaintType: '',
      description: '',
      autoLocation: ''
    })

    setPreviewImage(null)
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
              Temp 25°C
            </button>

            <button className="top-btn">
              Nearby NGO
            </button>

            <button className="top-btn">
              Filter
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
              Juinagar, Sector 10
            </div>

            <div className="complaint-card green-card">
              Nerul, Sector 5
            </div>

            <div className="complaint-card yellow-card">
              Kharghar, Sector 11
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
                placeholder="Enter Phone Number"
                value={formData.phone}
                onChange={handleChange}
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

        <div className="table-container">

          <table className="complaint-table">

            <thead>

              <tr>

                <th>ID</th>
                <th>Complaint Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Preview</th>

              </tr>

            </thead>

            <tbody>

              {
                complaints.map((item) => (

                  <tr key={item.id}>

                    <td>
                      #{item.id}
                    </td>

                    <td>
                      {item.type}
                    </td>

                    <td className="location-cell">
                      {item.area}
                    </td>

                    <td>

                      <span
                        className={`status-badge ${
                          item.status === 'Resolved'
                            ? 'resolved-badge'
                            : 'pending-badge'
                        }`}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td>

                      <img
                        src={item.image}
                        alt="complaint"
                        className="table-image"
                      />

                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

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
    >

      {renderContent()}

    </DashboardLayout>
  )
}

export default UserDashboard