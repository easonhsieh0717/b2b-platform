import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Package, MapPin } from 'lucide-react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function InventoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', id],
    queryFn: async () => {
      const response = await api.get(`/inventory/${id}`)
      return response.data.data
    },
  })

  const handleOrder = () => {
    if (!user) {
      navigate('/login')
      return
    }

    // 建立訂單
    navigate('/orders/new', {
      state: {
        inventory_id: id,
        seller_company_tax_id: data?.company?.company_tax_id,
        seller_branch_code: data?.branch_code,
      },
    })
  }

  if (isLoading) {
    return <div className="text-center py-12">載入中...</div>
  }

  if (!data) {
    return <div className="text-center py-12">商品不存在</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.brand} {data.model}
            </h1>
            {data.spec && (
              <p className="text-lg text-gray-600 mb-4">{data.spec}</p>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  庫存：<strong>{data.qty} 件</strong>
                </span>
              </div>
              {data.color && (
                <div className="text-gray-700">
                  顏色：<strong>{data.color}</strong>
                </div>
              )}
              {data.capacity && (
                <div className="text-gray-700">
                  容量：<strong>{data.capacity}</strong>
                </div>
              )}
              <div className="text-gray-700">
                等級：<strong>{data.grade}</strong>
              </div>
              {data.imei_required && (
                <div className="text-yellow-600 text-sm">
                  ⚠️ 此商品需要 IMEI/序號
                </div>
              )}
            </div>

            {data.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">商品描述</h3>
                <p className="text-gray-600">{data.description}</p>
              </div>
            )}
          </div>

          <div>
            <div className="bg-primary-50 rounded-lg p-6 mb-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                NT$ {data.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                平台服務費：NT$ {(data.price * 0.02).toFixed(0)}
              </div>

              {data.qty > 0 ? (
                <button
                  onClick={handleOrder}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>立即下單</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  已售完
                </button>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">賣家資訊</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>公司：</strong> {data.company?.name}
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {data.branch?.address}, {data.branch?.city}{' '}
                    {data.branch?.district}
                  </span>
                </div>
                {data.branch?.phone && (
                  <div>
                    <strong>電話：</strong> {data.branch.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
