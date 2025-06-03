import React, { useState, useRef } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { useNavigate } from 'react-router-dom';
import { Upload, X, PlayCircle, Music } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AudioTrackSelector from '../audio/AudioTrackSelector';
import { AudioTrack } from '../../lib/supabase';

const UploadForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<AudioTrack | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadVideo, loading, error } = useVideoStore();
  const navigate = useNavigate();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setVideoPreview(objectUrl);
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setVideoPreview(objectUrl);
    }
  };
  
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      await uploadVideo({
        file: selectedFile,
        title,
        description,
        audioTrackId: selectedAudioTrack?.id
      });
      navigate('/');
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };
  
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Upload a video</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-gray-700'
          }`}
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
                  htmlFor="video-upload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400"
                >
                  <span>Upload a video</span>
                  <input
                    id="video-upload"
                    name="video-upload"
                    type="file"
                    className="sr-only"
                    accept="video/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">MP4 or WebM up to 100MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-[9/16] max-w-xs mx-auto">
                <video
                  src={videoPreview || ''}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
                  onClick={clearSelectedFile}
                >
                  <X className="h-5 w-5" />
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
            placeholder="Enter video title"
            required
          />
          
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Audio Track
            </label>
            <AudioTrackSelector
              onSelect={setSelectedAudioTrack}
              selectedAudioTrack={selectedAudioTrack}
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            disabled={!selectedFile || loading}
            className="flex-1"
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;