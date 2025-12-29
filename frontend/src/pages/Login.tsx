import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [provider, setProvider] = useState<'line' | 'google'>('line')
  const [lineId, setLineId] = useState('')
  const [googleId, setGoogleId] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = provider === 'line' ? '/auth/line' : '/auth/google'
      const data = provider === 'line'
        ? { line_id: lineId, name: name || '測試用戶', email }
        : { google_id: googleId, email, name: name || '測試用戶' }

      const response = await api.post(endpoint, data)

      if (response.data.requiresRegistration) {
        // 需要註冊
        navigate('/register', {
          state: {
            provider,
            ...(provider === 'line' ? { line_id: lineId } : { google_id: googleId }),
            email,
            name: name || '測試用戶',
          },
        })
      } else {
        // 登入成功
        setAuth(response.data.user, response.data.token)
        navigate('/')
      }
    } catch (error: any) {
      alert(error.response?.data?.error || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            B2B 賣貨便
          </h2>
          <p className="mt-2 text-sm text-gray-600">登入您的帳號</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setProvider('line')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  provider === 'line'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                LINE 登入
              </button>
              <button
                type="button"
                onClick={() => setProvider('google')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  provider === 'google'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Google 登入
              </button>
            </div>

            {provider === 'line' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LINE ID
                  </label>
                  <input
                    type="text"
                    required
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="輸入 LINE ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名（選填）
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="您的姓名"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google ID（測試用）
                  </label>
                  <input
                    type="text"
                    required
                    value={googleId}
                    onChange={(e) => setGoogleId(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="google_user_id"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名（選填）
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="您的姓名"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
