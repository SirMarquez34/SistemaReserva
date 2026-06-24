import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegistroClientePage from './pages/RegistroClientePage'
import MisReservasPage from './pages/MisReservasPage'
import DashboardPage from './pages/DashboardPage'
import ClientesPage from './pages/ClientesPage'
import ServiciosPage from './pages/ServiciosPage'
import HorariosPage from './pages/HorariosPage'
import ReservasPage from './pages/ReservasPage'
import EmpleadosPage from './pages/EmpleadosPage'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedClienteRoute from './components/ProtectedClienteRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroClientePage />} />

        {/* Rutas de clientes */}
        <Route element={<ProtectedClienteRoute />}>
          <Route path="/mis-reservas" element={<MisReservasPage />} />
        </Route>

        {/* Rutas de staff */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/horarios" element={<HorariosPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/empleados" element={<EmpleadosPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
