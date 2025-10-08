import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileText, Download, Calendar, Filter, Clock, User, Settings } from 'lucide-react';

const ReportsPage = ({ onLogout }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportType, setReportType] = useState('general');

  const handleExportPDF = () => {
    toast.success('Exportando reporte en PDF...');
    setTimeout(() => {
      toast.success('Reporte PDF generado exitosamente');
    }, 1500);
  };

  const handleExportExcel = () => {
    toast.success('Exportando reporte en Excel...');
    setTimeout(() => {
      toast.success('Reporte Excel generado exitosamente');
    }, 1500);
  };

  const auditLogs = [
    {
      id: 1,
      user: 'admin@walmart.cl',
      action: 'Desplegó campaña "Verano Saludable 2025"',
      timestamp: '2025-02-15 14:32:18',
      module: 'Campañas'
    },
    {
      id: 2,
      user: 'admin@walmart.cl',
      action: 'Actualizó firmware en balanza SAP-1015',
      timestamp: '2025-02-15 13:15:42',
      module: 'OpenManager'
    },
    {
      id: 3,
      user: 'admin@walmart.cl',
      action: 'Programó mantenimiento preventivo',
      timestamp: '2025-02-15 11:20:05',
      module: 'Mantenimiento'
    },
    {
      id: 4,
      user: 'admin@walmart.cl',
      action: 'Reinició balanza en Sucursal 5 - Ñuñoa',
      timestamp: '2025-02-14 16:48:33',
      module: 'OpenManager'
    },
    {
      id: 5,
      user: 'admin@walmart.cl',
      action: 'Exportó reporte de transacciones',
      timestamp: '2025-02-14 09:12:20',
      module: 'Reportes'
    }
  ];

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Reportes y Auditoría
          </h1>
          <p className="text-gray-600 mt-1">Generación de informes y registro de acciones</p>
        </div>

        {/* Report Generator */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generar Reporte
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="reportType">Tipo de Reporte</Label>
              <select 
                id="reportType"
                className="w-full px-4 py-2 border rounded-lg mt-1"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="general">General - Todos los locales</option>
                <option value="transactions">Transacciones por local</option>
                <option value="weights">Pesos y productos</option>
                <option value="errors">Errores y fallos</option>
                <option value="maintenance">Historial de mantenimiento</option>
                <option value="campaigns">Efectividad de campañas</option>
              </select>
            </div>
            <div>
              <Label htmlFor="storeFilter">Filtrar por Local</Label>
              <select 
                id="storeFilter"
                className="w-full px-4 py-2 border rounded-lg mt-1"
              >
                <option value="all">Todos los locales</option>
                <option value="online">Solo locales en línea</option>
                <option value="partial">Solo locales parciales</option>
                <option value="offline">Solo locales offline</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input 
                id="dateFrom"
                type="date"
                className="mt-1"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input 
                id="dateTo"
                type="date"
                className="mt-1"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1"
              style={{ backgroundColor: '#79b9e7' }}
              onClick={handleExportPDF}
            >
              <Download size={18} className="mr-2" />
              Exportar PDF
            </Button>
            <Button 
              className="flex-1"
              style={{ backgroundColor: '#10b981' }}
              onClick={handleExportExcel}
            >
              <Download size={18} className="mr-2" />
              Exportar Excel
            </Button>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reportes Generados</p>
                <h3 className="text-3xl font-bold text-gray-800">247</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                <FileText className="w-6 h-6" style={{ color: '#79b9e7' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Acciones Registradas</p>
                <h3 className="text-3xl font-bold text-gray-800">1,542</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6" style={{ color: '#f47421' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Usuarios Activos</p>
                <h3 className="text-3xl font-bold text-gray-800">8</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Config. Guardadas</p>
                <h3 className="text-3xl font-bold text-gray-800">34</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Audit Log */}
        <Card className="p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Registro de Auditoría
            </h3>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>Todas las acciones</option>
                <option>Campañas</option>
                <option>OpenManager</option>
                <option>Mantenimiento</option>
                <option>Reportes</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acción</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Módulo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                          <User size={16} style={{ color: '#79b9e7' }} />
                        </div>
                        <span className="text-sm text-gray-700">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{log.timestamp}</td>
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

export default ReportsPage;