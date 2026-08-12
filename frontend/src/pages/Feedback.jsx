import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeedbackByTrainer } from '../api/feedbackApi';
import { MessageSquare, Star, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Feedback() {
  const { user } = useAuth();
  const trainerId = user?.id || localStorage.getItem('trainerId') || '650123456789abcdef012345';

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [trainerId]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await getFeedbackByTrainer(trainerId);
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student feedback.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating = 5) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
      />
    ));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Feedback & Reviews</h1>
          <p className="page-subtitle">View ratings, comments, and teaching evaluation submitted by students</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner w-10 h-10 border-red-600" />
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedbacks.map((item) => (
            <div key={item.id} className="card p-5 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(item.rating)}
                    <span className="text-xs font-bold text-gray-700 ml-1.5">{item.rating}/5</span>
                  </div>
                  <span className="badge-blue">{item.subject || 'General'}</span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed italic">
                  "{item.comments || 'No written comments provided.'}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 font-medium text-gray-600">
                  <User size={14} className="text-red-500" />
                  {item.studentName || 'Student'}
                </span>
                <span className="badge-gray">{item.status || 'SUBMITTED'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state py-16">
            <div className="empty-icon"><MessageSquare size={32} /></div>
            <h4 className="text-sm font-bold text-gray-700">No Student Feedback Received</h4>
            <p className="text-xs text-gray-400 max-w-sm">Feedback submitted by students for your lectures will automatically appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
