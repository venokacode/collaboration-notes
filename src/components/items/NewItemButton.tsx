type NewItemButtonProps = {
  onClick: () => void;
};

export function NewItemButton({ onClick }: NewItemButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      + New Item
    </button>
  );
}
