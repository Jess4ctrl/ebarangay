export default function PriorityBadge({ priority }) {
  // Normalize the input to lowercase to match the keys in 'styles'
  const p = priority?.toLowerCase() || 'normal';

  const styles = {
    normal: 'bg-gray-100 text-gray-600 border border-gray-300',
    high:   'bg-orange-100 text-orange-700 border border-orange-300',
    urgent: 'bg-red-100 text-red-700 border border-red-300',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[p] || styles.normal}`}>
      {p}
    </span>
  );
}