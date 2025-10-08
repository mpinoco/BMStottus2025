import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, TrendingUp, TrendingDown, Minus, Calendar, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EnhancedBarChart = ({ data, title, stores }) => {
  const navigate = useNavigate();
  const [selectedInterval, setSelectedInterval] = useState('7days');
  const [topCount, setTopCount] = useState(10);
  const [filterType, setFilterType] = useState('all');
  const [filterComuna, setFilterComuna] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const intervals = [
    { value: '7days', label: 'Últimos 7 días' },
    { value: '30days', label: 'Último mes' },
    { value: '90days', label: 'Último trimestre' }
  ];

  const topOptions = [5, 10, 20];
  
  const balanceTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'AUTOSERVICIO', label: 'Autoservicio' },
    { value: 'BMS_ASISTIDA', label: 'Asistida' },
    { value: 'IA', label: 'IA' }
  ];

  // Get unique comunas
  const comunas = ['all', ...new Set(stores.map(s => s.comuna))];

  // Generate trend data
  const dataWithTrends = data.slice(0, topCount).map((item, idx) => ({
    ...item,
    rank: idx + 1,
    trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
    trendValue: (Math.random() * 20 - 5).toFixed(1) // -5% to +15%
  }));

  // Color gradient based on value
  const getBarColor = (value, maxValue) => {
    const intensity = value / maxValue;
    if (intensity > 0.8) return '#0071CE';
    if (intensity > 0.6) return '#3B9AE1';
    if (intensity > 0.4) return '#66B3E8';
    if (intensity > 0.2) return '#99CCEF';
    return '#CCE5F6';
  };

  const maxValue = Math.max(...dataWithTrends.map(d => d.kg));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">#{data.rank} {data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{data.kg.toLocaleString()}</span> kg/día
          </p>
          <div className="flex items-center gap-2 mt-2">
            {data.trend === 'up' && <TrendingUp size={14} className="text-green-600" />}
            {data.trend === 'down' && <TrendingDown size={14} className="text-red-600" />}
            {data.trend === 'stable' && <Minus size={14} className="text-gray-600" />}
            <span className="text-xs" style={{ 
              color: data.trend === 'up' ? '#10b981' : data.trend === 'down' ? '#ef4444' : '#6b7280'
            }}>
              {data.trend === 'up' ? '+' : ''}{data.trendValue}% vs semana anterior
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data) => {
    const store = stores.find(s => s.comuna === data.name);
    if (store) {
      navigate(`/store/${store.id}`);
    }
  };

  const handleExport = (format) => {
    console.log(`Exporting to ${format}`);
  };

  // Interpretation
  const topStore = dataWithTrends[0];
  const avgProduction = (dataWithTrends.reduce((sum, item) => sum + item.kg, 0) / dataWithTrends.length).toFixed(0);

  return (
    <Card className="p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">Click en una barra para ver detalles del local</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {intervals.map(interval => (
            <Button
              key={interval.value}
              size="sm"
              variant={selectedInterval === interval.value ? 'default' : 'outline'}
              onClick={() => setSelectedInterval(interval.value)}
              style={selectedInterval === interval.value ? { backgroundColor: '#0071CE', color: 'white' } : {}}
            >
              <Calendar size={14} className="mr-1" />
              {interval.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full justify-between"
        >
          <span className="text-sm font-medium">Filtros</span>
          <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
        
        {showFilters && (
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Mostrar Top</label>
              <div className="flex gap-2">
                {topOptions.map(option => (
                  <Button
                    key={option}
                    size="sm"
                    variant={topCount === option ? 'default' : 'outline'}
                    onClick={() => setTopCount(option)}
                    style={topCount === option ? { backgroundColor: '#FFC220', color: '#000' } : {}}
                    className="flex-1"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Tipo de Balanza</label>
              <select
                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {balanceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Comuna</label>
              <select
                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                value={filterComuna}
                onChange={(e) => setFilterComuna(e.target.value)}
              >
                <option value="all">Todas</option>
                {comunas.filter(c => c !== 'all').map(comuna => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={topCount === 20 ? 500 : topCount === 10 ? 350 : 220}>
        <BarChart data={dataWithTrends} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" label={{ value: 'Kg/día', position: 'insideBottom', offset: -5 }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={120}
            tickFormatter={(value, index) => `#${dataWithTrends[index]?.rank} ${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="kg" 
            radius={[0, 8, 8, 0]}
            onClick={handleBarClick}
            cursor="pointer"
          >
            {dataWithTrends.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.kg, maxValue)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legends for trends */}
      <div className="mt-4 flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <TrendingUp size={14} className="text-green-600" />
          <span>Tendencia al alza</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown size={14} className="text-red-600" />
          <span>Tendencia a la baja</span>
        </div>
        <div className="flex items-center gap-1">
          <Minus size={14} className="text-gray-600" />
          <span>Estable</span>
        </div>
      </div>

      {/* Export and Interpretation */}
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <p className="text-sm text-gray-600 italic">
          📊 <strong>{topStore?.name}</strong> lidera la producción con{' '}
          <strong>{(topStore?.kg / 1000).toFixed(1)} toneladas</strong> diarias.
          Promedio general: <strong>{(avgProduction / 1000).toFixed(1)}t/día</strong>
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

export default EnhancedBarChart;
