import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  MapPin, 
  Wifi, 
  Activity, 
  Calendar, 
  HardDrive, 
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Settings
} from 'lucide-react';

const OpenManagerPage = ({ onLogout }) => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDevice, setHoveredDevice] = useState(null);

  useEffect(() => {
    loadStore();
  }, [storeId]);

  const loadStore = async () => {
    try {
      const response = await axios.get(`${API}/stores/${storeId}`);
      setStore(response.data);
    } catch (error) {
      toast.error('Error al cargar local');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = (deviceId) => {
    toast.success(`Balanza ${deviceId} reiniciada exitosamente`);
  };

  const handleScheduleMaintenance = () => {
    toast.success('Mantenimiento agendado correctamente');
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!store) {
    return (
      <Layout onLogout={onLogout}>
        <div className="p-8">
          <Card className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Local no encontrado</h2>
            <p className="text-gray-600">No se pudo cargar la información del local</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              {store.name} - {store.comuna}
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <MapPin size={16} />
              {store.address}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full status-${store.status}`} />
            <span className="font-semibold text-lg capitalize">
              {store.status === 'online' ? 'En línea' : store.status}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                <Wifi className="w-6 h-6" style={{ color: '#79b9e7' }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado de Red</p>
                <p className="text-lg font-bold text-gray-800">{store.network_status}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Latencia: <span className="font-semibold">{store.latency}ms</span></p>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <HardDrive className="w-6 h-6" style={{ color: '#f47421' }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Código SAP</p>
                <p className="text-lg font-bold text-gray-800">{store.sap_code}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Balanzas</p>
                <p className="text-lg font-bold text-gray-800">
                  {store.balances_bms + store.balances_autoservicio + store.balances_ia}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>BMS: {store.balances_bms} | Auto: {store.balances_autoservicio} | IA: {store.balances_ia}</p>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Dispositivos del Local</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {store.devices && store.devices.map((device, idx) => (
                  <div
                    key={device.id}
                    className="relative p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onMouseEnter={() => setHoveredDevice(device.id)}
                    onMouseLeave={() => setHoveredDevice(null)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{device.type}</p>
                        <p className="text-xs text-gray-500">ID: {device.id.slice(0, 8)}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full status-${device.status}`} />
                    </div>
                    
                    {hoveredDevice === device.id && (
                      <div className="absolute top-0 left-0 w-full h-full bg-white border-2 border-sky-400 rounded-lg p-4 z-10 shadow-xl">
                        <p className="font-bold text-gray-800 mb-2">{device.type}</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><span className="font-semibold">Firmware:</span> {device.firmware_version}</p>
                          <p><span className="font-semibold">Última Calibración:</span> {new Date(device.last_calibration).toLocaleDateString()}</p>
                          <p><span className="font-semibold">Instalación:</span> {new Date(device.installation_date).toLocaleDateString()}</p>
                          <p><span className="font-semibold">Consumo:</span> {device.avg_consumption} kWh/día</p>
                          <p><span className="font-semibold">Estado Etiqueta:</span> {device.label_status}</p>
                          <p><span className="font-semibold">Vida Cabezal:</span> {device.printhead_life}%</p>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full mt-3"
                          style={{ backgroundColor: '#79b9e7' }}
                          onClick={() => handleRestart(device.id)}
                        >
                          <RefreshCw size={14} className="mr-1" />
                          Reiniciar
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Firmware:</span>
                        <Badge variant="outline" className="text-xs">{device.firmware_version}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <Badge variant={device.status === 'online' ? 'default' : 'destructive'} className="text-xs">
                          {device.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Historial de Mantenimiento</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Última Mantención Preventiva</p>
                      <p className="text-sm text-gray-600">15/01/2025 - Completado</p>
                      <p className="text-xs text-gray-500">Próximo mantenimiento: 15/04/2025</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">Completado</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Calibración Trimestral</p>
                      <p className="text-sm text-gray-600">10/12/2024 - Completado</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">Completado</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Próxima Calibración</p>
                      <p className="text-sm text-gray-600">Programada: 10/03/2025</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    style={{ backgroundColor: '#FFC220', color: '#000' }}
                    onClick={handleScheduleMaintenance}
                  >
                    Reagendar
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Registro de Incidentes</h3>
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No hay incidentes reportados</p>
                <p className="text-sm text-gray-500 mt-2">Este local opera sin problemas</p>
                <Button 
                  className="mt-6"
                  variant="outline"
                  onClick={() => toast.info('Formulario de reporte de incidentes')}
                >
                  <AlertTriangle size={16} className="mr-2" />
                  Reportar Incidente
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OpenManagerPage;