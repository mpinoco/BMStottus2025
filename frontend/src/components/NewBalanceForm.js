import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const NewBalanceForm = ({ stores, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    localSAP: '',
    address: '',
    comuna: '',
    type: 'AUTOSERVICIO',
    serialNumber: '',
    installationDate: new Date().toISOString().split('T')[0],
    provider: 'Balanzas Chile S.A.',
    checklist: {
      calibrated: false,
      leveled: false,
      cablesSecured: false,
      desirableHeight: false,
      firmwareUpdated: false
    },
    ipAddress: '',
    macAddress: '',
    marquesKey: ''
  });

  const providers = [
    'Balanzas Chile S.A.',
    'Allcom IA Systems',
    'TechScale Ltda.',
    'Precision Systems'
  ];

  const handleLocalChange = (sapCode) => {
    const selectedStore = stores.find(s => s.sap_code === sapCode);
    if (selectedStore) {
      setFormData({
        ...formData,
        localSAP: sapCode,
        address: selectedStore.address,
        comuna: selectedStore.comuna
      });
    }
  };

  const handleChecklistChange = (field) => {
    setFormData({
      ...formData,
      checklist: {
        ...formData.checklist,
        [field]: !formData.checklist[field]
      }
    });
  };

  const validateForm = () => {
    if (!formData.localSAP) {
      toast.error('Debe seleccionar un local');
      return false;
    }
    if (!formData.serialNumber || formData.serialNumber.length < 8) {
      toast.error('Número de serie inválido (mínimo 8 caracteres)');
      return false;
    }
    if (formData.marquesKey && formData.marquesKey.length !== 12) {
      toast.error('La clave Marques debe tener exactamente 12 caracteres hexadecimales');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const selectedStore = stores.find(s => s.sap_code === formData.localSAP);
    const newBalance = {
      ...formData,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      storeComuna: selectedStore.comuna,
      status: 'online',
      firmware_version: formData.checklist.firmwareUpdated ? 'v2.3.1' : 'v2.2.5',
      last_calibration: formData.checklist.calibrated ? new Date().toISOString() : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      avg_consumption: 1.8,
      label_status: 'good',
      printhead_life: 100
    };

    onSave(newBalance);
  };

  const checklistComplete = Object.values(formData.checklist).filter(Boolean).length;
  const checklistTotal = Object.keys(formData.checklist).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Configurar Nueva Balanza
            </h2>
            <p className="text-gray-600 text-sm">Complete todos los campos para registrar el equipo</p>
          </div>
        </div>
        <Badge 
          className="px-4 py-2"
          style={{ 
            backgroundColor: checklistComplete === checklistTotal ? '#10b981' : '#f59e0b',
            color: 'white'
          }}
        >
          Checklist: {checklistComplete}/{checklistTotal}
        </Badge>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 - Información del Local */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-8" style={{ backgroundColor: '#0071CE' }} />
            Información del Local
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="localSAP" className="text-sm font-medium">
                Local SAP <span className="text-red-500">*</span>
              </Label>
              <select
                id="localSAP"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                value={formData.localSAP}
                onChange={(e) => handleLocalChange(e.target.value)}
              >
                <option value="">Seleccione un local...</option>
                {stores.map(store => (
                  <option key={store.id} value={store.sap_code}>
                    {store.sap_code} - {store.name} ({store.comuna})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-1 text-sm"
                placeholder="Dirección del local"
              />
            </div>

            <div>
              <Label htmlFor="comuna" className="text-sm font-medium">Comuna</Label>
              <Input
                id="comuna"
                value={formData.comuna}
                onChange={(e) => setFormData({...formData, comuna: e.target.value})}
                className="mt-1 text-sm"
                placeholder="Comuna"
              />
            </div>
          </div>
        </Card>

        {/* Column 2 - Datos del Equipo */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-8" style={{ backgroundColor: '#FFC220' }} />
            Datos del Equipo
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type" className="text-sm font-medium">
                Tipo de Balanza <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="AUTOSERVICIO">Autoservicio</option>
                <option value="BMS_ASISTIDA">Modo Asistida</option>
                <option value="IA">Balanza IA</option>
              </select>
            </div>

            <div>
              <Label htmlFor="serialNumber" className="text-sm font-medium">
                Número de Serie <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value.toUpperCase()})}
                className="mt-1 text-sm font-mono"
                placeholder="BMCL-9E998776"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">Formato: BMCL-XXXXXXXX</p>
            </div>

            <div>
              <Label htmlFor="installationDate" className="text-sm font-medium">
                Fecha de Instalación
              </Label>
              <Input
                id="installationDate"
                type="date"
                value={formData.installationDate}
                onChange={(e) => setFormData({...formData, installationDate: e.target.value})}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="provider" className="text-sm font-medium">Proveedor</Label>
              <select
                id="provider"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
              >
                {providers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Column 3 - Datos Técnicos y Checklist */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-8" style={{ backgroundColor: '#1B4D89' }} />
            Datos Técnicos
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ipAddress" className="text-sm font-medium">Dirección IP</Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
                className="mt-1 text-sm font-mono"
                placeholder="192.168.1.100"
              />
            </div>

            <div>
              <Label htmlFor="macAddress" className="text-sm font-medium">Dirección MAC</Label>
              <Input
                id="macAddress"
                value={formData.macAddress}
                onChange={(e) => setFormData({...formData, macAddress: e.target.value.toUpperCase()})}
                className="mt-1 text-sm font-mono"
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </div>

            <div>
              <Label htmlFor="marquesKey" className="text-sm font-medium">Clave Marques (Key)</Label>
              <Input
                id="marquesKey"
                value={formData.marquesKey}
                onChange={(e) => setFormData({...formData, marquesKey: e.target.value.toUpperCase()})}
                className="mt-1 text-sm font-mono"
                placeholder="A1B2C3D4E5F6"
                maxLength={12}
              />
              <p className="text-xs text-gray-500 mt-1">12 caracteres hexadecimales</p>
            </div>

            {/* Checklist */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-3 block">Condiciones de Instalación</Label>
              <div className="space-y-2">
                {[
                  { key: 'calibrated', label: 'Calibrada' },
                  { key: 'leveled', label: 'Nivelada' },
                  { key: 'cablesSecured', label: 'Cables amarrados' },
                  { key: 'desirableHeight', label: 'Altura deseable' },
                  { key: 'firmwareUpdated', label: 'Firmware actualizado' }
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={formData.checklist[item.key]}
                      onChange={() => handleChecklistChange(item.key)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#0071CE' }}
                    />
                    <label htmlFor={item.key} className="text-sm text-gray-700 flex items-center gap-2">
                      {formData.checklist[item.key] && <CheckCircle2 size={14} className="text-green-600" />}
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="p-6 shadow-lg">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6"
          >
            <X size={18} className="mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-6"
            style={{ backgroundColor: '#0071CE', color: 'white' }}
          >
            <Save size={18} className="mr-2" />
            Guardar Balanza
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NewBalanceForm;
