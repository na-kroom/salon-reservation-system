type ReservationPageProps = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;

  setIsModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  searchTerm: string;
  setSearchTerm: React.Dispatch<
    React.SetStateAction<string>
  >;
};

export default function ReservationPage({
  date,
  setDate,
  setIsModalOpen,
  searchTerm,
  setSearchTerm,
}: ReservationPageProps)
{
  return (
  <>
    <div className="mb-6 flex items-center gap-4">
      <button
        className="border px-3 py-1 rounded"
        onClick={() => {
          const newDate = new Date(date);
          newDate.setDate(date.getDate() - 1);
          setDate(newDate);
        }}
      >
        ◀
      </button>

      <span className="font-semibold">
        {date.toLocaleDateString("ja-JP")}
      </span>

      <button
        className="border px-3 py-1 rounded"
        onClick={() => {
          const newDate = new Date(date);
          newDate.setDate(date.getDate() + 1);
          setDate(newDate);
        }}
      >
        ▶
      </button>
      <div className="mb-6">
  <button
    onClick={() => setIsModalOpen(true)}
    className="rounded bg-black px-4 py-2 text-white"
  >
    ＋予約追加
  </button>
</div>

<input
  type="text"
  placeholder="顧客検索"
  value={searchTerm}
  onChange={(e) =>
    setSearchTerm(e.target.value)
  }
  className="border p-2 mb-4"
/>
    </div>
  </>
);
}