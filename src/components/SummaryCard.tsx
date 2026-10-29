export default function SummaryCard({
  testId,
  title,
  value,
}: {
  testId: string;
  title: string;
  value: number | string;
}) {
  return (
    <div className="card summary-card" data-testid={testId}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}
