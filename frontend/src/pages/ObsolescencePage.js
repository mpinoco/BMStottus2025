import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Clock, WrenchIcon, ShoppingCart, Filter, TrendingDown, Calendar, Zap } from 'lucide-react';
import { toast } from 'sonner';

const ObsolescencePage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [obsoleteDevices, setObsoleteDevices] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    loadObsolescenceData();
  }, []);

  const loadObsolescenceData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
      
      // Analyze devices for obsolescence
      const obsoleteList = [];
      
      response.data.forEach(store => {
        store.devices.forEach(device => {
          // Calculate installation age (assuming random dates for demo)
          const installationDate = new Date(2019 + Math.random() * 6, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
          const ageInYears = (new Date() - installationDate) / (1000 * 60 * 60 * 24 * 365);
          
          // Generate failure data
          const monthlyFailures = Math.floor(Math.random() * 5);
          const downtime = Math.random() * 48; // hours per month
          const lastMaintenance = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
          const warrantyExpired = ageInYears > 3;
          
          // Calculate obsolescence score (0-100, higher = more obsolete)
          let obsolescenceScore = 0;
          if (ageInYears > 5) obsolescenceScore += 40;
          else if (ageInYears > 3) obsolescenceScore += 20;
          
          obsolescenceScore += monthlyFailures * 8;
          obsolescenceScore += (downtime / 48) * 30;
          if (warrantyExpired) obsolescenceScore += 20;
          
          const provider = device.type === 'IA' ? 'Allcom IA Systems' : 
                          device.type === 'AUTOSERVICIO' ? 'Balanzas Chile S.A.' : 'Sistemas Integrados';
          
          const replacementCost = device.type === 'IA' ? 850000 : 
                                 device.type === 'AUTOSERVICIO' ? 650000 : 450000;
          
          const priority = obsolescenceScore >= 70 ? 'high' :
                          obsolescenceScore >= 40 ? 'medium' : 'low';
          
          // Reduce criteria to show fewer devices (50% reduction)
          if (obsolescenceScore > 60 || ageInYears > 5 || monthlyFailures > 3) {
            obsoleteList.push({
              id: device.id,
              storeId: store.id,
              storeName: store.name,
              comuna: store.comuna,
              deviceType: device.type,
              installationDate: installationDate.toISOString().split('T')[0],
              ageInYears: ageInYears.toFixed(1),
              monthlyFailures,
              downtime: downtime.toFixed(1),
              lastMaintenance: lastMaintenance.toISOString().split('T')[0],
              warrantyExpired,
              obsolescenceScore: Math.min(100, obsolescenceScore),
              provider,
              replacementCost,
              priority,
              serialNumber: `BMCL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
              status: device.status,
              lastFailure: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          }
        });
      });
      
      // Sort by obsolescence score (highest first) and limit to top 30 for performance
      obsoleteList.sort((a, b) => b.obsolescenceScore - a.obsolescenceScore);
      setObsoleteDevices(obsoleteList.slice(0, 30));
      
    } catch (error) {
      console.error('Error loading obsolescence data:', error);
      toast.error('Error al cargar datos de obsolescencia');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDevices = () => {
    return obsoleteDevices.filter(device => {
      const typeMatch = filterType === 'all' || device.deviceType === filterType;
      const providerMatch = filterProvider === 'all' || device.provider === filterProvider;
      return typeMatch && providerMatch;
    });
  };

  const generateReplacementOrder = (device) => {
    const orderData = {
      device_id: device.id,
      store_name: device.storeName,
      store_comuna: device.comuna,
      current_device_type: device.deviceType,
      replacement_cost: device.replacementCost,
      priority: device.priority,
      justification: `Balanza obsoleta: ${device.ageInYears} años, ${device.monthlyFailures} fallas/mes, ${device.downtime}h downtime/mes`,
      provider: device.provider,
      urgent: device.priority === 'high'
    };
    
    // Simulate order generation
    toast.success(`Orden de reemplazo generada para balanza ${device.serialNumber}`);
    console.log('Replacement order:', orderData);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getObsolescenceStats = () => {
    const filtered = getFilteredDevices();
    const highPriority = filtered.filter(d => d.priority === 'high').length;
    const mediumPriority = filtered.filter(d => d.priority === 'medium').length;
    const lowPriority = filtered.filter(d => d.priority === 'low').length;
    const warrantyExpired = filtered.filter(d => d.warrantyExpired).length;
    const totalReplacementCost = filtered.reduce((sum, d) => sum + d.replacementCost, 0);
    
    return {
      total: filtered.length,
      highPriority,
      mediumPriority,
      lowPriority,
      warrantyExpired,
      totalReplacementCost
    };
  };

  const stats = getObsolescenceStats();

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
              <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              Gestión de Obsolescencia
            </h1>
            <p className="text-gray-600 mt-1">Monitoreo y renovación de equipos obsoletos y con fallas recurrentes</p>
          </div>
          <Badge className="bg-orange-100 text-orange-800 px-4 py-2">
            {stats.total} Equipos Requieren Atención
          </Badge>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
                <p className="text-xs text-red-500">Reemplazo urgente</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prioridad Media</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.mediumPriority}</p>
                <p className="text-xs text-yellow-500">Planificar reemplazo</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Garantía Vencida</p>
                <p className="text-2xl font-bold text-blue-600">{stats.warrantyExpired}</p>
                <p className="text-xs text-blue-500">Fuera de garantía</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Costo Total Reemplazo</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalReplacementCost.toLocaleString('es-CL')}</p>
                <p className="text-xs text-green-500">CLP estimado</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de Balanza</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="BMS_ASISTIDA">BMS Asistida</SelectItem>
                    <SelectItem value="AUTOSERVICIO">Autoservicio</SelectItem>
                    <SelectItem value="IA">IA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Proveedor</label>
                <Select value={filterProvider} onValueChange={setFilterProvider}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los proveedores</SelectItem>
                    <SelectItem value="Allcom IA Systems">Allcom IA Systems</SelectItem>
                    <SelectItem value="Balanzas Chile S.A.">Balanzas Chile S.A.</SelectItem>
                    <SelectItem value="Sistemas Integrados">Sistemas Integrados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Obsolete Devices List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <WrenchIcon className="w-5 h-5 text-orange-600" />
            Balanzas que Requieren Atención ({getFilteredDevices().length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Local / Balanza</th>
                  <th className="text-left p-3">Edad</th>
                  <th className="text-left p-3">Fallas/Mes</th>
                  <th className="text-left p-3">Downtime</th>
                  <th className="text-left p-3">Garantía</th>
                  <th className="text-left p-3">Puntuación</th>
                  <th className="text-left p-3">Prioridad</th>
                  <th className="text-left p-3">Costo Reemplazo</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredDevices().map(device => (
                  <tr key={device.id} className="border-b hover:bg-gray-50">
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
                      <div>
                        <p className="font-medium">{device.ageInYears} años</p>
                        <p className="text-xs text-gray-600">Instalado: {device.installationDate}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${device.monthlyFailures >= 3 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {device.monthlyFailures}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${device.downtime >= 24 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {device.downtime}h
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge className={device.warrantyExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                        {device.warrantyExpired ? 'Vencida' : 'Vigente'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              device.obsolescenceScore >= 70 ? 'bg-red-500' :
                              device.obsolescenceScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${device.obsolescenceScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{Math.floor(device.obsolescenceScore)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getPriorityColor(device.priority)}>
                        {device.priority === 'high' ? 'Alta' : device.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">${device.replacementCost.toLocaleString('es-CL')}</p>
                      <p className="text-xs text-gray-600">CLP</p>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setSelectedDevice(device)}
                              className="text-xs"
                            >
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles de Balanza Obsoleta</DialogTitle>
                            </DialogHeader>
                            {selectedDevice && (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                  <div>
                                    <label className="font-medium">Local:</label>
                                    <p>{selectedDevice.storeName} - {selectedDevice.comuna}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Tipo de Balanza:</label>
                                    <p>{selectedDevice.deviceType}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Número de Serie:</label>
                                    <p>{selectedDevice.serialNumber}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Proveedor:</label>
                                    <p>{selectedDevice.provider}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Estado Actual:</label>
                                    <Badge className={selectedDevice.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                      {selectedDevice.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <label className="font-medium">Fecha de Instalación:</label>
                                    <p>{selectedDevice.installationDate}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Última Falla:</label>
                                    <p>{selectedDevice.lastFailure}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Último Mantenimiento:</label>
                                    <p>{selectedDevice.lastMaintenance}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Costo de Reemplazo:</label>
                                    <p className="font-bold text-green-600">${selectedDevice.replacementCost.toLocaleString('es-CL')} CLP</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Puntuación de Obsolescencia:</label>
                                    <p className="font-bold text-orange-600">{Math.floor(selectedDevice.obsolescenceScore)}/100</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          onClick={() => generateReplacementOrder(device)}
                          className="text-xs"
                          style={{ backgroundColor: '#0071CE' }}
                        >
                          Sugerir Recambio
                        </Button>
                      </div>
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

export default ObsolescencePage;