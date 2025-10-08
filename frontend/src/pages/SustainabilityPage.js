import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Leaf, TrendingDown, TrendingUp, Zap, FileText, Target, Award, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SustainabilityPage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [sustainabilityData, setSustainabilityData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSustainabilityData();
  }, []);

  const loadSustainabilityData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
      
      // Calculate sustainability metrics for each store
      const sustainability = {};
      response.data.forEach(store => {
        const devices = store.devices || [];
        const energyConsumption = devices.length * 24 * 30 * 0.15; // kWh per month (estimated)
        const paperConsumption = devices.length * 50 * 30; // sheets per month (estimated)
        
        // CO2 emissions calculation (kg CO2)
        const carbonFootprint = (energyConsumption * 0.5) + (paperConsumption * 0.006);
        
        // Sustainability score (0-100, where 100 is best)
        const score = Math.max(0, 100 - (carbonFootprint / devices.length) * 10);
        
        sustainability[store.id] = {
          energyConsumption,
          paperConsumption,
          carbonFootprint,
          score,
          category: score >= 70 ? 'green' : score >= 40 ? 'orange' : 'red',
          recommendations: generateRecommendations(score, energyConsumption, paperConsumption)
        };
      });
      
      setSustainabilityData(sustainability);
    } catch (error) {
      console.error('Error loading sustainability data:', error);
      toast.error('Error al cargar datos de sostenibilidad');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (score, energy, paper) => {
    const recommendations = [];
    
    if (paper > 2000) {
      recommendations.push({
        type: 'paper',
        title: 'Adopta etiquetas linerless',
        description: 'Reduce el 40% del consumo de papel térmico',
        impact: 'Alto',
        savings: '40%'
      });
    }
    
    if (energy > 150) {
      recommendations.push({
        type: 'energy',
        title: 'Programa calibraciones',
        description: 'Mejora la eficiencia energética en un 15%',
        impact: 'Medio',
        savings: '15%'
      });
    }
    
    if (score < 50) {
      recommendations.push({
        type: 'general',
        title: 'Implementa modo eco',
        description: 'Activa modo ahorro de energía fuera de horarios pico',
        impact: 'Medio',
        savings: '20%'
      });
    }

    return recommendations;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'green': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'orange': return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
      case 'red': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getOverallMetrics = () => {
    const totalEnergy = Object.values(sustainabilityData).reduce((sum, data) => sum + data.energyConsumption, 0);
    const totalPaper = Object.values(sustainabilityData).reduce((sum, data) => sum + data.paperConsumption, 0);
    const totalCarbon = Object.values(sustainabilityData).reduce((sum, data) => sum + data.carbonFootprint, 0);
    const avgScore = Object.values(sustainabilityData).reduce((sum, data) => sum + data.score, 0) / Object.keys(sustainabilityData).length;
    
    const greenStores = Object.values(sustainabilityData).filter(data => data.category === 'green').length;
    const orangeStores = Object.values(sustainabilityData).filter(data => data.category === 'orange').length;
    const redStores = Object.values(sustainabilityData).filter(data => data.category === 'red').length;

    return {
      totalEnergy: totalEnergy.toFixed(1),
      totalPaper: totalPaper.toLocaleString(),
      totalCarbon: totalCarbon.toFixed(1),
      avgScore: avgScore.toFixed(1),
      greenStores,
      orangeStores,
      redStores
    };
  };

  const metrics = Object.keys(sustainabilityData).length > 0 ? getOverallMetrics() : {};

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
                <Leaf className="w-6 h-6 text-white" />
              </div>
              Indicadores de Sostenibilidad
            </h1>
            <p className="text-gray-600 mt-1">Monitoreo de huella de carbono y eficiencia ambiental</p>
          </div>
          <Badge className="bg-green-100 text-green-800 px-4 py-2">
            Sistema Verde Activo
          </Badge>
        </div>

        {/* Overall Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Huella de Carbono Total</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalCarbon} kg CO₂</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -12% vs mes anterior
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consumo Energético</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalEnergy} kWh</p>
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +3% vs mes anterior
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consumo de Papel</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalPaper}</p>
                <p className="text-xs text-gray-600">hojas/mes</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Puntuación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgScore}/100</p>
                <div className="flex gap-1 mt-1">
                  <Badge className="bg-green-100 text-green-700 text-xs">{metrics.greenStores} Verde</Badge>
                  <Badge className="bg-orange-100 text-orange-700 text-xs">{metrics.orangeStores} Medio</Badge>
                  <Badge className="bg-red-100 text-red-700 text-xs">{metrics.redStores} Alto</Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Top 5 Locales Más Sostenibles
            </h3>
            <div className="space-y-3">
              {stores
                .sort((a, b) => (sustainabilityData[b.id]?.score || 0) - (sustainabilityData[a.id]?.score || 0))
                .slice(0, 5)
                .map((store, index) => {
                  const data = sustainabilityData[store.id];
                  const colors = getCategoryColor(data?.category);
                  return (
                    <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-sm text-gray-600">{store.comuna}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{data?.score.toFixed(1)}/100</p>
                        <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                          {data?.carbonFootprint.toFixed(1)} kg CO₂
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Locales que Requieren Atención
            </h3>
            <div className="space-y-3">
              {stores
                .filter(store => sustainabilityData[store.id]?.category === 'red')
                .slice(0, 5)
                .map((store) => {
                  const data = sustainabilityData[store.id];
                  return (
                    <div key={store.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-sm text-gray-600">{store.comuna}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{data?.score.toFixed(1)}/100</p>
                        <p className="text-xs text-red-600">{data?.carbonFootprint.toFixed(1)} kg CO₂</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>

        {/* Detailed Store Analysis */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Análisis Detallado por Local</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Local</th>
                  <th className="text-left p-3">Puntuación</th>
                  <th className="text-left p-3">CO₂ (kg/mes)</th>
                  <th className="text-left p-3">Energía (kWh)</th>
                  <th className="text-left p-3">Papel (hojas)</th>
                  <th className="text-left p-3">Recomendaciones</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => {
                  const data = sustainabilityData[store.id];
                  const colors = getCategoryColor(data?.category);
                  return (
                    <tr key={store.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-xs text-gray-600">{store.comuna}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress value={data?.score} className="w-20" />
                          <span className="text-sm font-medium">{data?.score.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={`${colors.bg} ${colors.text}`}>
                          {data?.carbonFootprint.toFixed(1)}
                        </Badge>
                      </td>
                      <td className="p-3">{data?.energyConsumption.toFixed(1)}</td>
                      <td className="p-3">{data?.paperConsumption.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {data?.recommendations.slice(0, 2).map((rec, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {rec.title}
                              </span>
                              <span className="text-xs text-green-600">-{rec.savings}</span>
                            </div>
                          ))}
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

export default SustainabilityPage;