import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function LineCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      alert(`登入失敗: ${error}`)
      navigate('/login')
      return
    }

    if (code) {
      // 用 code 換取 token
      const state = searchParams.get('state')
      api
        .post('/auth/line/callback', { code, state })
        .then((response) => {
          if (response.data.requiresRegistration) {
            // 需要註冊
            navigate('/register', {
              state: {
                provider: 'line',
                line_id: response.data.line_id,
                name: response.data.name,
                email: response.data.email,
              },
            })
          } else {
            // 登入成功
            setAuth(response.data.user, response.data.token)
            navigate('/')
          }
        })
        .catch((error) => {
          console.error('Callback error:', error)
          alert('登入處理失敗，請重試')
          navigate('/login')
        })
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate, setAuth])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在處理登入...</p>
      </div>
    </div>
  )
}
