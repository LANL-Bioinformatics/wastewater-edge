import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export const PrivateRoute = ({ children }) => {
  const location = useLocation()
  const user = useSelector((state) => state.user)
  const isAuthenticated = user.isAuthenticated

  if (isAuthenticated) {
    return children
  }

  return <Navigate to={'/login'} state={{ from: location }} />
}
export default PrivateRoute
