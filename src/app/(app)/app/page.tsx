'use client';

import { useEffect, useState } from 'react';
import { ItemsList } from '@/components/items/ItemsList';
import { ItemsGrid } from '@/components/items/ItemsGrid';
import { ItemEditor } from '@/components/items/ItemEditor';
import { NewItemButton } from '@/components/items/NewItemButton';

export type Item = {
  id: string;
  title: string;
  content: string;
  type_key: string;
  status_key: string;
  color: string | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string | null;
};

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchTags();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items?status=active');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedItem(null);
    setIsCreating(true);
  };

  const handleSave = async () => {
    await fetchItems();
    setIsCreating(false);
  };

  const handleCancel = () => {
    setSelectedItem(null);
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left Panel - Todo List */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Todo List</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ItemsList
              items={items}
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
            />
          </div>
          <div className="p-4 border-t border-gray-200">
            <NewItemButton onClick={handleCreateNew} />
          </div>
        </div>
      </div>

      {/* Right Panel - Notes / Cards Area */}
      <div className="flex-1 flex flex-col gap-6">
        {isCreating || selectedItem ? (
          <ItemEditor
            item={selectedItem}
            tags={tags}
            onSave={handleSave}
            onCancel={handleCancel}
            onTagsChange={fetchTags}
          />
        ) : (
          <ItemsGrid items={items} onItemClick={handleItemClick} />
        )}
      </div>
    </div>
  );
}
