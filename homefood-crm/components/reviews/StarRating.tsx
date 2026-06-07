export function StarRating({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className="inline-flex items-center gap-0.5" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? '#EAB308' : '#E2E8F0' }}>
          ★
        </span>
      ))}
    </div>
  );
}
