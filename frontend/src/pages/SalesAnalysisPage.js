import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Weight, Target, Trophy, BarChart3, Apple } from 'lucide-react';
import { toast } from 'sonner';

const SalesAnalysisPage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [avocadoData, setAvocadoData] = useState({});
  const [loading, setLoading] = useState(true);

  // Precio de palta por kilo
  const AVOCADO_PRICE_PER_KG = 5500;

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
      
      // Generate comprehensive sales data for each store
      const sales = {};
      const avocados = {};
      
      response.data.forEach(store => {
        const devices = store.devices || [];
        
        // Generate realistic sales data
        const dailyTransactions = devices.length * Math.random() * 50 + 100; // 100-150 transactions per device per day
        const avgTicketValue = Math.random() * 3000 + 2000; // $2000-$5000 CLP average ticket
        const monthlyRevenue = dailyTransactions * 30 * avgTicketValue;
        
        // Weight analysis
        const avgWeightPerTransaction = Math.random() * 0.8 + 0.2; // 0.2-1.0 kg per transaction
        const monthlyWeight = dailyTransactions * 30 * avgWeightPerTransaction;
        
        // Product mix analysis
        const fruitsVegetablesRatio = Math.random() * 0.4 + 0.6; // 60-100% fruits and vegetables
        const revenuePerKg = monthlyRevenue / monthlyWeight;
        
        // Fraud indicators
        const suspiciousTransactions = Math.floor(dailyTransactions * 0.02 * Math.random()); // 0-2% suspicious
        const fraudLossEstimate = suspiciousTransactions * 30 * 500; // Estimated loss per fraud
        
        sales[store.id] = {
          dailyTransactions: Math.floor(dailyTransactions),
          monthlyRevenue: Math.floor(monthlyRevenue),
          monthlyWeight: Math.floor(monthlyWeight),
          avgTicketValue: Math.floor(avgTicketValue),
          revenuePerKg: Math.floor(revenuePerKg),
          fruitsVegetablesRatio,
          suspiciousTransactions,
          fraudLossEstimate,
          devices: devices.length,
          revenuePerDevice: Math.floor(monthlyRevenue / devices.length),
          efficiencyScore: Math.floor((monthlyRevenue / (devices.length * 1000000)) * 100) // Revenue efficiency score
        };

        // Avocado specific data
        const avocadoPercentage = Math.random() * 0.15 + 0.05; // 5-20% of transactions are avocados
        const avocadoTransactions = dailyTransactions * avocadoPercentage;
        const avgAvocadoWeight = Math.random() * 0.3 + 0.2; // 0.2-0.5 kg per avocado transaction
        const monthlyAvocadoWeight = avocadoTransactions * 30 * avgAvocadoWeight;
        const monthlyAvocadoRevenue = monthlyAvocadoWeight * AVOCADO_PRICE_PER_KG;
        
        // Split between IA and autoservice
        const iaRatio = Math.random() * 0.6 + 0.2; // 20-80% IA vs autoservice
        const iaAvocadoWeight = monthlyAvocadoWeight * iaRatio;
        const autoserviceAvocadoWeight = monthlyAvocadoWeight * (1 - iaRatio);
        
        avocados[store.id] = {
          monthlyWeight: Math.floor(monthlyAvocadoWeight),
          monthlyRevenue: Math.floor(monthlyAvocadoRevenue),
          iaWeight: Math.floor(iaAvocadoWeight),
          iaRevenue: Math.floor(iaAvocadoWeight * AVOCADO_PRICE_PER_KG),
          autoserviceWeight: Math.floor(autoserviceAvocadoWeight),
          autoserviceRevenue: Math.floor(autoserviceAvocadoWeight * AVOCADO_PRICE_PER_KG),
          transactionsPerDay: Math.floor(avocadoTransactions),
          percentageOfTotal: (avocadoPercentage * 100).toFixed(1)
        };
      });
      
      setSalesData(sales);
      setAvocadoData(avocados);
    } catch (error) {
      console.error('Error loading sales data:', error);
      toast.error('Error al cargar datos de ventas');
    } finally {
      setLoading(false);
    }
  };

  const getOverallMetrics = () => {
    const totalRevenue = Object.values(salesData).reduce((sum, data) => sum + data.monthlyRevenue, 0);
    const totalWeight = Object.values(salesData).reduce((sum, data) => sum + data.monthlyWeight, 0);
    const totalTransactions = Object.values(salesData).reduce((sum, data) => sum + (data.dailyTransactions * 30), 0);
    const totalDevices = Object.values(salesData).reduce((sum, data) => sum + data.devices, 0);
    const totalAvocadoRevenue = Object.values(avocadoData).reduce((sum, data) => sum + data.monthlyRevenue, 0);
    const totalAvocadoWeight = Object.values(avocadoData).reduce((sum, data) => sum + data.monthlyWeight, 0);
    
    return {
      totalRevenue: totalRevenue.toLocaleString('es-CL'),
      totalWeight: totalWeight.toLocaleString('es-CL'),
      totalTransactions: totalTransactions.toLocaleString('es-CL'),
      avgRevenuePerDevice: Math.floor(totalRevenue / totalDevices).toLocaleString('es-CL'),
      avgRevenuePerKg: Math.floor(totalRevenue / totalWeight).toLocaleString('es-CL'),
      totalAvocadoRevenue: totalAvocadoRevenue.toLocaleString('es-CL'),
      totalAvocadoWeight: totalAvocadoWeight.toLocaleString('es-CL')
    };
  };

  const getTop3Stores = () => {
    return stores
      .sort((a, b) => (salesData[b.id]?.monthlyRevenue || 0) - (salesData[a.id]?.monthlyRevenue || 0))
      .slice(0, 3);
  };

  const getTop3Devices = () => {
    const deviceList = [];
    stores.forEach(store => {
      const storeData = salesData[store.id];
      if (storeData) {
        store.devices.forEach((device, index) => {
          const deviceRevenue = Math.floor(storeData.monthlyRevenue / storeData.devices * (0.8 + Math.random() * 0.4));
          deviceList.push({
            storeName: store.name,
            comuna: store.comuna,
            deviceId: device.id.substring(0, 8),
            deviceType: device.type,
            revenue: deviceRevenue
          });
        });
      }
    });
    
    return deviceList
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  };

  const getTopAvocadoStores = () => {
    return stores
      .sort((a, b) => (avocadoData[b.id]?.monthlyWeight || 0) - (avocadoData[a.id]?.monthlyWeight || 0))
      .slice(0, 5);
  };

  const metrics = Object.keys(salesData).length > 0 ? getOverallMetrics() : {};
  const top3Stores = Object.keys(salesData).length > 0 ? getTop3Stores() : [];
  const top3Devices = Object.keys(salesData).length > 0 ? getTop3Devices() : [];
  const topAvocadoStores = Object.keys(avocadoData).length > 0 ? getTopAvocadoStores() : [];

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              Análisis de Ventas & Ingresos
            </h1>
            <p className="text-gray-600 mt-1">Análisis profundo de pesos vs etiquetas vs valores monetarios</p>
          </div>
          <Badge className="bg-green-100 text-green-800 px-4 py-2">
            Sistema de Análisis Activo
          </Badge>
        </div>

        {/* Overall Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales Mensuales</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue}</p>
                <p className="text-xs text-green-600">CLP</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peso Total Mensual</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalWeight} kg</p>
                <p className="text-xs text-blue-600">Productos pesados</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Weight className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos por Balanza</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.avgRevenuePerDevice}</p>
                <p className="text-xs text-orange-600">CLP promedio/mes</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor por Kilogramo</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.avgRevenuePerKg}</p>
                <p className="text-xs text-purple-600">CLP promedio/kg</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Avocado Specific Metrics */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-lime-50 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              🥑
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Análisis Especial: Paltas</h3>
              <p className="text-sm text-gray-600">Precio: ${AVOCADO_PRICE_PER_KG.toLocaleString('es-CL')} CLP/kg</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Ingresos Totales Paltas</p>
              <p className="text-2xl font-bold text-green-600">${metrics.totalAvocadoRevenue}</p>
              <p className="text-xs text-gray-500">CLP/mes</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Peso Total Paltas</p>
              <p className="text-2xl font-bold text-green-600">{metrics.totalAvocadoWeight} kg</p>
              <p className="text-xs text-gray-500">Mensuales</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">% del Total de Ventas</p>
              <p className="text-2xl font-bold text-green-600">
                {Object.keys(salesData).length > 0 
                  ? ((Object.values(avocadoData).reduce((sum, data) => sum + data.monthlyRevenue, 0) / 
                      Object.values(salesData).reduce((sum, data) => sum + data.monthlyRevenue, 0)) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500">De ingresos</p>
            </div>
          </div>
        </Card>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Stores by Revenue */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-600" style={{ color: '#FFD700' }} />
              Top 3 Locales (Ingresos)
            </h3>
            <div className="space-y-3">
              {top3Stores.map((store, index) => {
                const data = salesData[store.id];
                const colors = ['bg-yellow-100 text-yellow-800', 'bg-gray-100 text-gray-800', 'bg-orange-100 text-orange-800'];
                return (
                  <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${colors[index]} flex items-center justify-center font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{store.name}</p>
                        <p className="text-sm text-gray-600">{store.comuna}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${data?.monthlyRevenue.toLocaleString('es-CL')}</p>
                      <p className="text-xs text-gray-600">{data?.devices} balanzas</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top 3 Individual Devices */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Top 3 Balanzas (Ingresos)
            </h3>
            <div className="space-y-3">
              {top3Devices.map((device, index) => {
                const colors = ['bg-blue-100 text-blue-800', 'bg-indigo-100 text-indigo-800', 'bg-purple-100 text-purple-800'];
                return (
                  <div key={`${device.storeName}-${device.deviceId}`} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full ${colors[index]} flex items-center justify-center font-bold text-xs`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{device.storeName}</p>
                          <p className="text-xs text-gray-600">ID: {device.deviceId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">${device.revenue.toLocaleString('es-CL')}</p>
                        <Badge className="text-xs bg-gray-200 text-gray-700">{device.deviceType}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top Avocado Stores */}
          <Card className="p-6 bg-green-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🥑
              Top 5 Locales (Paltas)
            </h3>
            <div className="space-y-3">
              {topAvocadoStores.map((store, index) => {
                const data = avocadoData[store.id];
                return (
                  <div key={store.id} className="p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{store.name}</p>
                          <p className="text-xs text-gray-600">{store.comuna}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-600">{data?.monthlyWeight} kg</p>
                        <p className="text-xs text-gray-600">${data?.monthlyRevenue.toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-blue-600">IA: {data?.iaWeight} kg</span>
                      <span className="text-orange-600">Autoservicio: {data?.autoserviceWeight} kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Detailed Sales Analysis Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Análisis Detallado de Ventas por Local</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Local</th>
                  <th className="text-left p-3">Ingresos/Mes</th>
                  <th className="text-left p-3">Peso/Mes (kg)</th>
                  <th className="text-left p-3">Transacciones/Día</th>
                  <th className="text-left p-3">$/kg Promedio</th>
                  <th className="text-left p-3">$/Balanza</th>
                  <th className="text-left p-3">Eficiencia</th>
                  <th className="text-left p-3">Paltas</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => {
                  const data = salesData[store.id];
                  const avocado = avocadoData[store.id];
                  return (
                    <tr key={store.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-xs text-gray-600">{store.comuna}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-green-600">
                          ${data?.monthlyRevenue.toLocaleString('es-CL')}
                        </span>
                      </td>
                      <td className="p-3">{data?.monthlyWeight.toLocaleString('es-CL')}</td>
                      <td className="p-3">{data?.dailyTransactions}</td>
                      <td className="p-3">${data?.revenuePerKg.toLocaleString('es-CL')}</td>
                      <td className="p-3">${data?.revenuePerDevice.toLocaleString('es-CL')}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress value={data?.efficiencyScore} className="w-16" />
                          <span className="text-xs">{data?.efficiencyScore}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            🥑
                            <span className="text-xs font-medium">{avocado?.monthlyWeight} kg</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            ${avocado?.monthlyRevenue.toLocaleString('es-CL')}
                          </div>
                        </div>
                      </td>
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

export default SalesAnalysisPage;