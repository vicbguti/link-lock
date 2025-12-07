import { useState, useEffect } from 'react';
import axios from 'axios';
import LinkGrid from '../components/LinkGrid';

export default function PublicProfile({ username }) {
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/public/${username}`);
      setProfile(response.data.user);
      setLinks(response.data.links);
    } catch (err) {
      setError(err.response?.data?.error || 'Profile not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-4">Profile not found</p>
          <p className="text-gray-600">{error}</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <a href="/" className="text-blue-600 hover:underline mb-4 inline-block">← Back</a>
          <h1 className="text-4xl font-bold text-gray-900">{profile?.username}</h1>
          <p className="text-gray-600 mt-2">
            {links.length} public link{links.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {links.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No public links yet</p>
          </div>
        ) : (
          <LinkGrid
            links={links}
            folders={['default']}
            onDelete={() => {}}
            onMoveToFolder={() => {}}
            userPlan="free"
            onTogglePrivacy={() => {}}
          />
        )}
      </main>
    </div>
  );
}
