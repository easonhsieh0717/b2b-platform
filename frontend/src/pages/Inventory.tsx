import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Package } from 'lucide-react'
import api from '../api/client'

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    brand: '',
    city: '',
    sort: 'created_at',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'search', searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (filters.brand) params.append('brand', filters.brand)
      if (filters.city) params.append('city', filters.city)
      params.append('sort', filters.sort)
      params.append('page', '1')
      params.append('limit', '20')

      const response = await api.get(`/inventory/search?${params}`)
      return response.data
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">找貨</h1>
        
        {/* 搜尋欄 */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋品牌、型號..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 篩選器 */}
        <div className="flex space-x-4">
          <select
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">所有品牌</option>
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="OPPO">OPPO</option>
            <option value="Xiaomi">Xiaomi</option>
          </select>

          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">所有城市</option>
            <option value="台北市">台北市</option>
            <option value="新北市">新北市</option>
            <option value="桃園市">桃園市</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="created_at">最新上架</option>
            <option value="price">價格由低到高</option>
          </select>
        </div>
      </div>

      {/* 商品列表 */}
      {isLoading ? (
        <div className="text-center py-12">載入中...</div>
      ) : data?.data?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((item: any) => (
            <Link
              key={item.id}
              to={`/inventory/${item.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.brand} {item.model}
                  </h3>
                  {item.spec && (
                    <p className="text-sm text-gray-600">{item.spec}</p>
                  )}
                </div>
                <Package className="h-8 w-8 text-primary-600" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">價格</span>
                  <span className="font-semibold text-primary-600">
                    NT$ {item.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">庫存</span>
                  <span className="font-semibold">{item.qty} 件</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">地點</span>
                  <span className="text-gray-700">
                    {item.branch?.city} {item.branch?.district}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <span className="text-sm text-gray-500">
                  {item.company?.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          沒有找到符合條件的商品
        </div>
      )}
    </div>
  )
}
