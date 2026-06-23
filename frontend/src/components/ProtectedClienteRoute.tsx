import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedClienteRoute() {
  const { cliente, token } = useAuth()
  return token && cliente ? <Outlet /> : <Navigate to="/login" replace />
}
