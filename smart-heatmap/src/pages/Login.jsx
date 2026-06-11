import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaEye,
  FaEyeSlash
} from 'react-icons/fa'

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

  const [showPassword, setShowPassword] =
    useState(false)

  const namePattern =
    /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/

  const emailPattern =
    /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

  const validateSignup = () => {

    const cleanName =
      fullName.trim().replace(/\s+/g, ' ')

    const cleanEmail =
      email.trim().toLowerCase()

    const cleanPassword =
      password.trim()

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPassword
    ) {
      return 'Please fill all fields'
    }

    if (
      cleanName.length < 3 ||
      cleanName.length > 60 ||
      !namePattern.test(cleanName)
    ) {
      return 'Full name should contain only letters, spaces, dot, apostrophe, or hyphen.'
    }

    const emailLocalPart =
      cleanEmail.split('@')[0] || ''

    if (
      !emailPattern.test(cleanEmail) ||
      emailLocalPart.includes('..')
    ) {
      return 'Please enter a valid email address.'
    }

    if (!passwordPattern.test(cleanPassword)) {
      return 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    }

    return ''
  }

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

    const validationError =
      validateSignup()

    if (validationError) {

      alert(validationError)
      return
    }

    const cleanName =
      fullName.trim().replace(/\s+/g, ' ')

    const cleanEmail =
      email.trim().toLowerCase()

    const cleanPassword =
      password.trim()

    const {
      data: existingUser
    } = await supabase
      .from('users')
      .select('*')
      .eq(
        'email',
        cleanEmail
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
    cleanPassword,
    10
  )

const { error } =
  await supabase
    .from('users')
    .insert([
      {
        full_name: cleanName,
        email: cleanEmail,
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
                    minLength={3}
                    maxLength={60}
                    pattern="[A-Za-z][A-Za-z .'-]{1,58}[A-Za-z]"
                    title="Use only letters, spaces, dot, apostrophe, or hyphen."
                    autoComplete="name"
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
                pattern="[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}"
                title="Enter a valid email address. It cannot start or end with a dot before @."
                autoComplete="email"
                required
              />

            </div>

            <div className="login-group">

              <label>
                Password
              </label>

              <div className="password-input-wrap">

                <input
                  type={
                    showPassword
                    ? 'text'
                    : 'password'
                  }
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  minLength={8}
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}"
                  title="Use at least 8 characters with uppercase, lowercase, number, and special character."
                  autoComplete={
                    isSignup
                    ? 'new-password'
                    : 'current-password'
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                    ? 'Hide password'
                    : 'Show password'
                  }
                  title={
                    showPassword
                    ? 'Hide password'
                    : 'Show password'
                  }
                >
                  {
                    showPassword
                    ? <FaEyeSlash />
                    : <FaEye />
                  }
                </button>

              </div>

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
