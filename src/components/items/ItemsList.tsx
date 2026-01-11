import type { Item } from '@/app/(app)/app/page';

type ItemsListProps = {
  items: Item[];
  selectedItem: Item | null;
  onItemClick: (item: Item) => void;
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
};

export function ItemsList({
  items,
  selectedItem,
  onItemClick,
}: ItemsListProps) {
  // Group items by type_key
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.type_key]) {
        acc[item.type_key] = [];
      }
      acc[item.type_key].push(item);
      return acc;
    },
    {} as Record<string, Item[]>
  );

  return (
    <div className="divide-y divide-gray-100">
      {Object.entries(groupedItems).map(([typeKey, typeItems]) => (
        <div key={typeKey} className="py-2">
          <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {typeKey}
          </div>
          <div className="space-y-1">
            {typeItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  selectedItem?.id === item.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.color && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {STATUS_LABELS[item.status_key] || item.status_key}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gray-500">
          No items yet. Create your first item!
        </div>
      )}
    </div>
  );
}
