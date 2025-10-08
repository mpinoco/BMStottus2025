import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle2, Calendar } from 'lucide-react';

const SuppliesPage = ({ onLogout }) => {
  const supplies = [
    {
      id: 1,
      category: 'Papel Térmico Premium',
      vendor: 'Papelera Nacional S.A.',
      quality: 'Premium 80gsm',
      glueAmount: '15%',
      rollDimensions: '80mm x 80m',
      metersPerRoll: 80,
      coreSize: '12mm',
      unitsPerBox: 50,
      costPerRoll: '$2.500',
      stock: 15000,
      minStock: 5000,
      lastOrder: '2025-02-10',
      nextOrder: '2025-03-01'
    },
    {
      id: 2,
      category: 'Papel Térmico Estándar',
      vendor: 'Distribuidora Sur',
      quality: 'Estándar 55gsm',
      glueAmount: '10%',
      rollDimensions: '80mm x 60m',
      metersPerRoll: 60,
      coreSize: '12mm',
      unitsPerBox: 60,
      costPerRoll: '$1.800',
      stock: 8000,
      minStock: 3000,
      lastOrder: '2025-02-15',
      nextOrder: '2025-03-10'
    }
  ];

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestión de Insumos
          </h1>
          <p className="text-gray-600 mt-1">Control de inventario y proveedores</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Proveedores Activos</p>
                <h3 className="text-3xl font-bold" style={{ color: '#0071CE' }}>2</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 113, 206, 0.1)' }}>
                <Truck className="w-6 h-6" style={{ color: '#0071CE' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tipos de Papel</p>
                <h3 className="text-3xl font-bold" style={{ color: '#FFC220' }}>2</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 194, 32, 0.1)' }}>
                <Package className="w-6 h-6" style={{ color: '#FFC220' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stock Óptimo</p>
                <h3 className="text-3xl font-bold text-green-600">100%</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pedidos Pendientes</p>
                <h3 className="text-3xl font-bold" style={{ color: '#1B4D89' }}>2</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(27, 77, 137, 0.1)' }}>
                <Calendar className="w-6 h-6" style={{ color: '#1B4D89' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Supplies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {supplies.map(supply => (
            <Card key={supply.id} className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{supply.category}</h3>
                  <p className="text-sm text-gray-600 mt-1">{supply.vendor}</p>
                </div>
                <Badge 
                  className="px-3 py-1" 
                  style={{ 
                    backgroundColor: supply.stock > supply.minStock ? '#10b981' : '#f59e0b',
                    color: 'white'
                  }}
                >
                  {supply.stock > supply.minStock ? 'Stock OK' : 'Stock Bajo'}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Calidad</p>
                    <p className="font-semibold text-gray-800">{supply.quality}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Metros/Rollo</p>
                    <p className="font-semibold text-gray-800">{supply.metersPerRoll}m</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Dimensiones</p>
                    <p className="font-semibold text-gray-800">{supply.rollDimensions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Unidades/Caja</p>
                    <p className="font-semibold text-gray-800">{supply.unitsPerBox}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Costo/Rollo</p>
                    <p className="font-semibold" style={{ color: '#0071CE' }}>{supply.costPerRoll}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Stock Actual</p>
                    <p className="font-semibold text-gray-800">{supply.stock.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Stock Mínimo</p>
                    <p className="font-semibold text-gray-600">{supply.minStock.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Último Pedido:</span>
                  <span className="font-semibold">{supply.lastOrder}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Próximo Pedido:</span>
                  <span className="font-semibold" style={{ color: '#FFC220' }}>{supply.nextOrder}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                style={{ backgroundColor: '#0071CE' }}
              >
                Realizar Pedido
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SuppliesPage;