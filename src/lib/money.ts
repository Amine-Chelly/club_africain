/** Display prices stored as integer cents (TND). */
export function formatTnd(cents: number) {
  return (cents / 100).toFixed(2);
}
