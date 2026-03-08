export default function StatusBadge({ status }) {
  const styles = {
    pending:       'bg-amber-100 text-amber-700 border border-amber-300',
    'in-progress': 'bg-blue-100 text-blue-700 border border-blue-300',
    completed:     'bg-green-100 text-green-700 border border-green-300',
    rejected:      'bg-red-100 text-red-700 border border-red-300',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}