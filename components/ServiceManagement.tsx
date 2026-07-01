type ServiceManagementProps = {};

export default function ServiceManagement(
  {}: ServiceManagementProps
) {
  return (
    <div className="border rounded p-6">
      <h2 className="text-2xl font-bold mb-4">
        施術管理
      </h2>
        <div className="space-y-4">

        <input
            type="text"
            placeholder="施術名"
            className="border p-2 w-full"
        />

        <input
            type="number"
            placeholder="税抜価格"
            className="border p-2 w-full"
        />

        <input
            type="number"
            placeholder="施術時間（分）"
            className="border p-2 w-full"
        />

        <button
            className="bg-black text-white px-4 py-2 rounded"
        >
            登録
        </button>

        </div>


    </div>
  );
}