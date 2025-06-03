import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AudioTrack } from '../lib/supabase';
import { Music, Search, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AudioUploadForm from '../components/audio/AudioUploadForm';

const AudioTracksPage: React.FC = () => {
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const fetchAudioTracks = async (query: string = '') => {
    try {
      setLoading(true);
      setError(null);

      let queryBuilder = supabase
        .from('audio_tracks')
        .select(`
          *,
          user_profile:profiles(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,genre.ilike.%${query}%,tags.cs.{${query}}`);
      }

      const { data, error: fetchError } = await queryBuilder;

      if (fetchError) throw fetchError;
      setAudioTracks(data || []);
    } catch (error: any) {
      console.error('Error fetching audio tracks:', error);
      setError(error.message || 'Failed to load audio tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioTracks(searchQuery);
  }, [searchQuery]);

  const handlePlay = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Audio Tracks</h1>
          <Button onClick={() => setShowUploadForm(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Upload Audio
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audio tracks..."
            className="pl-10"
          />
        </div>

        {error && (
          <div className="text-red-500 text-center mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audioTracks.map((track) => (
              <div
                key={track.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => handlePlay(track.audio_url)}
                    className="flex-shrink-0 bg-blue-500 rounded-full p-3 hover:bg-blue-600 transition-colors"
                  >
                    <Music className="h-6 w-6" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <p className="text-sm text-gray-400">{track.genre}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {track.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      By {track.user_profile?.username}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Upload Audio Track</h2>
              <AudioUploadForm />
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => setShowUploadForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTracksPage; 