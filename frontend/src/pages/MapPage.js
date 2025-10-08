import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
    } catch (error) {
      toast.error('Error al cargar locales');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (salesLevel) => {
    switch (salesLevel) {
      case 'high': return '#047857'; // green-800
      case 'medium': return '#10b981'; // green-500
      case 'low': return '#6ee7b7'; // green-300
      default: return '#10b981';
    }
  };

  const createCustomIcon = (store, localCode) => {
    const color = getMarkerColor(store.sales_level);
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            color: white;
            font-weight: bold;
            font-size: 11px;
            transform: rotate(45deg);
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          ">${localCode}</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  const filteredStores = filterLevel === 'all' 
    ? stores 
    : stores.filter(s => s.sales_level === filterLevel);

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
      <div className="p-8 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Mapa de Locales</h1>
          <p className="text-gray-600 mt-1">Visualización geográfica de todas las sucursales</p>
        </div>

        {/* Legend & Filters */}
        <Card className="p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <p className="font-semibold text-gray-700">Nivel de Ventas:</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#047857' }} />
                <span className="text-sm">Alto</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }} />
                <span className="text-sm">Medio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6ee7b7' }} />
                <span className="text-sm">Bajo</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={filterLevel === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterLevel('all')}
                style={filterLevel === 'all' ? { backgroundColor: '#79b9e7' } : {}}
              >
                Todos ({stores.length})
              </Button>
              <Button 
                size="sm" 
                variant={filterLevel === 'high' ? 'default' : 'outline'}
                onClick={() => setFilterLevel('high')}
                style={filterLevel === 'high' ? { backgroundColor: '#047857', color: 'white' } : {}}
              >
                Alto
              </Button>
              <Button 
                size="sm" 
                variant={filterLevel === 'medium' ? 'default' : 'outline'}
                onClick={() => setFilterLevel('medium')}
                style={filterLevel === 'medium' ? { backgroundColor: '#10b981', color: 'white' } : {}}
              >
                Medio
              </Button>
              <Button 
                size="sm" 
                variant={filterLevel === 'low' ? 'default' : 'outline'}
                onClick={() => setFilterLevel('low')}
                style={filterLevel === 'low' ? { backgroundColor: '#6ee7b7', color: 'white' } : {}}
              >
                Bajo
              </Button>
            </div>
          </div>
        </Card>

        {/* Map */}
        <Card className="flex-1 overflow-hidden shadow-lg">
          <MapContainer 
            center={[-33.4489, -70.6693]} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredStores.map((store, idx) => {
              // Extract 3-digit code from store name or use index
              const localCode = store.sap_code ? store.sap_code.split('-')[1].slice(-3) : (idx + 1).toString().padStart(3, '0');
              return (
                <Marker 
                  key={store.id} 
                  position={[store.latitude, store.longitude]}
                  icon={createCustomIcon(store, localCode)}
                >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2">{store.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{store.comuna}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Código SAP:</span>
                        <span className="font-semibold">{store.sap_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">BMS Asistida:</span>
                        <Badge variant="outline">{store.balances_bms}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Autoservicio:</span>
                        <Badge variant="outline">{store.balances_autoservicio}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Balanzas IA:</span>
                        <Badge style={{ backgroundColor: '#79b9e7', color: 'white' }}>{store.balances_ia}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full status-${store.status}`} />
                          <span className="capitalize text-xs">
                            {store.status === 'online' ? 'En línea' : store.status === 'partial' ? 'Parcial' : 'Desconectado'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-3"
                      style={{ backgroundColor: '#79b9e7' }}
                      onClick={() => navigate(`/store/${store.id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </Popup>
              </Marker>
              );
            })}
          </MapContainer>
        </Card>
      </div>
    </Layout>
  );
};

export default MapPage;