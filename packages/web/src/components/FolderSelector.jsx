export default function FolderSelector({ folders, selectedFolder, onFolderChange }) {
  return (
    <div className="mt-4 flex gap-2 flex-wrap">
      <button
        onClick={() => onFolderChange('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedFolder === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        All
      </button>

      {folders.map(folder => (
        <button
          key={folder}
          onClick={() => onFolderChange(folder)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedFolder === folder
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {folder}
        </button>
      ))}
    </div>
  );
}
