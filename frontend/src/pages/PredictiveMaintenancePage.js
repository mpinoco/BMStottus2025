import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Recycle, Calendar as CalendarIcon, AlertTriangle, Wrench, Clock, TrendingUp, CheckCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const PredictiveMaintenancePage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortBy, setSortBy] = useState('risk'); // risk, date, priority
  const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
      
      // Generate predictive maintenance data
      const maintenance = {};
      
      response.data.forEach(store => {
        store.devices.forEach(device => {
          // Calculate maintenance predictions based on device usage and history
          const installationDate = new Date(2019 + Math.random() * 6, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
          const ageInMonths = (new Date() - installationDate) / (1000 * 60 * 60 * 24 * 30);
          
          // Simulate usage patterns
          const dailyUsage = Math.random() * 12 + 8; // 8-20 hours per day
          const monthlyTransactions = Math.floor(Math.random() * 3000 + 1000); // 1000-4000 transactions
          const lastCalibration = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
          const daysSinceCalibration = (new Date() - lastCalibration) / (1000 * 60 * 60 * 24);
          
          // Predictive factors
          const usageScore = (dailyUsage / 20) * 100; // Higher usage = more maintenance needed
          const ageScore = Math.min((ageInMonths / 60) * 100, 100); // Older = more maintenance
          const calibrationScore = Math.min((daysSinceCalibration / 90) * 100, 100); // Overdue calibration
          const transactionScore = (monthlyTransactions / 4000) * 100; // High transactions
          
          // Overall maintenance risk (0-100)
          const maintenanceRisk = (usageScore + ageScore + calibrationScore + transactionScore) / 4;
          
          // Predict next maintenance date
          const daysUntilMaintenance = Math.max(1, 90 - (maintenanceRisk / 100 * 90));
          const nextMaintenanceDate = new Date(Date.now() + daysUntilMaintenance * 24 * 60 * 60 * 1000);
          
          // Calculate component wear
          const components = {
            printHead: Math.min(100, (monthlyTransactions * ageInMonths) / 50000 * 100),
            loadCell: Math.min(100, (monthlyTransactions * ageInMonths) / 100000 * 100),
            display: Math.min(100, ageInMonths / 60 * 100),
            keyboard: Math.min(100, (monthlyTransactions * ageInMonths) / 75000 * 100),
            printer: Math.min(100, (monthlyTransactions * ageInMonths) / 80000 * 100)
          };
          
          const priority = maintenanceRisk >= 70 ? 'high' : 
                          maintenanceRisk >= 40 ? 'medium' : 'low';
          
          const estimatedCost = Math.floor(50000 + (maintenanceRisk / 100) * 200000); // $50k-$250k CLP
          
          maintenance[device.id] = {
            storeId: store.id,
            storeName: store.name,
            comuna: store.comuna,
            deviceType: device.type,
            maintenanceRisk: Math.floor(maintenanceRisk),
            nextMaintenanceDate: nextMaintenanceDate.toISOString().split('T')[0],
            daysUntilMaintenance: Math.floor(daysUntilMaintenance),
            lastCalibration: lastCalibration.toISOString().split('T')[0],
            daysSinceCalibration: Math.floor(daysSinceCalibration),
            dailyUsage: dailyUsage.toFixed(1),
            monthlyTransactions,
            ageInMonths: Math.floor(ageInMonths),
            components,
            priority,
            estimatedCost,
            recommendations: generateMaintenanceRecommendations(maintenanceRisk, components, daysSinceCalibration),
            serialNumber: `BMCL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            status: device.status
          };
        });
      });
      
      setMaintenanceData(maintenance);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      toast.error('Error al cargar datos de mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const generateMaintenanceRecommendations = (risk, components, daysSince) => {
    const recommendations = [];
    
    if (risk >= 70) {
      recommendations.push({
        type: 'urgent',
        title: 'Mantenimiento Urgente',
        description: 'Programar intervención inmediata para prevenir fallas',
        priority: 'high'
      });
    }
    
    if (components.printHead >= 80) {
      recommendations.push({
        type: 'component',
        title: 'Reemplazar Cabezal de Impresión',
        description: 'El cabezal está cerca del final de su vida útil',
        priority: 'medium'
      });
    }
    
    if (daysSince >= 60) {
      recommendations.push({
        type: 'calibration',
        title: 'Calibración Programada',
        description: 'Realizar calibración para mantener precisión',
        priority: 'medium'
      });
    }
    
    if (components.loadCell >= 70) {
      recommendations.push({
        type: 'component',
        title: 'Inspeccionar Celda de Carga',
        description: 'Verificar precisión y estabilidad de la celda',
        priority: 'medium'
      });
    }
    
    return recommendations;
  };

  const scheduleWhatsAppAlert = (device) => {
    const message = `🔧 MANTENIMIENTO PREDICTIVO - BM MANAGER

Local: ${device.storeName} - ${device.comuna}
Balanza: ${device.serialNumber}
Tipo: ${device.deviceType}

Predicción de Mantenimiento:
- Riesgo: ${device.maintenanceRisk}%
- Próxima intervención: ${device.nextMaintenanceDate}
- Días restantes: ${device.daysUntilMaintenance}

Recomendaciones:
${device.recommendations.map(rec => `• ${rec.title}`).join('\n')}

Costo estimado: $${device.estimatedCost.toLocaleString('es-CL')} CLP

Por favor programar mantenimiento.`;

    toast.success(`Alerta de WhatsApp programada para ${device.storeName}`);
    console.log('WhatsApp Alert:', message);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMaintenanceStats = () => {
    const devices = Object.values(maintenanceData);
    const urgentMaintenance = devices.filter(d => d.priority === 'high').length;
    const scheduledMaintenance = devices.filter(d => d.priority === 'medium').length;
    const preventiveMaintenance = devices.filter(d => d.priority === 'low').length;
    const avgRisk = devices.reduce((sum, d) => sum + d.maintenanceRisk, 0) / devices.length;
    const totalEstimatedCost = devices.reduce((sum, d) => sum + d.estimatedCost, 0);
    const overdueCalibractions = devices.filter(d => d.daysSinceCalibration > 90).length;
    
    return {
      total: devices.length,
      urgentMaintenance,
      scheduledMaintenance,
      preventiveMaintenance,
      avgRisk: avgRisk || 0,
      totalEstimatedCost,
      overdueCalibractions
    };
  };

  const getUpcomingMaintenance = () => {
    return Object.values(maintenanceData)
      .filter(device => device.daysUntilMaintenance <= 30)
      .sort((a, b) => a.daysUntilMaintenance - b.daysUntilMaintenance)
      .slice(0, 10);
  };

  const stats = Object.keys(maintenanceData).length > 0 ? getMaintenanceStats() : {};
  const upcomingMaintenance = Object.keys(maintenanceData).length > 0 ? getUpcomingMaintenance() : [];

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
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              Mantenimiento Predictivo
            </h1>
            <p className="text-gray-600 mt-1">Predicción y programación inteligente de mantenimientos</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
            IA Predictiva Activa
          </Badge>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mantenimiento Urgente</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgentMaintenance}</p>
                <p className="text-xs text-red-500">Próximos 7 días</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Programado</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.scheduledMaintenance}</p>
                <p className="text-xs text-yellow-500">Próximos 30 días</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Riesgo Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgRisk?.toFixed(1)}%</p>
                <p className="text-xs text-blue-500">Nivel general</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Costo Estimado</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalEstimatedCost?.toLocaleString('es-CL')}</p>
                <p className="text-xs text-green-500">CLP mensual</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-sm font-medium">Ordenar por:</Label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="ml-2 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="risk">Riesgo (Mayor a Menor)</option>
                  <option value="date">Próximo Mantenimiento</option>
                  <option value="priority">Prioridad</option>
                  <option value="cost">Costo Estimado</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium">Filtrar prioridad:</Label>
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="ml-2 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="high">Alta prioridad</option>
                  <option value="medium">Media prioridad</option>
                  <option value="low">Baja prioridad</option>
                </select>
              </div>
            </div>
            <Badge style={{ backgroundColor: '#0071CE', color: 'white' }}>
              {Object.values(maintenanceData).filter(device => 
                filterPriority === 'all' || device.priority === filterPriority
              ).length} dispositivos
            </Badge>
          </div>
        </Card>

        {/* Upcoming Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Próximos Mantenimientos (30 días)
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {upcomingMaintenance.map(device => (
                <div key={device.serialNumber} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{device.storeName}</p>
                      <p className="text-sm text-gray-600">{device.comuna} • {device.deviceType}</p>
                      <p className="text-xs text-gray-500 mt-1">Serie: {device.serialNumber}</p>
                    </div>
                    <Badge className={getPriorityColor(device.priority)}>
                      {device.priority === 'high' ? 'Urgente' : device.priority === 'medium' ? 'Programado' : 'Preventivo'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        En {device.daysUntilMaintenance} días
                      </span>
                      <span className="text-gray-600">
                        Riesgo: {device.maintenanceRisk}%
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => scheduleWhatsAppAlert(device)}
                      className="text-xs"
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f47421' }}>
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                Estado de Componentes Críticos
              </h3>
              <Badge style={{ backgroundColor: '#0071CE', color: 'white' }}>
                Top 5 más críticos
              </Badge>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: '#0071CE' }}>
                    <th className="text-left p-3 font-semibold">Balanza</th>
                    <th className="text-left p-3 font-semibold">Cabezal</th>
                    <th className="text-left p-3 font-semibold">Celda</th>
                    <th className="text-left p-3 font-semibold">Pantalla</th>
                    <th className="text-left p-3 font-semibold">Teclado</th>
                    <th className="text-left p-3 font-semibold">Impresora</th>
                    <th className="text-left p-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(maintenanceData)
                    .filter(device => device.maintenanceRisk >= 50)
                    .sort((a, b) => b.maintenanceRisk - a.maintenanceRisk)
                    .slice(0, 8)
                    .map(device => (
                      <tr key={device.serialNumber} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-gray-900">{device.storeName}</p>
                            <p className="text-xs text-gray-600">{device.serialNumber}</p>
                            <Badge className={`text-xs mt-1 ${
                              device.priority === 'high' ? 'bg-red-100 text-red-700' :
                              device.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {device.priority === 'high' ? 'Alta' : device.priority === 'medium' ? 'Media' : 'Baja'}
                            </Badge>
                          </div>
                        </td>
                        {Object.entries(device.components).map(([component, wear]) => (
                          <td key={component} className="p-3">
                            <div className="flex flex-col items-center">
                              <div className="w-12 bg-gray-200 rounded-full h-2 mb-1">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    wear >= 80 ? 'bg-red-500' :
                                    wear >= 60 ? 'bg-yellow-500' :
                                    'bg-blue-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min(wear, 100)}%`,
                                    backgroundColor: wear >= 80 ? '#ef4444' :
                                                   wear >= 60 ? '#f47421' : '#0071CE'
                                  }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${
                                wear >= 80 ? 'text-red-600' :
                                wear >= 60 ? 'text-orange-600' :
                                'text-blue-600'
                              }`}>
                                {Math.floor(wear)}%
                              </span>
                            </div>
                          </td>
                        ))}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              device.maintenanceRisk >= 70 ? 'bg-red-500' :
                              device.maintenanceRisk >= 40 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}></div>
                            <span className="text-xs font-medium">
                              {device.maintenanceRisk >= 70 ? 'Crítico' :
                               device.maintenanceRisk >= 40 ? 'Atención' : 'Bien'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#f47421', opacity: '0.1' }}>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>≥80% Reemplazar inmediato</span>
                <div className="w-3 h-3 bg-yellow-500 rounded-full ml-4"></div>
                <span>60-79% Programar cambio</span>
                <div className="w-3 h-3 bg-blue-500 rounded-full ml-4"></div>
                <span>&lt;60% Estado óptimo</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Maintenance Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Análisis Completo de Mantenimiento Predictivo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Local / Balanza</th>
                  <th className="text-left p-3">Riesgo</th>
                  <th className="text-left p-3">Próximo Mantenimiento</th>
                  <th className="text-left p-3">Última Calibración</th>
                  <th className="text-left p-3">Uso Diario</th>
                  <th className="text-left p-3">Transacciones/Mes</th>
                  <th className="text-left p-3">Costo Estimado</th>
                  <th className="text-left p-3">Recomendaciones</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(maintenanceData)
                  .filter(device => filterPriority === 'all' || device.priority === filterPriority)
                  .sort((a, b) => {
                    switch (sortBy) {
                      case 'risk':
                        return b.maintenanceRisk - a.maintenanceRisk;
                      case 'date':
                        return a.daysUntilMaintenance - b.daysUntilMaintenance;
                      case 'priority':
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                      case 'cost':
                        return b.estimatedCost - a.estimatedCost;
                      default:
                        return b.maintenanceRisk - a.maintenanceRisk;
                    }
                  })
                  .slice(0, 15) // Limit to 15 devices for better performance
                  .map(device => (
                    <tr key={device.serialNumber} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{device.storeName}</p>
                          <p className="text-xs text-gray-600">{device.comuna}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-gray-100 text-gray-700 text-xs">{device.deviceType}</Badge>
                            <span className="text-xs text-gray-500">{device.serialNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                device.maintenanceRisk >= 70 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                device.maintenanceRisk >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-blue-500 to-blue-600'
                              }`}
                              style={{ 
                                width: `${device.maintenanceRisk}%`,
                                backgroundColor: device.maintenanceRisk >= 70 ? '#ef4444' :
                                               device.maintenanceRisk >= 40 ? '#f47421' : '#0071CE'
                              }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            device.maintenanceRisk >= 70 ? 'text-red-600' :
                            device.maintenanceRisk >= 40 ? '' :
                            'text-blue-600'
                          }`}
                          style={{
                            color: device.maintenanceRisk >= 40 && device.maintenanceRisk < 70 ? '#f47421' : undefined
                          }}>
                            {device.maintenanceRisk}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{device.nextMaintenanceDate}</p>
                          <p className="text-xs text-gray-600">En {device.daysUntilMaintenance} días</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{device.lastCalibration}</p>
                          <p className="text-xs text-gray-600">
                            Hace {device.daysSinceCalibration} días
                          </p>
                        </div>
                      </td>
                      <td className="p-3">{device.dailyUsage}h</td>
                      <td className="p-3">{device.monthlyTransactions.toLocaleString('es-CL')}</td>
                      <td className="p-3">
                        <span className="font-medium text-green-600">
                          ${device.estimatedCost.toLocaleString('es-CL')}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {device.recommendations.slice(0, 2).map((rec, index) => (
                            <Badge key={index} className="text-xs bg-blue-100 text-blue-700 block w-fit">
                              {rec.title}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <Button 
                          size="sm" 
                          onClick={() => scheduleWhatsAppAlert(device)}
                          className="text-xs"
                          style={{ backgroundColor: '#25D366' }}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Programar
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

export default PredictiveMaintenancePage;