import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Package } from 'lucide-react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()

  const [formData, setFormData] = useState({
    provider: 'line',
    line_id: '',
    google_id: '',
    email: '',
    name: '',
    company_tax_id: '',
    company_name: '',
    branch_code: '',
    branch_name: '',
    address: '',
    city: '',
    district: '',
    phone: '',
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({ ...prev, ...location.state }))
    }
  }, [location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/auth/register', formData)
      setAuth(response.data.user, response.data.token)
      navigate('/')
    } catch (error: any) {
      alert(error.response?.data?.error || '註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Package className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            註冊帳號
          </h2>
          <p className="mt-2 text-sm text-gray-600">填寫店家資訊完成註冊</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                統編 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company_tax_id}
                onChange={(e) => setFormData({ ...formData, company_tax_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公司名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="XX通訊行"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分店代碼 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.branch_code}
                onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分店名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="XX店"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="台北市信義區XX路XX號"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                城市 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="台北市"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                區域 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="信義區"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="02-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="您的姓名"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              返回登入
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? '註冊中...' : '完成註冊'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
