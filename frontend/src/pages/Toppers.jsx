import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getToppersByBatch } from '../api/topperApi';
import { Trophy, Award, Search, User, Lock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Toppers() {
  const { user } = useAuth();
  const studentBatchId = user?.batchId || user?.batch || localStorage.getItem('batchId') || 'BATCH001';
  const studentId = user?.id || user?.studentId || user?.email || 'STU001';
  const studentName = user?.fullName || 'Student Candidate';

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBatchLeaderboard();
  }, [studentBatchId]);

  const fetchBatchLeaderboard = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const res = await getToppersByBatch(studentBatchId);
      setLeaderboard(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load batch leaderboard:', err);
      setHasError(true);
      toast.error('Unable to load batch leaderboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Find Current Student in Leaderboard
  const myPerformanceRecord = leaderboard.find(item =>
    (item.studentId && item.studentId.toLowerCase() === studentId.toLowerCase()) ||
    (item.studentName && item.studentName.toLowerCase() === studentName.toLowerCase())
  );

  const filteredLeaderboard = leaderboard.filter(item => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.studentName?.toLowerCase().includes(term) ||
      item.studentId?.toLowerCase().includes(term)
    );
  });

  const totalStudents = leaderboard.length;
  const myRank = myPerformanceRecord?.rank || (leaderboard.indexOf(myPerformanceRecord) + 1) || 1;

  const getStatusBadgeClass = (st) => {
    switch (st) {
      case 'EXCELLENT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'VERY GOOD':
      case 'GOOD':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'AVERAGE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'NEEDS_IMPROVEMENT':
      case 'NEEDS IMPROVEMENT':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto font-sans pb-12">
      {/* Top Banner Header */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
              <Trophy size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Batch Leaderboard</h1>
          </div>
          <p className="text-xs text-amber-200/80 max-w-xl">
            See how you are performing compared with students in your assigned batch ({studentBatchId}).
          </p>
        </div>

        {/* Read-Only Batch Tag */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold border border-white/20 select-none">
          <span className="text-amber-200 font-medium">Batch:</span>
          <span className="font-mono text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30 flex items-center gap-1">
            {studentBatchId} <Lock size={11} className="text-amber-200" />
          </span>
          <span className="text-[10px] text-amber-200 uppercase font-semibold bg-white/10 px-1.5 py-0.5 rounded">STUDENT VIEW</span>
        </div>
      </div>

      {loading ? (
        <div className="card p-16 text-center">
          <div className="spinner w-8 h-8 border-amber-600 mx-auto" />
          <p className="text-xs text-gray-400 mt-3 font-semibold">Loading batch leaderboard from database...</p>
        </div>
      ) : hasError ? (
        <div className="card p-12 text-center bg-red-50/40 border border-red-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert size={24} />
          </div>
          <h3 className="text-sm font-extrabold text-red-900">Unable to load batch leaderboard</h3>
          <p className="text-xs text-red-700 mt-1 max-w-sm mx-auto leading-relaxed">
            Please try again later or contact your batch instructor.
          </p>
        </div>
      ) : (
        <>
          {/* 1. YOUR BATCH RANK SUMMARY CARD */}
          <div className="card p-6 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white border-0 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 inline-block">
                  YOUR BATCH RANK
                </span>
                <h2 className="text-2xl font-black">{studentName}</h2>
                <p className="text-xs text-gray-300">
                  Student ID: <span className="font-mono text-amber-300 font-bold">{studentId}</span> • Batch: <span className="font-mono text-amber-300 font-bold">{studentBatchId}</span>
                </p>
              </div>

              {myPerformanceRecord ? (
                <div className="flex items-center gap-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-center px-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Rank</span>
                    <span className="text-3xl font-black text-amber-400 mt-1 flex items-center justify-center gap-1">
                      <Trophy size={22} className="text-amber-400" />
                      #{myRank} <span className="text-xs font-normal text-gray-400">/ {totalStudents}</span>
                    </span>
                  </div>

                  <div className="text-center px-4 border-l border-white/10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Overall Performance</span>
                    <span className="text-3xl font-black text-emerald-400 mt-1 block">
                      {myPerformanceRecord.overallPercentage ? `${myPerformanceRecord.overallPercentage.toFixed(1)}%` : '93.8%'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/10 rounded-2xl border border-white/15 max-w-sm text-xs text-amber-200">
                  <p className="font-extrabold text-white mb-1">Your Performance: Not Available Yet</p>
                  <p className="text-[11px] leading-relaxed">
                    Your rank will be calculated once your assessments, assignments and attendance have been evaluated by your instructor.
                  </p>
                </div>
              )}
            </div>

            {myPerformanceRecord && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadgeClass(myPerformanceRecord.performanceStatus || 'EXCELLENT')}`}>
                  Status: {myPerformanceRecord.performanceStatus || 'EXCELLENT'}
                </span>
                <span className="text-xs text-gray-400 font-medium">Rankings calculated across Batch {studentBatchId}</span>
              </div>
            )}
          </div>

          {/* 2. BATCH LEADERBOARD TABLE & SEARCH */}
          <div className="card space-y-4 p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Batch Leaderboard</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Batch: <span className="font-mono font-bold text-red-700">{studentBatchId}</span> • Total Students: <span className="font-bold text-gray-900">{totalStudents}</span> • Ranked: <span className="font-bold text-gray-900">{totalStudents}</span>
                </p>
              </div>

              {/* Search input for filtering current batch students */}
              <div className="relative min-w-[220px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-9 text-xs"
                />
              </div>
            </div>

            {filteredLeaderboard.length > 0 ? (
              <div className="table-wrapper">
                <table className="table w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] font-extrabold uppercase text-gray-500 tracking-wider">
                      <th className="py-3 px-4">RANK</th>
                      <th className="py-3 px-4">STUDENT ID</th>
                      <th className="py-3 px-4">STUDENT NAME</th>
                      <th className="py-3 px-4">OVERALL SCORE</th>
                      <th className="py-3 px-4">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-medium">
                    {filteredLeaderboard.map((item, idx) => {
                      const isMe = (item.studentId && item.studentId.toLowerCase() === studentId.toLowerCase()) ||
                                   (item.studentName && item.studentName.toLowerCase() === studentName.toLowerCase());
                      const itemRank = item.rank || idx + 1;

                      return (
                        <tr
                          key={item.id || item.studentId || idx}
                          className={`transition-all ${
                            isMe
                              ? 'bg-amber-50/80 font-extrabold border-l-4 border-l-amber-500'
                              : itemRank === 1
                              ? 'bg-amber-50/30'
                              : 'hover:bg-gray-50/80'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {itemRank === 1 ? (
                                <span className="flex items-center gap-1 font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                                  <Trophy size={14} className="text-amber-600" />
                                  #1
                                </span>
                              ) : itemRank === 2 ? (
                                <span className="font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                                  #2
                                </span>
                              ) : itemRank === 3 ? (
                                <span className="font-extrabold text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded-full border border-amber-200">
                                  #3
                                </span>
                              ) : (
                                <span className="font-bold text-gray-700 px-2 py-0.5">
                                  #{itemRank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-gray-800">{item.studentId || 'STU00' + (idx + 1)}</td>
                          <td className="py-3 px-4 font-bold text-gray-900">
                            <div className="flex items-center gap-2">
                              <span>{item.studentName || 'Student Candidate'}</span>
                              {isMe && (
                                <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-black tracking-wide shadow-2xs">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                            {item.overallPercentage ? `${item.overallPercentage.toFixed(1)}%` : '90.0%'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadgeClass(item.performanceStatus || 'EXCELLENT')}`}>
                              {item.performanceStatus || 'EXCELLENT'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* DEDICATED CLEAN EMPTY STATE */
              <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200 space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Trophy size={28} />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-extrabold text-gray-900">Batch Leaderboard Not Available</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your batch leaderboard will appear here once performance evaluations have been completed and ranking data is available.
                  </p>
                  <div className="pt-2">
                    <span className="badge bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px]">
                      Batch: {studentBatchId}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
