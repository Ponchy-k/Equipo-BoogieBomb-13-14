import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './components/ui'
import { AppRouter } from './routes/AppRouter'
import { RoleSwitcher } from './components/layout/RoleSwitcher'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <DataProvider>
          <AuthProvider>
            <CartProvider>
              <AppRouter />
              <RoleSwitcher />
            </CartProvider>
          </AuthProvider>
        </DataProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
