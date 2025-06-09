import React, { useState, useEffect } from 'react';
import { Eye, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ProfileVisitorsProps {
  profileId: string;
}

interface Visitor {
  id: string;
  username: string;
  avatar_url?: string;
  visited_at: string;
}

const ProfileVisitors: React.FC<ProfileVisitorsProps> = ({ profileId }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    fetchVisitors();
  }, [profileId]);

  const fetchVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_visitors')
        .select(`
          visited_at,
          visitor:profiles!visitor_id(
            id,
            username,
            avatar_url
          )
        `)
        .eq('profile_id', profileId)
        .order('visited_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const visitorsList = data?.map(item => ({
        ...item.visitor,
        visited_at: item.visited_at
      })).filter(Boolean) || [];

      setVisitors(visitorsList);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    const container = document.getElementById('visitors-container');
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('visitors-container');
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Eye size={20} />
          <h3 className="font-semibold">Recent Visitors</h3>
        </div>
        <div className="flex space-x-3 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 animate-pulse">
              <div className="w-12 h-12 bg-gray-700 rounded-full mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Eye size={20} />
          <h3 className="font-semibold">Recent Visitors</h3>
        </div>
        <div className="text-center py-4">
          <Eye size={32} className="mx-auto text-gray-600 mb-2" />
          <p className="text-gray-400 text-sm">No recent visitors</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Eye size={20} />
          <h3 className="font-semibold">Recent Visitors</h3>
        </div>
        {visitors.length > 4 && (
          <div className="flex space-x-1">
            <button
              onClick={scrollLeft}
              className="p-1 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={scrollRight}
              className="p-1 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div 
        id="visitors-container"
        className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visitors.map((visitor) => (
          <Link
            key={visitor.id}
            to={`/profile/${visitor.id}`}
            className="flex-shrink-0 text-center hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              {visitor.avatar_url ? (
                <img
                  src={visitor.avatar_url}
                  alt={visitor.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 hover:border-blue-500 transition-colors"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-700 hover:border-blue-500 transition-colors">
                  <User size={20} />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <p className="text-xs mt-2 truncate w-16 text-gray-300">
              {visitor.username}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(visitor.visited_at), { addSuffix: true }).replace('about ', '')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfileVisitors;