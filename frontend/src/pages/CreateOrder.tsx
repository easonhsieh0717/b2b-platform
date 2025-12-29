import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ShoppingCart } from 'lucide-react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function CreateOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const [inventoryId, setInventoryId] = useState('')
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')

  const [inventory, setInventory] = useState<any>(null)

  useEffect(() => {
    if (location.state?.inventory_id) {
      setInventoryId(location.state.inventory_id)
      api.get(`/inventory/${location.state.inventory_id}`).then((res) => {
        setInventory(res.data.data)
      })
    }
  }, [location.state])

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/orders', data)
      return response.data
    },
    onSuccess: (data) => {
      navigate(`/orders/${data.data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!inventory || !location.state?.seller_company_tax_id) {
      alert('缺少必要資訊')
      return
    }

    mutation.mutate({
      seller_company_tax_id: location.state.seller_company_tax_id,
      seller_branch_code: inventory.branch_code,
      items: [
        {
          inventory_id: inventoryId,
          qty,
        },
      ],
      payment_mode: 'escrow',
      notes,
    })
  }

  if (!inventory) {
    return <div className="text-center py-12">載入中...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">建立訂單</h1>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">商品資訊</h3>
          <div>
            {inventory.brand} {inventory.model}
          </div>
          <div className="text-primary-600 font-semibold mt-2">
            NT$ {inventory.price.toLocaleString()} / 件
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              數量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              max={inventory.qty}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              可用庫存：{inventory.qty} 件
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">備註</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="如有特殊需求請在此註明"
            />
          </div>

          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>商品總額：</span>
              <span className="font-semibold">
                NT$ {(inventory.price * qty).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span>平台服務費（2%）：</span>
              <span className="font-semibold">
                NT$ {(inventory.price * qty * 0.02).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>總計：</span>
              <span className="text-primary-600">
                NT${' '}
                {(
                  inventory.price * qty +
                  inventory.price * qty * 0.02
                ).toFixed(0)}
              </span>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{mutation.isPending ? '建立中...' : '建立訂單'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
