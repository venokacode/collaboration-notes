'use client';

import { useEffect, useState } from 'react';
import type { Item } from '../page';

export default function CompletedPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompletedItems();
  }, []);

  const fetchCompletedItems = async () => {
    try {
      const response = await fetch('/api/items?status=done');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching completed items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status_key: 'todo',
        }),
      });

      if (response.ok) {
        await fetchCompletedItems();
      }
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Completed Items</h1>
        <p className="text-gray-600 mt-1">
          View and restore completed items
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No completed items yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <span className="text-xs text-gray-500 uppercase">
                        {item.type_key}
                      </span>
                    </div>
                    {item.content && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
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
                  </div>
                  <button
                    onClick={() => handleRestore(item.id)}
                    className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
