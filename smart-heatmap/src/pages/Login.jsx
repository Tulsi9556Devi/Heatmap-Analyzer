import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {

    e.preventDefault()

    // ADMIN LOGIN

    if (
      email === 'admin@gmail.com' &&
      password === 'admin123'
    ) {

      navigate('/admin-dashboard')
      return
    }

    // USER LOGIN

    if (
      email === 'user@gmail.com' &&
      password === '123456'
    ) {

      navigate('/user-dashboard')
      return
    }

    alert('Invalid Credentials')
  }

  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-left">

          <div>

            <h1>
              Smart Public Complaint Heatmap Analyzer
            </h1>

            <p>
              Navi Mumbai Civic Intelligence Platform
            </p>

          </div>

          <div className="demo-credentials">

            <h3>
              Demo Credentials
            </h3>

            <div className="credential-box">

              <h4>
                Admin
              </h4>

              <p>
                admin@gmail.com
              </p>

              <p>
                admin123
              </p>

            </div>

            <div className="credential-box">

              <h4>
                Citizen User
              </h4>

              <p>
                user@gmail.com
              </p>

              <p>
                123456
              </p>

            </div>

          </div>

        </div>

        <div className="login-right">

          <h2>
            Login
          </h2>

          <form onSubmit={handleLogin}>

            <div className="login-group">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            <div className="login-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            <button
              type="submit"
              className="login-btn"
            >
              Login
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

export default Login