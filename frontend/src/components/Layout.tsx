import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, User, LogOut, Search } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">B2B 賣貨便</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/inventory"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Search className="h-5 w-5" />
                <span>找貨</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/my-inventory"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <Package className="h-5 w-5" />
                    <span>我的庫存</span>
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>訂單</span>
                  </Link>
                  <div className="flex items-center space-x-2 border-l pl-4">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  登入
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
