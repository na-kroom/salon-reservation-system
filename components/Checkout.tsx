
export default function Checkout() {
  return (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="mb-6 text-3xl font-bold text-gray-800">
      会計
    </h2>

    <div className="grid gap-6 lg:grid-cols-2">
      {/* 左側 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">会計入力</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">予約</label>
            <select className="w-full rounded-lg border p-2">
              <option>山田 花子 10:00</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">施術料金</label>
            <input
              type="number"
              defaultValue={5000}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">商品</label>
            <select className="w-full rounded-lg border p-2">
              <option>N.オイル</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">数量</label>
            <input
              type="number"
              defaultValue={1}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <button className="w-full rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-700">
            商品を追加
          </button>
        </div>
      </div>

      {/* 右側 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">会計内容</h3>

        <div className="mb-6 space-y-2">
          <div className="flex justify-between">
            <span>N.オイル ×1</span>
            <span>¥3,200</span>
          </div>
        </div>

        <hr className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>施術料金</span>
            <span>¥5,000</span>
          </div>

          <div className="flex justify-between">
            <span>商品合計</span>
            <span>¥3,200</span>
          </div>

          <div className="flex justify-between">
            <span>消費税</span>
            <span>¥820</span>
          </div>

          <div className="mt-4 flex justify-between border-t pt-4 text-xl font-bold">
            <span>合計</span>
            <span>¥9,020</span>
          </div>
        </div>

        <button className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700">
          会計完了
        </button>
      </div>
    </div>
  </div>
)}