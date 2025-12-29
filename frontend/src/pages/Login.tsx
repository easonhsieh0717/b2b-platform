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

  // LINE 登入 - 跳轉到 LINE 授權頁面
  const handleLineLogin = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    window.location.href = `${apiUrl}/api/auth/line/authorize`
  }

  // Google 登入 - 跳轉到 Google 授權頁面
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/google/authorize`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            B2B 賣貨便
          </h2>
          <p className="mt-2 text-sm text-gray-600">登入您的帳號</p>
        </div>

        <div className="mt-8 space-y-4">
          {/* LINE 登入按鈕 */}
          <button
            type="button"
            onClick={handleLineLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-white bg-[#06C755] hover:bg-[#05B548] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06C755] transition"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.028 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            LINE 登入
          </button>

          {/* Google 登入按鈕 */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 登入
          </button>

          {/* 分隔線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">或</span>
            </div>
          </div>

          {/* 測試模式表單 */}
          <form className="space-y-4" onSubmit={handleLogin}>

            <div className="text-xs text-gray-500 mb-2">測試模式（開發用）</div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setProvider('line')}
                className={`flex-1 py-2 px-3 text-xs rounded ${
                  provider === 'line'
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                LINE
              </button>
              <button
                type="button"
                onClick={() => setProvider('google')}
                className={`flex-1 py-2 px-3 text-xs rounded ${
                  provider === 'google'
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                Google
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="您的姓名"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? '登入中...' : '測試登入'}
            </button>
          </form>
      </div>
    </div>
  )
}
