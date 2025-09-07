export function ActivityFeed() {
  const items = [
    { id: 1, text: "CLAIM-001 approved by Gram Sabha", time: "2h ago" },
    { id: 2, text: "CLAIM-010 submitted by Gram Sabha", time: "5h ago" },
    { id: 3, text: "CLAIM-005 rejected by Forest Ministry", time: "1d ago" },
  ];

  return (
    <div className="rounded-xl border p-4 card-quiet">
      <h4 className="font-semibold mb-2">Recent Activity</h4>
      <ul className="space-y-3 text-sm">
        {items.map((it) => (
          <li key={it.id} className="flex items-start justify-between">
            <div className="text-muted-foreground">{it.text}</div>
            <div className="text-xs text-muted-foreground">{it.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
