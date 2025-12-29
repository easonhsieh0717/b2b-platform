import { Link } from 'react-router-dom'
import { Search, Package, Truck, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Home() {
  const { user } = useAuthStore()

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-12 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            店對店急件調貨平台
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            2 小時內同城送達，即時比價，自動對帳
          </p>
          {!user && (
            <div className="flex space-x-4">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                立即註冊
              </Link>
              <Link
                to="/inventory"
                className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-400 transition"
              >
                開始找貨
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">快速找貨</h3>
          <p className="text-gray-600">
            30 秒內找到所需商品，即時比價，按距離排序
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Truck className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">2 小時送達</h3>
          <p className="text-gray-600">
            整合 Lalamove，同城 2 小時內到店，保成交不失單
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">安全交易</h3>
          <p className="text-gray-600">
            代收代付保障，自動對帳開票，IMEI 序號留存
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">快速操作</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/inventory"
              className="border-2 border-primary-200 rounded-lg p-4 hover:border-primary-400 transition"
            >
              <Package className="h-8 w-8 text-primary-600 mb-2" />
              <h3 className="font-semibold">找貨</h3>
              <p className="text-sm text-gray-600">搜尋需要的商品</p>
            </Link>
            <Link
              to="/my-inventory"
              className="border-2 border-primary-200 rounded-lg p-4 hover:border-primary-400 transition"
            >
              <Package className="h-8 w-8 text-primary-600 mb-2" />
              <h3 className="font-semibold">上架商品</h3>
              <p className="text-sm text-gray-600">管理您的庫存</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
