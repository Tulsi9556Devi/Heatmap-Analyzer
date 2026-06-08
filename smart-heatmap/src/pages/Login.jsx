import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../services/supabase'
import bcrypt from 'bcryptjs'

const Login = () => {

  const navigate = useNavigate()

  const [isSignup, setIsSignup] =
    useState(false)

  const [fullName, setFullName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {

    const cleanEmail =
      email.trim().toLowerCase()

    const cleanPassword =
      password.trim()

    try {

      // =========================
      // ADMIN LOGIN
      // =========================

      const {
        data: adminData
      } = await supabase
        .from('admin')
        .select('*')
        .eq('email', cleanEmail)

      if (
        adminData &&
        adminData.length > 0
      ) {

        const admin = adminData[0]

        const adminValid =
       await bcrypt.compare(
       cleanPassword,
       admin.password
        )

      if (adminValid) {

      localStorage.setItem(
     'user',
      JSON.stringify(admin)
     )

    navigate('/admin-dashboard')
 
    return
    }
      }

      // =========================
      // DEPARTMENT LOGIN
      // =========================

      const {
        data: departmentData,
        error: departmentError
      } = await supabase
        .from('departments')
        .select('*')
        .eq('email', cleanEmail)

      console.log(
        'Department Data:',
        departmentData
      )

      console.log(
        'Department Error:',
        departmentError
      )

      if (
        departmentData &&
        departmentData.length > 0
      ) {

        const department =
          departmentData[0]

        if (
          department.password === cleanPassword
        ) {

          localStorage.setItem(
            'user',
            JSON.stringify(department)
          )

          navigate('/department-dashboard')

          return
        }
      }

      // =========================
      // USER LOGIN
      // =========================

      const {
        data: userData
      } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)

      if (
        userData &&
        userData.length > 0
      ) {

        const user = userData[0]

        const userValid =
  await bcrypt.compare(
    cleanPassword,
    user.password
  )

if (userValid) {

  localStorage.setItem(
    'user',
    JSON.stringify(user)
  )

  navigate('/user-dashboard')

  return
}
      }

      alert('Invalid Credentials')

    } catch (err) {

      console.log(err)

      alert('Login Failed')
    }
  }

  // =========================
  // SIGNUP
  // =========================

  const handleSignup = async () => {

    if (
      !fullName ||
      !email ||
      !password
    ) {

      alert('Please fill all fields')
      return
    }

    const {
      data: existingUser
    } = await supabase
      .from('users')
      .select('*')
      .eq(
        'email',
        email.trim().toLowerCase()
      )

    if (
      existingUser &&
      existingUser.length > 0
    ) {

      alert('User already exists')
      return
    }

    const hashedPassword =
  await bcrypt.hash(
    password.trim(),
    10
  )

const { error } =
  await supabase
    .from('users')
    .insert([
      {
        full_name: fullName,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: 'user'
      }
    ])

    if (error) {

      console.log(error)

      alert('Signup failed')

      return
    }

    alert('Signup Successful')

    setIsSignup(false)

    setFullName('')
    setEmail('')
    setPassword('')
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

        </div>

        <div className="login-right">

          <div className="auth-toggle-header">

            <button
              type="button"
              className={
                !isSignup
                ? 'auth-tab active-auth-tab'
                : 'auth-tab'
              }
              onClick={() =>
                setIsSignup(false)
              }
            >
              Login
            </button>

            <button
              type="button"
              className={
                isSignup
                ? 'auth-tab active-auth-tab'
                : 'auth-tab'
              }
              onClick={() =>
                setIsSignup(true)
              }
            >
              Sign Up
            </button>

          </div>

          <form>

            {
              isSignup && (

                <div className="login-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter Full Name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>
              )
            }

            <div className="login-group">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
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
                  setPassword(
                    e.target.value
                  )
                }
                required
              />

            </div>

            <button
              type="button"
              className="login-btn"
              onClick={
                isSignup
                ? handleSignup
                : handleLogin
              }
            >

              {
                isSignup
                ? 'Sign Up'
                : 'Login'
              }

            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

export default Login