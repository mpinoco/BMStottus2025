import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, HardDrive, Calendar, CheckCircle, AlertCircle, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';
import NewBalanceForm from '@/components/NewBalanceForm';

const AssetPage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewBalanceForm, setShowNewBalanceForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
      
      // Flatten all devices with store info
      const devices = [];
      response.data.forEach(store => {
        store.devices?.forEach(device => {
          // Generate random serial like BMCL-9E998776
          const randomHex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
          devices.push({
            ...device,
            storeName: store.name,
            storeComuna: store.comuna,
            storeId: store.id,
            serialNumber: `BMCL-${randomHex}`,
            provider: device.type === 'IA' ? 'Allcom IA Systems' : 'Balanzas Chile S.A.',
            licenseStatus: Math.random() > 0.1 ? 'active' : 'pending',
            warrantyExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        });
      });
      
      setAllDevices(devices);
    } catch (error) {
      toast.error('Error al cargar activos');
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = allDevices.filter(device => 
    device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNewBalance = async (newBalance) => {
    try {
      // Add to local state
      const device = {
        id: `new-${Date.now()}`,
        serialNumber: newBalance.serialNumber,
        storeName: newBalance.storeName,
        storeComuna: newBalance.storeComuna,
        type: newBalance.type,
        installation_date: newBalance.installationDate,
        provider: newBalance.provider,
        licenseStatus: 'active',
        warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      setAllDevices([device, ...allDevices]);
      toast.success('Balanza configurada exitosamente');
      setShowNewBalanceForm(false);
      
      // Here you would normally save to backend
      // await axios.post(`${API}/balances`, newBalance);
    } catch (error) {
      toast.error('Error al guardar la balanza');
      console.error(error);
    }
  };

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
        {showNewBalanceForm ? (
          <NewBalanceForm 
            stores={stores}
            onSave={handleSaveNewBalance}
            onCancel={() => setShowNewBalanceForm(false)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Activos
                </h1>
                <p className="text-gray-600 mt-1">Inventario completo de balanzas</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="px-4 py-2 text-base" style={{ backgroundColor: '#0071CE', color: 'white' }}>
                  Total Activos: {allDevices.length}
                </Badge>
              </div>
            </div>

            {/* Configure New Balance Button */}
            <Card 
              className="p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 hover:scale-[1.02]"
              style={{ 
                borderColor: '#0071CE',
                background: 'linear-gradient(135deg, rgba(0, 113, 206, 0.05) 0%, rgba(255, 194, 32, 0.05) 100%)'
              }}
              onClick={() => setShowNewBalanceForm(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#0071CE' }}
                  >
                    <Settings className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Configurar Nueva Balanza
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Registre un nuevo equipo Marques en el sistema con toda su información técnica
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Plus size={32} style={{ color: '#0071CE' }} />
                </div>
              </div>
            </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Licencias Activas</p>
                <h3 className="text-3xl font-bold text-green-600">
                  {allDevices.filter(d => d.licenseStatus === 'active').length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Licencias Pendientes</p>
                <h3 className="text-3xl font-bold text-amber-600">
                  {allDevices.filter(d => d.licenseStatus === 'pending').length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Proveedores</p>
                <h3 className="text-3xl font-bold" style={{ color: '#0071CE' }}>2</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 113, 206, 0.1)' }}>
                <HardDrive className="w-6 h-6" style={{ color: '#0071CE' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Instalaciones 2025</p>
                <h3 className="text-3xl font-bold" style={{ color: '#FFC220' }}>
                  {allDevices.filter(d => d.installation_date.startsWith('2025')).length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 194, 32, 0.1)' }}>
                <Calendar className="w-6 h-6" style={{ color: '#FFC220' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-4 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Buscar por número de serie, local, tipo o proveedor..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Assets Table */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Registro de Activos ({filteredDevices.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Número de Serie</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Fecha Instalación</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Proveedor</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Licencia</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Garantía</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.slice(0, 50).map((device) => (
                  <tr key={device.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs font-semibold whitespace-nowrap" style={{ color: '#0071CE' }}>
                        {device.serialNumber}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-sm text-gray-800 whitespace-nowrap">{device.storeName} - {device.storeComuna}</p>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge 
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                        style={{
                          borderColor: device.type === 'IA' ? '#0071CE' : '#FFC220',
                          color: device.type === 'IA' ? '#0071CE' : '#FFC220'
                        }}
                      >
                        {device.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      {new Date(device.installation_date).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">{device.provider}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge 
                        className="text-xs whitespace-nowrap"
                        style={{
                          backgroundColor: device.licenseStatus === 'active' ? '#10b981' : '#f59e0b',
                          color: 'white'
                        }}
                      >
                        {device.licenseStatus === 'active' ? 'Activa' : 'Pendiente'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      {device.warrantyExpiry}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AssetPage;