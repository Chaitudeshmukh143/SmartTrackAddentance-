
import React, { useState, useMemo } from 'react';
import { Classroom, AttendanceRecord } from '../types';
import { api } from '../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download, CheckCircle, XCircle, TrendingUp, Save, Loader2, History, Filter } from 'lucide-react';

interface AttendanceTabProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ classroom, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'mark' | 'history'>('mark');
  const [isSaving, setIsSaving] = useState(false);

  // States for report selection
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const range = [];
    for (let i = currentYear; i >= currentYear - 2; i--) {
      range.push(i);
    }
    return range;
  }, []);

  const getStatus = (studentId: string, date: string) => {
    return classroom.attendance.find(a => a.studentId === studentId && a.date === date)?.status || 'absent';
  };

  const toggleAttendance = (studentId: string) => {
    const currentStatus = getStatus(studentId, selectedDate);
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    
    const existingIndex = classroom.attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
    const newAttendance = [...classroom.attendance];

    if (existingIndex > -1) {
      newAttendance[existingIndex] = { ...newAttendance[existingIndex], status: newStatus };
    } else {
      newAttendance.push({ studentId, date: selectedDate, status: newStatus });
    }

    onUpdate({ ...classroom, attendance: newAttendance });
  };

  const handleSaveToBackend = async () => {
    try {
      setIsSaving(true);
      await api.saveAttendance(classroom.id, classroom.attendance);
      alert('Attendance synced with Java server!');
    } catch (err) {
      console.warn("Backend not available, changes kept in memory.");
    } finally {
      setIsSaving(false);
    }
  };

  const markAll = (status: 'present' | 'absent') => {
    const newAttendance = [...classroom.attendance];
    classroom.students.forEach(student => {
      const idx = newAttendance.findIndex(a => a.studentId === student.id && a.date === selectedDate);
      if (idx > -1) {
        newAttendance[idx] = { ...newAttendance[idx], status };
      } else {
        newAttendance.push({ studentId: student.id, date: selectedDate, status });
      }
    });
    onUpdate({ ...classroom, attendance: newAttendance });
  };

  const chartData = useMemo(() => {
    const stats: Record<string, { present: number; absent: number }> = {};
    classroom.attendance.forEach(record => {
      const day = record.date;
      if (!stats[day]) stats[day] = { present: 0, absent: 0 };
      if (record.status === 'present') stats[day].present++;
      else stats[day].absent++;
    });

    return Object.entries(stats).map(([date, counts]) => ({
      date: date.split('-').slice(2).join('/'),
      present: counts.present,
      absent: counts.absent,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [classroom.attendance]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const monthLabel = months.find(m => m.value === reportMonth)?.label;
    
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text(`Monthly Report: ${monthLabel} ${reportYear}`, 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Class: ${classroom.name} | Subject: ${classroom.subject}`, 14, 30);
    doc.text(`Exported On: ${new Date().toLocaleDateString()}`, 14, 36);

    // Filter attendance for the selected month/year
    const filteredAttendance = classroom.attendance.filter(a => {
      const [y, m] = a.date.split('-');
      return parseInt(y) === reportYear && parseInt(m) === reportMonth;
    });

    const uniqueDatesInMonth = Array.from(new Set(filteredAttendance.map(a => a.date))).length;

    const tableRows = classroom.students.map(student => {
      const records = filteredAttendance.filter(a => a.studentId === student.id);
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = uniqueDatesInMonth - presentCount;
      const percentage = uniqueDatesInMonth > 0 ? ((presentCount / uniqueDatesInMonth) * 100).toFixed(1) : '0';
      
      return [student.name, presentCount, absentCount, `${percentage}%` ];
    });

    autoTable(doc, {
      startY: 45,
      head: [['Student Name', 'Present Days', 'Absent Days', 'Attendance %']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(`Generated by EduAttend Pro - Page ${data.pageNumber}`, 14, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`Attendance_${classroom.name}_${monthLabel}_${reportYear}.pdf`);
  };

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-white">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex p-1 bg-gray-100 rounded-2xl w-full xl:w-auto">
          <button 
            onClick={() => setViewMode('mark')}
            className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'mark' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Marking Sheet
          </button>
          <button 
            onClick={() => setViewMode('history')}
            className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Analytics & Reports
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={16} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm text-gray-700 w-44"
            />
          </div>
          <button 
            onClick={handleSaveToBackend}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Sync Cloud
          </button>
        </div>
      </div>

      {viewMode === 'mark' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Registration Sheet</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Status for {new Date(selectedDate).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => markAll('present')} className="text-xs font-black text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">PRESENT ALL</button>
              <button onClick={() => markAll('absent')} className="text-xs font-black text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">ABSENT ALL</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {classroom.students.map(student => {
              const status = getStatus(student.id, selectedDate);
              const isPresent = status === 'present';
              
              return (
                <div 
                  key={student.id}
                  onClick={() => toggleAttendance(student.id)}
                  className={`
                    p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group
                    ${isPresent ? 'bg-indigo-50 border-indigo-200 ring-4 ring-indigo-50' : 'bg-white border-gray-100 hover:border-gray-200'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <img src={student.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{student.name}</p>
                      <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">{student.id}</p>
                    </div>
                  </div>
                  <div className={`
                    w-10 h-10 rounded-2xl flex items-center justify-center transition-all
                    ${isPresent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-50 text-gray-200'}
                  `}>
                    <CheckCircle size={22} />
                  </div>
                </div>
              );
            })}
            {classroom.students.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                  <Calendar size={32} />
                </div>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No students found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Report Generation Tool */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl shadow-sm">
                  <Download size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Download Reports</h3>
                  <p className="text-sm text-gray-400 font-medium">Generate current or previous monthly PDF records.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex gap-2 flex-1 md:flex-none">
                  <select 
                    value={reportMonth} 
                    onChange={e => setReportMonth(parseInt(e.target.value))}
                    className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select 
                    value={reportYear} 
                    onChange={e => setReportYear(parseInt(e.target.value))}
                    className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button 
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 flex-1 md:flex-none"
                >
                  <Download size={18} />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-[2rem] border border-indigo-100 shadow-sm">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-indigo-900">
              <TrendingUp size={24} />
              Recent Participation Trends
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="present" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} name="Students Present" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Student Summary (All Time)</h4>
              <History size={16} className="text-gray-400" />
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-6">Student Info</th>
                  <th className="px-8 py-6 text-center">Current Status</th>
                  <th className="px-8 py-6 text-right">Lifetime Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {classroom.students.map(student => {
                  const status = getStatus(student.id, selectedDate);
                  const records = classroom.attendance.filter(a => a.studentId === student.id);
                  const presentCount = records.filter(r => r.status === 'present').length;
                  const totalDays = Array.from(new Set(classroom.attendance.map(a => a.date))).length;
                  const percent = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={student.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform" />
                          <div>
                            <span className="block font-bold text-gray-900">{student.name}</span>
                            <span className="block text-[10px] text-gray-400 font-bold">{student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4 justify-end">
                          <span className="text-xs font-black text-gray-900">{percent}%</span>
                          <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                            <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
