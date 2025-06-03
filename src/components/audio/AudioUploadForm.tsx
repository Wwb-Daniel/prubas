import React, { useState, useRef, useEffect } from 'react';
import { supabase, AUDIO_BUCKET } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Upload, X, Music, Tag } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AudioUploadForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  // Check if bucket exists on component mount
  useEffect(() => {
    const checkBucket = async () => {
      try {
        const { data: buckets, error: bucketsError } = await supabase
          .storage
          .listBuckets();

        if (bucketsError) throw bucketsError;

        const bucketExists = buckets.some(bucket => bucket.name === AUDIO_BUCKET);
        
        if (!bucketExists) {
          setError('Audio storage is not properly configured. Please contact support.');
          return;
        }
      } catch (error: any) {
        console.error('Error checking bucket:', error);
        setError('Failed to initialize audio storage. Please try again later.');
      }
    };

    checkBucket();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file (MP3, WAV, or OGG)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      const objectUrl = URL.createObjectURL(file);
      setAudioPreview(objectUrl);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file (MP3, WAV, or OGG)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      const objectUrl = URL.createObjectURL(file);
      setAudioPreview(objectUrl);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
      setAudioPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user) return;

    try {
      setLoading(true);
      setError(null);

      // Create a unique file path with user ID
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload audio file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(AUDIO_BUCKET)
        .getPublicUrl(fileName);

      // Create audio track record in the database
      const { error: dbError } = await supabase
        .from('audio_tracks')
        .insert({
          user_id: user.id,
          title,
          audio_url: publicUrl,
          genre,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        });

      if (dbError) throw dbError;

      // Reset form
      clearSelectedFile();
      setTitle('');
      setGenre('');
      setTags('');
      
      // Show success message or redirect
      alert('Audio track uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading audio:', error);
      setError(error.message || 'Failed to upload audio track. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-400">
              <label
                htmlFor="audio-upload"
                className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400"
              >
                <span>Upload an audio file</span>
                <input
                  id="audio-upload"
                  name="audio-upload"
                  type="file"
                  className="sr-only"
                  accept="audio/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">MP3, WAV, or OGG up to 10MB</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Music className="h-12 w-12 text-blue-500" />
            </div>
            <div className="text-sm text-gray-400">
              <p>{selectedFile.name}</p>
              <button
                type="button"
                className="text-red-500 hover:text-red-400 mt-2"
                onClick={clearSelectedFile}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter audio track title"
          required
        />

        <Input
          label="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Enter genre (e.g., Pop, Rock, Hip Hop)"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Tags
          </label>
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-gray-400" />
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button
        type="submit"
        disabled={!selectedFile || loading}
        className="w-full"
      >
        {loading ? 'Uploading...' : 'Upload Audio Track'}
      </Button>
    </form>
  );
};

export default AudioUploadForm; 