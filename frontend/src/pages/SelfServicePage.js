import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, Image, Settings, Send, Loader2, Eye, Clock, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const SelfServicePage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [flowSteps, setFlowSteps] = useState([
    {
      id: 1,
      title: "Paso 1 - Bienvenido",
      description: "Imagen de bienvenida con colores corporativos",
      currentImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      selectedDemo: "bienvenido"
    },
    {
      id: 2,
      title: "Paso 2 - Pese su producto",
      description: "Foto de balanza con producto",
      currentImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      selectedDemo: "pesar"
    },
    {
      id: 3,
      title: "Paso 3 - Retire la etiqueta",
      description: "Foto de mano tomando etiqueta",
      currentImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      selectedDemo: "retirar"
    },
    {
      id: 4,
      title: "Paso 4 - Pegue la etiqueta",
      description: "Imagen amistosa de finalización",
      currentImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      selectedDemo: "finalizar"
    }
  ]);
  
  const [deploymentTarget, setDeploymentTarget] = useState('autoservicio');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStep, setPreviewStep] = useState(1);
  const [deploymentStartTime, setDeploymentStartTime] = useState(null);
  const [deploymentDuration, setDeploymentDuration] = useState(0);
  const [packageSize, setPackageSize] = useState(0);
  const [deploymentErrors, setDeploymentErrors] = useState([]);

  const demoImages = {
    bienvenido: [
      { name: "Frutas y Verduras Organizadas", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { name: "Verduras Frescas Variadas", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      { name: "Mercado de Productos Frescos", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" }
    ],
    pesar: [
      { name: "Frutas y Verduras Organizadas", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { name: "Verduras Frescas Variadas", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      { name: "Mercado de Productos Frescos", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" }
    ],
    retirar: [
      { name: "Frutas y Verduras Organizadas", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { name: "Verduras Frescas Variadas", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      { name: "Mercado de Productos Frescos", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" }
    ],
    finalizar: [
      { name: "Frutas y Verduras Organizadas", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { name: "Verduras Frescas Variadas", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      { name: "Mercado de Productos Frescos", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" }
    ]
  };

  useEffect(() => {
    loadStores();
  }, []);

  // Update deployment duration timer
  useEffect(() => {
    let interval;
    if (isDeploying && deploymentStartTime) {
      interval = setInterval(() => {
        setDeploymentDuration(Math.floor((Date.now() - deploymentStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDeploying, deploymentStartTime]);

  const loadStores = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const handleImageUpload = (stepId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateStepImage(stepId, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateStepImage = (stepId, imageUrl) => {
    setFlowSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, currentImage: imageUrl } : step
    ));
  };

  const selectDemoImage = (stepId, demoType, imageUrl) => {
    setFlowSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, currentImage: imageUrl, selectedDemo: demoType } : step
    ));
  };

  const getTargetStoresCount = () => {
    switch (deploymentTarget) {
      case 'current':
        return 1;
      case 'autoservicio':
        return stores.filter(store => store.balances_autoservicio > 0).length;
      case 'all':
        return stores.length;
      default:
        return 0;
    }
  };

  const deployFlow = async () => {
    const allStepsHaveImages = flowSteps.every(step => step.currentImage);
    if (!allStepsHaveImages) {
      toast.error('Todos los pasos deben tener una imagen seleccionada');
      return;
    }

    setIsDeploying(true);
    setDeploymentProgress(0);
    setDeploymentStartTime(Date.now());
    setDeploymentDuration(0);
    setDeploymentErrors([]);
    
    // Calculate package size (simulate based on number of images)
    const calculatedSize = flowSteps.length * 2.8; // ~2.8MB per high-quality image
    setPackageSize(calculatedSize);

    const targetCount = getTargetStoresCount();
    
    const interval = setInterval(() => {
      setDeploymentProgress(prev => {
        // Update duration
        setDeploymentDuration(Math.floor((Date.now() - deploymentStartTime) / 1000));
        
        if (prev >= targetCount) {
          clearInterval(interval);
          setIsDeploying(false);
          
          // Simulate some random errors (5% chance per store)
          const errors = [];
          for (let i = 0; i < targetCount; i++) {
            if (Math.random() < 0.05) {
              errors.push(`Local ${i + 1}: Error de conectividad`);
            }
          }
          setDeploymentErrors(errors);
          
          if (errors.length === 0) {
            toast.success(`Flujo desplegado satisfactoriamente en ${targetCount} locales`);
          } else {
            toast.warning(`Desplegado en ${targetCount - errors.length}/${targetCount} locales. ${errors.length} errores.`);
          }
          return targetCount;
        }
        return prev + 1;
      });
    }, 300);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validateConfiguration = () => {
    return flowSteps.every(step => step.currentImage);
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Configuración de Flujos de Autoservicio
            </h1>
            <p className="text-gray-600 mt-1">Personaliza las imágenes de cada paso en las balanzas de autoservicio</p>
          </div>
          <Button 
            onClick={() => setShowPreview(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Vista Previa
          </Button>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {flowSteps.map((step) => (
            <Card key={step.id} className="p-6 shadow-lg">
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">{step.title}</h3>
                  <Badge style={{ backgroundColor: '#0071CE', color: 'white' }}>
                    {step.id}/4
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">{step.description}</p>

                {/* Current Image Preview */}
                <div className="relative group">
                  <img 
                    src={step.currentImage} 
                    alt={`Paso ${step.id}`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Imagen Actual</span>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="space-y-3">
                  <Label htmlFor={`upload-${step.id}`} className="text-sm font-medium">
                    Cargar nueva imagen
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`upload-${step.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(step.id, e)}
                      className="hidden"
                    />
                    <Button
                      onClick={() => document.getElementById(`upload-${step.id}`).click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Examinar foto
                    </Button>
                  </div>
                </div>

                {/* Demo Images Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Fotos demo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {demoImages[step.selectedDemo]?.map((demo, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img 
                          src={demo.url} 
                          alt={demo.name}
                          className="w-full h-16 object-cover rounded border hover:border-blue-500 transition-colors"
                          onClick={() => selectDemoImage(step.id, step.selectedDemo, demo.url)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <span className="text-white text-xs text-center px-1">{demo.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Complete Configuration */}
        <Card className="p-6 shadow-lg">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Completar Configuración</h3>
            {validateConfiguration() ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Todos los pasos tienen imágenes configuradas</span>
              </div>
            ) : (
              <div className="text-amber-600">
                ⚠️ Faltan imágenes en algunos pasos
              </div>
            )}
          </div>
        </Card>

        {/* Deployment Section */}
        <Card className="p-6 shadow-xl border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Paquetizar y enviar a locales</h3>
                <p className="text-sm text-gray-600">Distribuye la configuración de flujos a los locales seleccionados</p>
              </div>
            </div>
            <Badge 
              className="px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: validateConfiguration() ? '#10b981' : '#f59e0b', color: 'white' }}
            >
              {validateConfiguration() ? '✓ Listo' : '⚠ Incompleto'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Control Panel */}
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border shadow-sm">
                <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configuración de Destino
                </Label>
                <Select value={deploymentTarget} onValueChange={setDeploymentTarget}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-700 text-xs">1</Badge>
                        Enviar a este local
                      </div>
                    </SelectItem>
                    <SelectItem value="autoservicio">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          {stores.filter(s => s.balances_autoservicio > 0).length}
                        </Badge>
                        Locales con autoservicio
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 text-xs">{stores.length}</Badge>
                        Todos los locales
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isDeploying ? (
                <div className="p-4 bg-white rounded-lg border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-medium">Procesando despliegue...</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 animate-pulse">
                      {deploymentProgress}/{getTargetStoresCount()}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 relative"
                      style={{ width: `${(deploymentProgress / getTargetStoresCount()) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    Conectando con locales y enviando configuraciones...
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                  <Button
                    onClick={deployFlow}
                    disabled={!validateConfiguration()}
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: validateConfiguration() ? '#0071CE' : '#9ca3af' }}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {validateConfiguration() ? 'Paquetizar y enviar' : 'Completar configuración'}
                    <Badge className="ml-2 bg-white/20 text-white text-xs">
                      {getTargetStoresCount()} locales
                    </Badge>
                  </Button>
                </div>
              )}
            </div>

            {/* Status Panel */}
            <div className="p-4 bg-white rounded-lg border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Eye className="w-3 h-3 text-white" />
                  </div>
                  Monitor de Despliegue
                </h4>
                <Badge 
                  className={`text-xs px-2 py-1 ${
                    isDeploying ? 'bg-blue-100 text-blue-700 animate-pulse' : 
                    deploymentProgress === getTargetStoresCount() && deploymentProgress > 0 ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {isDeploying ? 'En Proceso' : 
                   deploymentProgress === getTargetStoresCount() && deploymentProgress > 0 ? 'Completado' : 'Esperando'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {/* Locales Entregados */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                      deploymentProgress === getTargetStoresCount() && deploymentProgress > 0 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }`}>
                      {deploymentProgress === getTargetStoresCount() && deploymentProgress > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <Package className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Locales Procesados</span>
                      <div className="text-xs text-gray-600">Instalaciones completadas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: '#0071CE' }}>
                      {deploymentProgress}
                    </div>
                    <div className="text-sm text-gray-600">/ {getTargetStoresCount()}</div>
                  </div>
                </div>

                {/* Tiempo Total */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-sm">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Tiempo Transcurrido</span>
                      <div className="text-xs text-gray-600">Duración del proceso</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600 font-mono">
                      {isDeploying ? formatDuration(deploymentDuration) : '00:00'}
                    </div>
                    <Badge className="bg-orange-200 text-orange-800 text-xs mt-1">
                      {isDeploying ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                {/* Tamaño del Paquete */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center shadow-sm">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Tamaño del Paquete</span>
                      <div className="text-xs text-gray-600">Imágenes y configuración</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {packageSize > 0 ? `${packageSize.toFixed(1)}` : '-'}
                    </div>
                    <div className="text-sm text-gray-600">MB</div>
                  </div>
                </div>

                {/* Observaciones */}
                {(isDeploying || deploymentErrors.length > 0 || (deploymentProgress === getTargetStoresCount() && deploymentProgress > 0)) && (
                  <div className={`p-4 rounded-lg border-2 ${
                    deploymentErrors.length > 0 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        deploymentErrors.length > 0 ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        {deploymentErrors.length > 0 ? (
                          <AlertCircle className="w-4 h-4 text-white" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-semibold text-sm">
                            {deploymentErrors.length > 0 ? 'Observaciones del Proceso' : 'Estado del Despliegue'}
                          </h5>
                          <Badge className={`text-xs ${
                            deploymentErrors.length > 0 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {deploymentErrors.length > 0 ? `${deploymentErrors.length} errores` : 'Sin errores'}
                          </Badge>
                        </div>
                        {deploymentErrors.length > 0 ? (
                          <div className="text-sm text-red-700 space-y-1">
                            {deploymentErrors.slice(0, 3).map((error, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {error}
                              </div>
                            ))}
                            {deploymentErrors.length > 3 && (
                              <Badge className="bg-red-200 text-red-800 text-xs">
                                + {deploymentErrors.length - 3} errores adicionales
                              </Badge>
                            )}
                          </div>
                        ) : deploymentProgress === getTargetStoresCount() && deploymentProgress > 0 ? (
                          <div className="text-sm text-green-700 font-medium">
                            ✅ Flujo desplegado satisfactoriamente en todos los locales
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            {isDeploying ? '🔄 Enviando configuraciones a los locales...' : '⏱ Esperando inicio del despliegue'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vista Previa del Flujo de Autoservicio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {flowSteps.map((step, index) => (
                  <Button
                    key={step.id}
                    size="sm"
                    variant={previewStep === step.id ? "default" : "outline"}
                    onClick={() => setPreviewStep(step.id)}
                  >
                    Paso {step.id}
                  </Button>
                ))}
              </div>
              
              {flowSteps.map((step) => (
                previewStep === step.id && (
                  <div key={step.id} className="text-center space-y-4">
                    <img 
                      src={step.currentImage} 
                      alt={step.title}
                      className="w-full h-64 object-cover rounded-lg mx-auto"
                    />
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                )
              ))}
              
              <div className="flex justify-between pt-4">
                <Button 
                  onClick={() => setPreviewStep(Math.max(1, previewStep - 1))}
                  disabled={previewStep === 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button 
                  onClick={() => setPreviewStep(Math.min(4, previewStep + 1))}
                  disabled={previewStep === 4}
                  style={{ backgroundColor: '#0071CE' }}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SelfServicePage;