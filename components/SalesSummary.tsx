type Props = {
  todaySales: number;
  monthlySales: number;
};

export default function SalesSummary({
  todaySales,
  monthlySales,
}: Props) {
  return (
    <>
      <div className="mb-4 text-lg font-bold">
        本日の売上:
        ¥{todaySales.toLocaleString()}
      </div>

      <div className="mb-4 text-lg font-bold">
        今月の売上:
        ¥{monthlySales.toLocaleString()}
      </div>
    </>
  );
}