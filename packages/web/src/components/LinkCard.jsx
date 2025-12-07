import { useState } from 'react';

export default function LinkCard({ link, folders, onDelete, onMoveToFolder, userPlan, onTogglePrivacy }) {
  const [showFolderMenu, setShowFolderMenu] = useState(false);

  const screenshotUrl = link.screenshot
    ? link.screenshot.startsWith('data:')
      ? link.screenshot
      : `data:image/jpeg;base64,${link.screenshot}`
    : 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(link.title);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Screenshot */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="block h-full">
          <img
            src={screenshotUrl}
            alt={link.title}
            className="w-full h-full object-cover hover:opacity-75 transition-opacity"
          />
        </a>
      </div>

      {/* Content */}
      <div className="p-4">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 truncate block"
          title={link.title}
        >
          {link.title}
        </a>

        <p className="text-xs text-gray-500 mt-1 truncate">{link.url}</p>

        <div className="text-xs text-gray-400 mt-2">
          {new Date(link.createdAt).toLocaleDateString()}
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <button
                onClick={() => setShowFolderMenu(!showFolderMenu)}
                className="w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium"
              >
                {link.folder}
              </button>

              {showFolderMenu && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-10">
                  {folders.map(folder => (
                    <button
                      key={folder}
                      onClick={() => {
                        onMoveToFolder(link.id, folder);
                        setShowFolderMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                        link.folder === folder ? 'bg-blue-50 font-semibold text-blue-600' : ''
                      }`}
                    >
                      {folder}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onDelete(link.id)}
              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium"
            >
              Delete
            </button>
          </div>

          {userPlan === 'pro' && (
            <button
              onClick={() => onTogglePrivacy(link.id, !link.isPrivate)}
              className={`w-full px-3 py-1 text-xs rounded font-medium transition-colors ${
                link.isPrivate
                  ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {link.isPrivate ? '🔒 Private' : '🌐 Public'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
