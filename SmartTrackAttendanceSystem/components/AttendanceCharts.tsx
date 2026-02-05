
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { AttendanceRecord } from '../types';

interface ChartsProps {
  data: AttendanceRecord[];
  type: 'TEACHER' | 'STUDENT';
}

export const AttendanceCharts: React.FC<ChartsProps> = ({ data, type }) => {
  if (type === 'TEACHER') {
    // Process data for teacher: daily counts
    const dailyData = data.reduce((acc: any[], curr) => {
      const date = curr.date;
      const existing = acc.find(a => a.name === date);
      if (existing) {
        if (curr.status === 'PRESENT') existing.present += 1;
        else existing.absent += 1;
      } else {
        acc.push({ 
          name: date, 
          present: curr.status === 'PRESENT' ? 1 : 0, 
          absent: curr.status === 'ABSENT' ? 1 : 0 
        });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Legend />
            <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } else {
    // Process data for student: distribution pie chart
    const presentCount = data.filter(d => d.status === 'PRESENT').length;
    const absentCount = data.filter(d => d.status === 'ABSENT').length;
    const pieData = [
      { name: 'Present', value: presentCount },
      { name: 'Absent', value: absentCount },
    ];
    const COLORS = ['#10b981', '#ef4444'];

    return (
      <div className="h-64 w-full flex flex-col items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 font-medium">Overall Presence Ratio</p>
      </div>
    );
  }
};
