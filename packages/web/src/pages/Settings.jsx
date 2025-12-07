import { useState } from 'react';
import axios from 'axios';

export default function Settings({ user, onUpdate }) {
  const [username, setUsername] = useState(user?.username || '');
  const [isPublic, setIsPublic] = useState(user?.isPublic || false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await axios.patch('/api/auth/profile', {
        username: username || null,
        isPublic
      });

      onUpdate(response.data);
      setMessage('✓ Profile updated');
    } catch (err) {
      setMessage('✗ ' + (err.response?.data?.error || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = username ? `${window.location.origin}/@${username}` : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

        <div className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="your_username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">3-20 characters, lowercase letters and numbers only</p>
          </div>

          {/* Public Profile */}
          <div className="border-t pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Make my profile public</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Allow others to see your public links at a shareable URL
            </p>

            {isPublic && username && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">Your public profile URL:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm text-blue-600 break-all">
                    {publicUrl}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      setMessage('✓ Copied to clipboard');
                    }}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Plan Info */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600">
              <strong>Current Plan:</strong> {user?.plan === 'pro' ? 'Pro' : 'Free'}
            </p>
            {user?.plan === 'free' && (
              <p className="text-xs text-gray-500 mt-2">
                Upgrade to Pro to unlock private folders and export features
              </p>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.startsWith('✓')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
