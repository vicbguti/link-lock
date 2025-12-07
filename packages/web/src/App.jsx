import { useState, useEffect } from 'react';
import axios from 'axios';
import Auth from './pages/Auth';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import PublicProfile from './pages/PublicProfile';
import LinkGrid from './components/LinkGrid';
import SearchBar from './components/SearchBar';
import FolderSelector from './components/FolderSelector';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState(['default']);
  const [page, setPage] = useState('links'); // 'links' or 'pricing'

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user info
      axios.get('/api/auth/me')
        .then(res => {
          setUser(res.data);
          setIsAuthenticated(true);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLinks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [links, selectedFolder, searchQuery]);

  const fetchLinks = async () => {
    try {
      const response = await axios.get('/api/links');
      setLinks(response.data);

      // Extract unique folders
      const uniqueFolders = ['default', ...new Set(response.data.map(l => l.folder))];
      setFolders(uniqueFolders);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    }
  };

  // Auto-refresh links every 2 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchLinks();
    }, 2000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const applyFilters = () => {
    let filtered = links;

    if (selectedFolder !== 'all') {
      filtered = filtered.filter(l => l.folder === selectedFolder);
    }

    if (searchQuery) {
      filtered = filtered.filter(l =>
        l.url.includes(searchQuery) || l.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLinks(filtered);
  };

  const handleDelete = async (linkId) => {
    try {
      await axios.delete(`/api/links/${linkId}`);
      setLinks(links.filter(l => l.id !== linkId));
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const handleMoveToFolder = async (linkId, newFolder) => {
    try {
      await axios.patch(`/api/links/${linkId}/folder`, { folder: newFolder });
      setLinks(links.map(l => l.id === linkId ? { ...l, folder: newFolder } : l));
    } catch (error) {
      console.error('Failed to move link:', error);
    }
  };

  const handleTogglePrivacy = async (linkId, isPrivate) => {
    try {
      await axios.patch(`/api/links/${linkId}/privacy`, { isPrivate });
      setLinks(links.map(l => l.id === linkId ? { ...l, isPrivate } : l));
    } catch (error) {
      console.error('Failed to toggle privacy:', error);
      alert(error.response?.data?.error || 'Error');
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`/api/export/${format}`, {
        responseType: format === 'csv' ? 'text' : 'json'
      });
      
      const element = document.createElement('a');
      const file = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      element.href = URL.createObjectURL(file);
      element.download = `linklock-export.${format}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Failed to export:', error);
      alert(error.response?.data?.error || 'Export failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={(data) => {
      setUser(data);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }} />;
  }

  // Handle public profile URLs like /@username
  const pathMatch = window.location.pathname.match(/^\/@([a-z0-9_]+)$/);
  if (pathMatch && !isAuthenticated) {
    return <PublicProfile username={pathMatch[1]} />;
  }

  if (page === 'pricing') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-4 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button onClick={() => setPage('links')} className="text-2xl font-bold text-gray-900">LinkLock</button>
            <button
              onClick={() => {
                localStorage.clear();
                setIsAuthenticated(false);
                setUser(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
        <Pricing user={user} />
      </div>
    );
  }

  if (page === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-4 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button onClick={() => setPage('links')} className="text-2xl font-bold text-gray-900">LinkLock</button>
            <button
              onClick={() => {
                localStorage.clear();
                setIsAuthenticated(false);
                setUser(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
        <Settings user={user} onUpdate={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">LinkLock</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => setPage('settings')}
                className="text-sm text-gray-600 hover:text-gray-900"
                title="Settings"
              >
                ⚙️
              </button>
              {user?.plan === 'free' && (
                <>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Free ({user?.linkCount}/500)</span>
                  <button
                    onClick={() => setPage('pricing')}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Upgrade
                  </button>
                </>
              )}
              {user?.plan === 'pro' && (
                <>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Pro</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      title="Export as CSV"
                    >
                      ⬇️ CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      title="Export as JSON"
                    >
                      ⬇️ JSON
                    </button>
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  localStorage.clear();
                  setIsAuthenticated(false);
                  setUser(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="mt-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <FolderSelector
              folders={folders}
              selectedFolder={selectedFolder}
              onFolderChange={setSelectedFolder}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No links yet. Save your first link with the Chrome extension!</p>
          </div>
        ) : (
          <LinkGrid
            links={filteredLinks}
            folders={folders}
            onDelete={handleDelete}
            onMoveToFolder={handleMoveToFolder}
            userPlan={user?.plan}
            onTogglePrivacy={handleTogglePrivacy}
          />
        )}
      </main>
    </div>
  );
}
