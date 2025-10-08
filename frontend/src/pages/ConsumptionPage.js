import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Zap, FileText, TrendingUp, Package } from 'lucide-react';
import { toast } from 'sonner';

const ConsumptionPage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Calculate consumption data
  const totalEnergyConsumption = stores.reduce((sum, store) => {
    const storeConsumption = store.devices?.reduce((deviceSum, device) => 
      deviceSum + (device.avg_consumption || 0), 0) || 0;
    return sum + storeConsumption;
  }, 0);

  const autoserviceBalances = stores.reduce((sum, store) => 
    sum + (store.balances_autoservicio || 0), 0);

  // Paper consumption (dummy data per balance)
  const avgPaperPerBalance = 300; // meters per day
  const totalPaperMeters = autoserviceBalances * avgPaperPerBalance;
  const totalPaperKm = (totalPaperMeters / 1000).toFixed(2);
  const rollLength = 80; // meters per roll
  const totalRolls = Math.ceil(totalPaperMeters / rollLength);

  // Top consumers
  const topConsumers = stores
    .map(store => ({
      name: store.comuna,
      energy: store.devices?.reduce((sum, d) => sum + (d.avg_consumption || 0), 0).toFixed(2) || 0,
      paper: (store.balances_autoservicio * avgPaperPerBalance)
    }))
    .sort((a, b) => b.energy - a.energy)
    .slice(0, 10);

  const consumptionByType = [
    { name: 'BMS Asistida', value: stores.reduce((sum, s) => sum + s.balances_bms, 0) * 1.5 },
    { name: 'Autoservicio', value: stores.reduce((sum, s) => sum + s.balances_autoservicio, 0) * 2.1 },
    { name: 'Balanzas IA', value: stores.reduce((sum, s) => sum + s.balances_ia, 0) * 1.8 }
  ];

  const COLORS = ['#0071CE', '#FFC220', '#1B4D89'];

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Recursos
          </h1>
          <p className="text-gray-600 mt-1">Monitoreo de energía y consumibles</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Consumo Energético Diario</p>
                <h3 className="text-3xl font-bold" style={{ color: '#0071CE' }}>
                  {totalEnergyConsumption.toFixed(2)} kWh
                </h3>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 113, 206, 0.1)' }}>
                <Zap className="w-7 h-7" style={{ color: '#0071CE' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Papel Térmico Diario</p>
                <h3 className="text-3xl font-bold" style={{ color: '#FFC220' }}>
                  {totalPaperKm} km
                </h3>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 194, 32, 0.1)' }}>
                <FileText className="w-7 h-7" style={{ color: '#FFC220' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Metros</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {totalPaperMeters.toLocaleString()} m
                </h3>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rollos Usados/Día</p>
                <h3 className="text-3xl font-bold" style={{ color: '#1B4D89' }}>
                  {totalRolls}
                </h3>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(27, 77, 137, 0.1)' }}>
                <Package className="w-7 h-7" style={{ color: '#1B4D89' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Energy Consumption by Type */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Consumo por Tipo de Balanza</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={consumptionByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)} kWh`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {consumptionByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Energy Consumers */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Top 10 Locales - Consumo Energético</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topConsumers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="energy" fill="#0071CE" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Paper Consumption by Store */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Consumo de Papel por Local</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Balanzas Autoservicio</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Metros/Día</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rollos/Día</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Consumo Energía (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {stores.slice(0, 15).map((store) => {
                  const paperMeters = store.balances_autoservicio * avgPaperPerBalance;
                  const rolls = Math.ceil(paperMeters / rollLength);
                  const energy = store.devices?.reduce((sum, d) => sum + (d.avg_consumption || 0), 0).toFixed(2) || 0;
                  
                  return (
                    <tr key={store.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-800">{store.name}</p>
                          <p className="text-sm text-gray-600">{store.comuna}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{store.balances_autoservicio}</td>
                      <td className="px-4 py-3 text-center">{paperMeters.toLocaleString()} m</td>
                      <td className="px-4 py-3 text-center">{rolls}</td>
                      <td className="px-4 py-3 text-center font-semibold" style={{ color: '#0071CE' }}>{energy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ConsumptionPage;