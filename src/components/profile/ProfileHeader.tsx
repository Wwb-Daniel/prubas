import React, { useState, useEffect } from 'react';
import { User, MessageCircle, Users, Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { useProfileStore } from '../../store/profileStore';
import Button from '../ui/Button';
import ChatPanel from '../chat/ChatPanel';
import FollowersModal from './FollowersModal';
import ProfileVisitors from './ProfileVisitors';
import { AnimatePresence } from 'framer-motion';

interface ProfileHeaderProps {
  profile: {
    id: string;
    username: string;
    avatar_url?: string;
    bio?: string;
  };
  onEditClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onEditClick }) => {
  const { user } = useAuthStore();
  const { followUser, unfollowUser, isFollowing, getFollowersCount, getFollowingCount } = useUserStore();
  const { recordProfileVisit, getProfileStats } = useProfileStore();
  const [following, setFollowing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState<'followers' | 'following' | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const isCurrentUser = user?.id === profile.id;

  useEffect(() => {
    const loadProfileData = async () => {
      if (profile.id) {
        setLoading(true);
        try {
          // Record profile visit if not current user
          if (!isCurrentUser) {
            await recordProfileVisit(profile.id);
          }

          const [followStatus, followers, following, stats] = await Promise.all([
            isFollowing(profile.id),
            getFollowersCount(profile.id),
            getFollowingCount(profile.id),
            getProfileStats(profile.id)
          ]);
          
          setFollowing(followStatus);
          setFollowersCount(followers);
          setFollowingCount(following);
          setTotalLikes(stats.totalLikes);
        } catch (error) {
          console.error('Error loading profile data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadProfileData();
  }, [profile.id, isFollowing, getFollowersCount, getFollowingCount, getProfileStats, recordProfileVisit, isCurrentUser]);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (following) {
      await unfollowUser(profile.id);
      setFollowersCount(prev => prev - 1);
    } else {
      await followUser(profile.id);
      setFollowersCount(prev => prev + 1);
    }
    setFollowing(!following);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-800 rounded w-48 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-64 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center p-3">
                <div className="h-6 bg-gray-800 rounded w-12 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded w-16 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mx-auto mb-4"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-gray-400" />
            </div>
          )}
          
          <h2 className="text-2xl sm:text-3xl font-bold">@{profile.username}</h2>
          {profile.bio && (
            <p className="text-gray-400 mt-2 max-w-lg mx-auto">{profile.bio}</p>
          )}
        </div>

        {/* Stats Grid - Only showing Followers, Following, and Total Likes */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setShowFollowersModal('followers')}
            className="text-center p-3 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="text-xl sm:text-2xl font-bold">{formatCount(followersCount)}</div>
            <div className="text-sm sm:text-base text-gray-400 flex items-center justify-center">
              <Users size={16} className="mr-1" />
              Followers
            </div>
          </button>
          
          <button
            onClick={() => setShowFollowersModal('following')}
            className="text-center p-3 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="text-xl sm:text-2xl font-bold">{formatCount(followingCount)}</div>
            <div className="text-sm sm:text-base text-gray-400 flex items-center justify-center">
              <Users size={16} className="mr-1" />
              Following
            </div>
          </button>

          <div className="text-center p-3">
            <div className="text-xl sm:text-2xl font-bold">{formatCount(totalLikes)}</div>
            <div className="text-sm sm:text-base text-gray-400 flex items-center justify-center">
              <Heart size={16} className="mr-1" />
              Likes
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          {isCurrentUser ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClick}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant={following ? 'outline' : 'primary'}
                size="sm"
                onClick={handleFollowClick}
              >
                {following ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(true)}
              >
                <MessageCircle size={18} className="mr-2" />
                Message
              </Button>
            </>
          )}
        </div>

        {/* Recent Visitors - Only show for current user */}
        {isCurrentUser && (
          <div className="max-w-md mx-auto">
            <ProfileVisitors profileId={profile.id} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showChat && (
          <ChatPanel 
            onClose={() => setShowChat(false)} 
            initialReceiverId={profile.id}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFollowersModal && (
          <FollowersModal
            userId={profile.id}
            type={showFollowersModal}
            onClose={() => setShowFollowersModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileHeader;