import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, Calendar } from 'lucide-react';

const DonutChart = ({ data, title, totalStores }) => {
  const [displayMode, setDisplayMode] = useState('absolute'); // 'absolute' or 'percentage'
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [hiddenCategories, setHiddenCategories] = useState([]);

  const periods = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' }
  ];

  const toggleCategory = (name) => {
    setHiddenCategories(prev => 
      prev.includes(name) 
        ? prev.filter(cat => cat !== name)
        : [...prev, name]
    );
  };

  const visibleData = data.filter(item => !hiddenCategories.includes(item.name));
  const total = visibleData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalStores) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} locales ({percentage}%)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.name === 'En línea' && 'Operación normal'}
            {data.name === 'Parcial' && 'Algunos equipos offline'}
            {data.name === 'Offline' && 'Sin conexión'}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleExport = (format) => {
    // Implementation for export
    console.log(`Exporting to ${format}`);
  };

  // Calculate interpretation
  const onlinePercentage = ((data.find(d => d.name === 'En línea')?.value || 0) / totalStores * 100).toFixed(0);
  const partialPercentage = ((data.find(d => d.name === 'Parcial')?.value || 0) / totalStores * 100).toFixed(0);
  
  return (
    <Card className="p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <div className="flex gap-2">
          {periods.map(period => (
            <Button
              key={period.value}
              size="sm"
              variant={selectedPeriod === period.value ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod(period.value)}
              style={selectedPeriod === period.value ? { backgroundColor: '#0071CE', color: 'white' } : {}}
            >
              <Calendar size={14} className="mr-1" />
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Donut Chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={visibleData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
              >
                {visibleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {/* Center label */}
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold"
                fill="#1f2937"
              >
                {total}
              </text>
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm"
                fill="#6b7280"
              >
                Locales
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Legend */}
        <div className="w-48 space-y-3">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-gray-700">Leyenda</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDisplayMode(displayMode === 'absolute' ? 'percentage' : 'absolute')}
              className="text-xs px-2 py-1"
            >
              {displayMode === 'absolute' ? '%' : '#'}
            </Button>
          </div>
          
          {data.map((item) => {
            const isHidden = hiddenCategories.includes(item.name);
            const percentage = ((item.value / totalStores) * 100).toFixed(1);
            
            return (
              <div
                key={item.name}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  isHidden ? 'opacity-40' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleCategory(item.name)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {displayMode === 'absolute' ? item.value : `${percentage}%`}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export and Interpretation */}
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <p className="text-sm text-gray-600 italic">
          {parseInt(onlinePercentage) > 70 
            ? `✓ Excelente: ${onlinePercentage}% de los locales en línea`
            : parseInt(partialPercentage) > 50
            ? `⚠ Atención: ${partialPercentage}% de los locales en estado parcial`
            : `❌ Crítico: Revisar conectividad de los locales`
          }
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExport('pdf')}>
            <FileDown size={14} className="mr-1" />
            PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport('excel')}>
            <FileDown size={14} className="mr-1" />
            Excel
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DonutChart;
