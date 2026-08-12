import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllToppers, getToppersByBatch, getTopRankers } from '../api/topperApi';
import { Trophy, Award, Medal, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Toppers() {
  const { user } = useAuth();
  const defaultBatchId = user?.batchId || localStorage.getItem('batchId') || 'BATCH001';

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, BATCH, TOP5
  const [batchId, setBatchId] = useState(defaultBatchId);
  const [toppers, setToppers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchToppers();
  }, [activeTab, batchId]);

  const fetchToppers = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'BATCH') {
        res = await getToppersByBatch(batchId);
      } else if (activeTab === 'TOP5') {
        res = await getTopRankers(5);
      } else {
        res = await getAllToppers();
      }
      setToppers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load topper rankings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Toppers & Leaderboard</h1>
          <p className="page-subtitle">View batch rankers, top performers, and merit list</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ALL' ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Toppers
          </button>
          <button
            onClick={() => setActiveTab('BATCH')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'BATCH' ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Batch Rankers
          </button>
          <button
            onClick={() => setActiveTab('TOP5')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TOP5' ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Top 5 Overall
          </button>
        </div>

        {activeTab === 'BATCH' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Batch ID:</span>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="Batch ID..."
              className="form-input text-xs font-mono font-bold text-red-700 bg-red-50/50 border-red-200 w-36"
            />
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Batch</th>
                <th>Overall Score</th>
                <th>Performance Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="spinner w-8 h-8 border-red-600 mx-auto" />
                  </td>
                </tr>
              ) : toppers.length > 0 ? (
                toppers.map((item, idx) => {
                  const rankNum = item.rank || idx + 1;
                  return (
                    <tr key={idx} className={rankNum <= 3 ? 'bg-amber-50/30' : ''}>
                      <td>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shadow-sm ${
                          rankNum === 1 ? 'bg-amber-400 text-amber-950 border border-amber-500' :
                          rankNum === 2 ? 'bg-slate-300 text-slate-900 border border-slate-400' :
                          rankNum === 3 ? 'bg-amber-700 text-amber-100' : 'bg-gray-100 text-gray-700'
                        }`}>
                          #{rankNum}
                        </div>
                      </td>
                      <td className="font-mono text-xs font-bold text-gray-700">{item.studentId}</td>
                      <td className="font-bold text-gray-900">{item.studentName || 'Student'}</td>
                      <td><span className="badge-purple">{item.batchId || 'BATCH'}</span></td>
                      <td className="font-extrabold text-red-600">
                        {item.overallPercentage ? `${item.overallPercentage.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td>
                        <span className="badge-green">
                          {item.performanceStatus || 'EXCELLENT'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-icon"><Trophy size={32} /></div>
                      <h4 className="text-sm font-bold text-gray-700">No Leaderboard Data Available</h4>
                      <p className="text-xs text-gray-400 max-w-sm">No rankers calculated yet. Perform student evaluations to populate rankings.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
