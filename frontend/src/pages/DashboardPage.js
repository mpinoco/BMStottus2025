import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Scale, AlertCircle, CheckCircle2, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DonutChart from '@/components/DonutChart';
import EnhancedBarChart from '@/components/EnhancedBarChart';
import AIAssistant from '@/components/AIAssistant';

const DashboardPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [weightData, setWeightData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storesRes, metricsRes, weightRes, alertsRes] = await Promise.all([
        axios.get(`${API}/stores`),
        axios.get(`${API}/metrics`),
        axios.get(`${API}/weight-data`),
        axios.get(`${API}/alerts`)
      ]);
      
      setStores(storesRes.data);
      setMetrics(metricsRes.data);
      setWeightData(weightRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.comuna.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.sap_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || store.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Prepare chart data
  const statusData = metrics ? [
    { name: 'En línea', value: metrics.stores_online, color: '#10b981' },
    { name: 'Parcial', value: metrics.stores_partial, color: '#f59e0b' },
    { name: 'Offline', value: metrics.stores_offline, color: '#ef4444' }
  ] : [];

  // Top 10 stores by weight (production)
  const topStoresProduction = stores
    .map(s => ({ 
      name: s.comuna, 
      kg: Math.floor(Math.random() * 5000) + 2000 // Simulated daily weight
    }))
    .sort((a, b) => b.kg - a.kg)
    .slice(0, 10);

  // Top 5 most and least weighed products
  const topProducts = [
    { name: 'Tomate', kg: 2847, trend: '+12%' },
    { name: 'Plátano', kg: 2631, trend: '+8%' },
    { name: 'Palta', kg: 2419, trend: '+15%' },
    { name: 'Manzana', kg: 2186, trend: '+5%' },
    { name: 'Naranja', kg: 1954, trend: '+3%' }
  ];

  const leastProducts = [
    { name: 'Kiwi', kg: 124, trend: '-2%' },
    { name: 'Ciruela', kg: 156, trend: '-5%' },
    { name: 'Durazno', kg: 189, trend: '+1%' },
    { name: 'Frutilla', kg: 203, trend: '-3%' },
    { name: 'Limón', kg: 247, trend: '+2%' }
  ];

  // Top 5 non-weighable products detected (fraud attempts)
  const fraudAttempts = [
    { name: 'Botella Coca-Cola', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=100', detections: 23 },
    { name: 'Paquete Galletas', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100', detections: 19 },
    { name: 'Caja Cereal', image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=100', detections: 15 },
    { name: 'Lata Atún', image: 'https://images.unsplash.com/photo-1520961174526-c20f36e40f56?w=100', detections: 12 },
    { name: 'Bolsa Papas Chips', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=100', detections: 9 }
  ];

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Panel de Control</h1>
            <p className="text-gray-600 mt-1">Vista general del sistema de balanzas</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kilos Pesados Hoy</p>
                <h3 className="text-3xl font-bold" style={{ color: '#79b9e7' }}>
                  {metrics?.total_kg_today.toLocaleString()}
                </h3>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(121, 185, 231, 0.1)' }}>
                <Scale className="w-7 h-7" style={{ color: '#79b9e7' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balanzas Activas</p>
                <h3 className="text-3xl font-bold text-green-600">{metrics?.active_balances}</h3>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">% Calibradas</p>
                <h3 className="text-3xl font-bold" style={{ color: '#f47421' }}>
                  {metrics?.calibration_percentage}%
                </h3>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(244, 116, 33, 0.1)' }}>
                <CheckCircle2 className="w-7 h-7" style={{ color: '#f47421' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Actualizaciones Pendientes</p>
                <h3 className="text-3xl font-bold text-amber-600">{metrics?.pending_updates}</h3>
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* AI Assistant */}
        <AIAssistant variant="dashboard" />

        {/* Enhanced Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Donut Chart */}
          <DonutChart 
            data={statusData}
            title="Estado de Locales"
            totalStores={stores.length}
          />

          {/* Enhanced Bar Chart */}
          <EnhancedBarChart 
            data={topStoresProduction}
            title="Top 10 Locales con Mayor Producción"
            stores={stores}
          />
        </div>

        {/* New Sections Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 5 Most Weighed Products */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top 5 Productos Más Pesados
            </h3>
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-600">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.kg.toLocaleString()} kg/día</p>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: '#10b981', color: 'white' }}>{product.trend}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Top 5 Least Weighed Products */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600" />
              Top 5 Productos Menos Pesados
            </h3>
            <div className="space-y-3">
              {leastProducts.map((product, idx) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-amber-600">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.kg} kg/día</p>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: product.trend.startsWith('+') ? '#10b981' : '#f59e0b', color: 'white' }}>{product.trend}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Top 5 Fraud Attempts */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Detecciones IA - No Pesables
            </h3>
            <div className="space-y-3">
              {fraudAttempts.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.detections} detecciones</p>
                  </div>
                  <Badge style={{ backgroundColor: '#ef4444', color: 'white' }}>⚠️</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Weight Trends */}
        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Peso Promedio Semanal - Productos Clave</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍅</span>
                <span className="text-sm text-gray-600">Tomate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥑</span>
                <span className="text-sm text-gray-600">Palta</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍌</span>
                <span className="text-sm text-gray-600">Plátano</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" data={weightData[0]?.dates.map((d, i) => ({ date: d }))} />
              <YAxis label={{ value: 'Kg', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {weightData.map((product, idx) => (
                <Line 
                  key={product.product}
                  data={product.weights.map((w, i) => ({ date: product.dates[i], value: w }))}
                  type="monotone" 
                  dataKey="value" 
                  name={product.product}
                  stroke={['#10b981', '#f59e0b', '#0071CE'][idx]}
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Alerts Panel */}
        {alerts.length > 0 && (
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Alertas y Notificaciones Técnicas
            </h3>
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => {
                const getPriorityColor = (priority) => {
                  switch(priority) {
                    case 'high': return { bg: 'bg-red-50', border: 'border-red-300', badge: '#ef4444', icon: 'text-red-600' };
                    case 'medium': return { bg: 'bg-amber-50', border: 'border-amber-300', badge: '#f59e0b', icon: 'text-amber-600' };
                    default: return { bg: 'bg-blue-50', border: 'border-blue-300', badge: '#0071CE', icon: 'text-blue-600' };
                  }
                };
                const colors = getPriorityColor(alert.priority);
                return (
                  <div key={alert.id} className={`flex items-center justify-between p-4 ${colors.bg} border ${colors.border} rounded-lg hover:shadow-md transition-shadow`}>
                    <div className="flex items-center gap-3">
                      <AlertCircle className={`w-5 h-5 ${colors.icon} pulse`} />
                      <div>
                        <p className="font-semibold text-gray-800">{alert.store_name}</p>
                        <p className="text-sm text-gray-700">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.type === 'calibration' ? '⚙️ Calibración' : alert.type === 'maintenance' ? '🔧 Mantenimiento' : '📡 Firmware'}</p>
                      </div>
                    </div>
                    <Badge 
                      style={{ backgroundColor: colors.badge, color: 'white' }}
                    >
                      {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Stores Table */}
        <Card className="p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Locales ({filteredStores.length})</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Buscar local, comuna o código SAP..."
                  className="pl-10 w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 border rounded-lg"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="online">En línea</option>
                <option value="partial">Parcial</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código SAP</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">BMS Asistida</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Autoservicio</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Balanzas IA</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((store, idx) => (
                  <tr key={store.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-800">{store.name}</p>
                        <p className="text-sm text-gray-600">{store.comuna}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{store.sap_code}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">{store.balances_bms}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">{store.balances_autoservicio}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge style={{ backgroundColor: '#79b9e7', color: 'white' }}>{store.balances_ia}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full status-${store.status}`} />
                        <span className="text-sm capitalize">{store.status === 'online' ? 'En línea' : store.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button 
                        size="sm" 
                        className="hover:shadow-lg hover:scale-105 transition-all duration-200"
                        style={{ backgroundColor: '#0071CE', color: 'white' }}
                        onClick={() => navigate(`/store/${store.id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;