/**
 * Loading placeholder.
 *
 * Replaces the shimmering gradient skeletons used previously. A shimmer
 * animates indefinitely on every load and adds motion noise to a dense
 * operations screen; a static hatched slab with a mono readout communicates
 * the same "content pending" state without competing for attention.
 */
export function Placeholder({
  height,
  label = 'Loading',
  className,
}: {
  height: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`ops-placeholder${className ? ` ${className}` : ''}`}
      style={{ height }}
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  );
}
