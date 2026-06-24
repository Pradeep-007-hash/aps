import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, User, Tag, Heart, MessageCircle, Edit, Trash2, Phone, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const API_URL = "http://localhost:5000";

export default function Events({ isPast = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for commenting
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchData();
  }, [isPast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, announcementsRes] = await Promise.all([
        fetch(`${API_URL}/events/${isPast ? 'past' : 'upcoming'}`),
        fetch(`${API_URL}/announcements`)
      ]);

      if (!eventsRes.ok) throw new Error("Failed to fetch events");
      if (!announcementsRes.ok) throw new Error("Failed to fetch announcements");

      const eventsData = await eventsRes.json();
      const announcementsData = await announcementsRes.json();

      setEvents(eventsData);
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (eventId) => {
    if (!user) return; // Only logged in users
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/like`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Update specific event's likes in state
        setEvents(events.map(ev => ev._id === eventId ? { ...ev, likes: data.likes } : ev));
      }
    } catch (err) {
      console.error("Error liking event", err);
    }
  };

  const handleCommentChange = (eventId, value) => {
    setCommentInputs({ ...commentInputs, [eventId]: value });
  };

  const submitComment = async (eventId) => {
    if (!user || !commentInputs[eventId]?.trim()) return;

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ text: commentInputs[eventId] })
      });

      if (res.ok) {
        const data = await res.json();
        // Add new comment to state
        setEvents(events.map(ev => {
          if (ev._id === eventId) {
            return { ...ev, comments: [...(ev.comments || []), data.comment] };
          }
          return ev;
        }));
        // Clear input
        setCommentInputs({ ...commentInputs, [eventId]: '' });
      }
    } catch (err) {
      console.error("Error submitting comment", err);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id
        }
      });

      if (res.ok) {
        setEvents(events.filter(ev => ev._id !== eventId));
      } else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.error}`);
      }
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Error processing deletion.");
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center text-primary-600"><span className="animate-pulse font-bold text-xl">Loading Events...</span></div>;
  if (error) return <div className="p-8"><p className="text-red-500 font-medium">Error: {error}</p></div>;

  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      {/* Announcement Marquee */}
      {latestAnnouncement && (
        <div className="mb-8 overflow-hidden bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-lg flex items-center shadow-sm">
          <div className="px-4 py-3 bg-primary-500 text-white font-bold flex items-center gap-2 z-10 whitespace-nowrap">
            <Megaphone className="w-5 h-5 animate-bounce" />
            Announcement
          </div>
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="animate-marquee whitespace-nowrap px-4 font-medium">
              <span className="font-bold mr-2 uppercase tracking-wide bg-primary-200 dark:bg-primary-800 px-2 py-0.5 rounded text-xs">
                {latestAnnouncement.title}
              </span> 
              {latestAnnouncement.content}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
            {isPast ? 'Past Events' : 'Event Dashboard'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg transition-colors">
            {isPast ? 'Look back at our previous community events.' : 'Discover and engage with upcoming community events.'}
          </p>
        </div>
        {!isPast && (user?.role === 'admin' || user?.role === 'member') && (
          <Button onClick={() => navigate('/events/add')} className="px-6 py-2.5 shadow-lg flex items-center gap-2 font-bold hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" /> Add New Event
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">No Events Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isPast ? 'There are currently no past events recorded.' : 'There are currently no upcoming events scheduled.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
          {events.map(event => {
            const isOwner = user && String(event.postedBy) === String(user.id);
            const isAdmin = user && user.role === 'admin';
            const canEditOrDelete = isOwner || isAdmin;
            
            // Check if user has liked
            const hasLiked = user && event.likes?.includes(user.id);

            return (
              <div key={event._id} className="glass-card flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 transform hover:-translate-y-1">
                {/* Image Section */}
                <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                  {event.image ? (
                    <img src={`data:image/jpeg;base64,${event.image}`} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Calendar className="w-12 h-12 mb-2 opacity-50" />
                      <span className="font-medium text-sm">No image provided</span>
                    </div>
                  )}
                  {event.category && (
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-primary-700 dark:text-primary-300 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                      {event.category}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col content-stretch">
                  {/* Poster Profile Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
                      {event.posterImage ? (
                        <img src={`data:image/jpeg;base64,${event.posterImage}`} alt={event.posterName || 'Poster'} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none">{event.posterName || 'Community Member'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        Posted {event.createdAt ? new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">{event.title}</h2>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 line-clamp-3 mb-6 flex-1">
                    {event.description}
                  </p>

                  <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-primary-500" />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        <span className="mx-2 text-gray-300 dark:text-gray-600">|</span> 
                        {event.startTime} {event.endTime && `- ${event.endTime}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    {event.organizer && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-emerald-500" />
                        <span className="truncate">{event.organizer}</span>
                      </div>
                    )}
                    {event.contact && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-indigo-500" />
                        <span className="truncate">{event.contact}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Meta */}
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5 mt-auto">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleLike(event._id)}
                        disabled={!user}
                        className={`group flex items-center gap-1.5 transition-colors focus:outline-none ${!user ? 'opacity-50 cursor-not-allowed' : ''} ${hasLiked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400'}`}
                      >
                        <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${hasLiked ? 'fill-current' : ''}`} />
                        <span className="font-semibold text-sm">{event.likes?.length || 0}</span>
                      </button>
                      
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-semibold text-sm">{event.comments?.length || 0}</span>
                      </div>
                    </div>

                    {canEditOrDelete && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/events/edit/${event._id}`)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Comments</h4>
                    
                    {/* Comment List */}
                    <div className="space-y-3 mb-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {(!event.comments || event.comments.length === 0) && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No comments yet. Be the first!</p>
                      )}
                      {[...(event.comments || [])].reverse().map((c, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800/80 p-3 rounded-lg text-sm">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">{c.username}</span>
                            <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 leading-snug">{c.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder={user ? "Write a comment..." : "Log in to comment"}
                        disabled={!user}
                        value={commentInputs[event._id] || ''}
                        onChange={(e) => handleCommentChange(event._id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitComment(event._id)}
                        className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white ${!user ? 'opacity-60 cursor-not-allowed' : ''}`}
                      />
                      <button 
                        onClick={() => submitComment(event._id)}
                        disabled={!user || !commentInputs[event._id]?.trim()}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full font-bold text-xs flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
