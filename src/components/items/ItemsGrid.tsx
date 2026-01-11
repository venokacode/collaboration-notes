import type { Item } from '@/app/(app)/app/page';

type ItemsGridProps = {
  items: Item[];
  onItemClick: (item: Item) => void;
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
};

export function ItemsGrid({ items, onItemClick }: ItemsGridProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">
          No items to display. Create a new item to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {item.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="text-xs text-gray-500 uppercase font-medium">
                {item.type_key}
              </span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {STATUS_LABELS[item.status_key] || item.status_key}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {item.title}
          </h3>

          {item.content && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
              {item.content}
            </p>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  style={
                    tag.color
                      ? {
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                        }
                      : undefined
                  }
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
