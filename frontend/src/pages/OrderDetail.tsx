import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Truck, Package } from 'lucide-react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

const statusMap: Record<string, { label: string; color: string }> = {
  CREATED: { label: '已建立', color: 'bg-gray-100 text-gray-800' },
  CONFIRMED: { label: '已確認', color: 'bg-blue-100 text-blue-800' },
  PAID: { label: '已付款', color: 'bg-green-100 text-green-800' },
  DISPATCHED: { label: '已派車', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: '已送達', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: '已驗收', color: 'bg-green-100 text-green-800' },
  DISPUTED: { label: '糾紛中', color: 'bg-red-100 text-red-800' },
  SETTLED: { label: '已完成', color: 'bg-gray-100 text-gray-800' },
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`)
      return response.data.data
    },
  })

  const confirmMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/orders/${id}/confirm`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
  })

  const acceptMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/orders/${id}/accept`, {
        imei_list: [],
        proof_photos: [],
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
  })

  const paymentMutation = useMutation({
    mutationFn: async (method: string) => {
      const response = await api.post(`/payments/${id}/prepare`, { method })
      return response.data
    },
    onSuccess: (data) => {
      // 模擬付款完成（實際應該跳轉到支付頁面）
      if (confirm('模擬付款完成？')) {
        api.post(`/payments/${id}/simulate-pay`).then(() => {
          queryClient.invalidateQueries({ queryKey: ['order', id] })
        })
      }
    },
  })

  const quoteMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/shipments/${id}/quote`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
  })

  const dispatchMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/shipments/${id}/dispatch`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-12">載入中...</div>
  }

  if (!data) {
    return <div className="text-center py-12">訂單不存在</div>
  }

  const isBuyer = data.buyer_company_tax_id === user?.company?.company_tax_id
  const isSeller = data.seller_company_tax_id === user?.company?.company_tax_id

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              訂單 #{id?.substring(0, 8)}
            </h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                statusMap[data.status]?.color || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusMap[data.status]?.label || data.status}
            </span>
          </div>
        </div>

        {/* 商品列表 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">商品明細</h2>
          <div className="space-y-3">
            {data.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-semibold">
                    {item.inventory.brand} {item.inventory.model}
                  </div>
                  <div className="text-sm text-gray-600">
                    數量：{item.qty} × NT$ {item.unit_price.toLocaleString()}
                  </div>
                </div>
                <div className="font-semibold">
                  NT$ {(item.qty * item.unit_price).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 金額明細 */}
        <div className="border-t pt-6 mb-6">
          <div className="space-y-2 text-right">
            <div className="flex justify-between">
              <span>商品總額：</span>
              <span>NT$ {data.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>平台服務費：</span>
              <span>NT$ {data.platform_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>運費：</span>
              <span>NT$ {data.shipping_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>總計：</span>
              <span className="text-primary-600">
                NT${' '}
                {(
                  data.total_amount +
                  data.platform_fee +
                  data.shipping_fee
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="border-t pt-6 space-y-4">
          {isSeller && data.status === 'CREATED' && (
            <button
              onClick={() => confirmMutation.mutate()}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center space-x-2"
            >
              <Check className="h-5 w-5" />
              <span>確認訂單</span>
            </button>
          )}

          {isBuyer && data.status === 'CONFIRMED' && !data.payment && (
            <div className="space-y-2">
              <button
                onClick={() => paymentMutation.mutate('virtual_account')}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
              >
                付款（虛擬帳號/ATM）
              </button>
              <button
                onClick={() => paymentMutation.mutate('card')}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700"
              >
                付款（信用卡）
              </button>
            </div>
          )}

          {isSeller && data.status === 'PAID' && !data.shipment && (
            <button
              onClick={() => quoteMutation.mutate()}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              取得物流報價
            </button>
          )}

          {isSeller &&
            data.shipment?.status === 'QUOTED' &&
            data.status === 'PAID' && (
              <button
                onClick={() => dispatchMutation.mutate()}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center space-x-2"
              >
                <Truck className="h-5 w-5" />
                <span>派車</span>
              </button>
            )}

          {isBuyer && data.status === 'DELIVERED' && (
            <button
              onClick={() => acceptMutation.mutate()}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <Check className="h-5 w-5" />
              <span>驗收完成</span>
            </button>
          )}

          {data.shipment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">物流資訊</h3>
              <div className="text-sm space-y-1">
                <div>狀態：{statusMap[data.shipment.status]?.label}</div>
                {data.shipment.driver_name && (
                  <div>司機：{data.shipment.driver_name}</div>
                )}
                {data.shipment.driver_phone && (
                  <div>電話：{data.shipment.driver_phone}</div>
                )}
                {data.shipment.tracking_url && (
                  <a
                    href={data.shipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    追蹤物流
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
