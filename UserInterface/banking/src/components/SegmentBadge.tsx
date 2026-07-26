export default function SegmentBadge({ segment }: { segment: string }) {
  const s = (segment ?? "").toLowerCase();

  let cls = "badge-everyday";
  if (s.includes("premium") || s.includes("investor")) cls = "badge-premium";
  else if (s.includes("dormant") || s.includes("recovery")) cls = "badge-dormant";
  else if (s.includes("emerging") || s.includes("affluent")) cls = "badge-emerging";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}
    >
      {segment}
    </span>
  );
}
