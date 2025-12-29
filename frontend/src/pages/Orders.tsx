import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingCart } from 'lucide-react'
import api from '../api/client'

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

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders?type=all')
      return response.data.data
    },
  })

  if (isLoading) {
    return <div className="text-center py-12">載入中...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">我的訂單</h1>

      {data?.length > 0 ? (
        <div className="space-y-4">
          {data.map((order: any) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold">訂單 #{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.buyer_company_tax_id ===
                    order.buyer_company?.company_tax_id
                      ? '我買的'
                      : '我賣的'}
                    {' - '}
                    {order.seller_company?.name || order.buyer_company?.name}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusMap[order.status]?.label || order.status}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">商品數量：</span>
                  <span className="font-semibold">{order.items?.length} 項</span>
                </div>
                <div>
                  <span className="text-gray-600">總金額：</span>
                  <span className="font-semibold text-primary-600">
                    NT$ {order.total_amount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">建立時間：</span>
                  <span className="font-semibold">
                    {new Date(order.created_at).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          還沒有任何訂單
        </div>
      )}
    </div>
  )
}
