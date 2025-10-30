import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GrowthChart = ({ notes }) => {
  const chartData = useMemo(() => {
    if (!notes || notes.length === 0) return [];

    // Group notes by date
    const dateMap = new Map();
    
    notes.forEach(note => {
      const date = new Date(note.createdAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey, count: 0 });
      }
      dateMap.get(dateKey).count++;
    });

    // Sort by date
    const sortedData = Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Calculate cumulative count
    let cumulative = 0;
    return sortedData.map(item => {
      cumulative += item.count;
      return {
        date: item.date,
        dailyNotes: item.count,
        totalNotes: cumulative,
        formattedDate: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      };
    });
  }, [notes]);

  if (chartData.length === 0) {
    return null;
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="rounded-lg p-3 shadow-lg"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border-color)'
          }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {new Date(payload[0].payload.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Daily: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {payload[0].payload.dailyNotes}
            </span>
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Total: <span className="font-semibold text-primary-500">
              {payload[0].payload.totalNotes}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="rounded-xl p-6 shadow-sm"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Knowledge Growth
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Note creation over time
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
            <XAxis 
              dataKey="formattedDate" 
              stroke="var(--text-secondary)"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="totalNotes" 
              stroke="rgb(59, 130, 246)" 
              strokeWidth={3}
              dot={{ fill: 'rgb(59, 130, 246)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-4 grid grid-cols-3 gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {chartData.length}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Active Days
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {Math.max(...chartData.map(d => d.dailyNotes))}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Most in a Day
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {(chartData[chartData.length - 1]?.totalNotes / chartData.length).toFixed(1)}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Avg per Day
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrowthChart;

