import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import api from '../api/client'

export default function MyInventory() {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-inventory'],
    queryFn: async () => {
      const response = await api.get('/inventory')
      return response.data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-inventory'] })
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('確定要下架此商品嗎？')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">我的庫存</h1>
        <button
          onClick={() => {
            setEditingItem(null)
            setShowForm(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>新增商品</span>
        </button>
      </div>

      {showForm && (
        <InventoryForm
          item={editingItem}
          onClose={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingItem(null)
            queryClient.invalidateQueries({ queryKey: ['my-inventory'] })
          }}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12">載入中...</div>
      ) : data?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item: any) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {item.brand} {item.model}
                  </h3>
                  {item.spec && (
                    <p className="text-sm text-gray-600">{item.spec}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(item)
                      setShowForm(true)
                    }}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">價格</span>
                  <span className="font-semibold">
                    NT$ {item.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">庫存</span>
                  <span className="font-semibold">{item.qty} 件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">狀態</span>
                  <span
                    className={`font-semibold ${
                      item.is_active ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {item.is_active ? '上架中' : '已下架'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          還沒有上架任何商品
        </div>
      )}
    </div>
  )
}

function InventoryForm({
  item,
  onClose,
  onSuccess,
}: {
  item: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    brand: item?.brand || '',
    model: item?.model || '',
    spec: item?.spec || '',
    color: item?.color || '',
    capacity: item?.capacity || '',
    grade: item?.grade || 'NEW',
    qty: item?.qty || 0,
    price: item?.price || 0,
    imei_required: item?.imei_required || false,
    description: item?.description || '',
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (item) {
        await api.put(`/inventory/${item.id}`, data)
      } else {
        await api.post('/inventory', data)
      }
    },
    onSuccess,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">
          {item ? '編輯商品' : '新增商品'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">品牌 *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">型號 *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">規格</label>
              <input
                type="text"
                value={formData.spec}
                onChange={(e) =>
                  setFormData({ ...formData, spec: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">顏色</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">容量</label>
              <input
                type="text"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">等級</label>
              <select
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="NEW">全新</option>
                <option value="USED">二手</option>
                <option value="REFURBISHED">整新</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">數量 *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.qty}
                onChange={(e) =>
                  setFormData({ ...formData, qty: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">價格 *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.imei_required}
                onChange={(e) =>
                  setFormData({ ...formData, imei_required: e.target.checked })
                }
              />
              <span>需要 IMEI/序號</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {mutation.isPending ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
