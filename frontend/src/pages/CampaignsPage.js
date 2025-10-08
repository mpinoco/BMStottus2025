import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Calendar, Image, Play, Pause, Eye, TrendingUp } from 'lucide-react';

const CampaignsPage = ({ onLogout }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    start_date: '',
    end_date: '',
    wallpaper_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await axios.get(`${API}/campaigns`);
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Error al cargar campañas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const campaignData = {
        ...newCampaign,
        status: 'scheduled',
        deployed_count: 0,
        total_balances: 40,
        stores_applied: []
      };
      
      await axios.post(`${API}/campaigns`, campaignData);
      toast.success('Campaña creada exitosamente');
      setIsDialogOpen(false);
      setNewCampaign({
        name: '',
        start_date: '',
        end_date: '',
        wallpaper_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
      });
      loadCampaigns();
    } catch (error) {
      toast.error('Error al crear campaña');
      console.error(error);
    }
  };

  const handleDeployCampaign = async (campaignId) => {
    try {
      await axios.put(`${API}/campaigns/${campaignId}`, {
        status: 'active',
        deployed_count: 40
      });
      toast.success('Campaña desplegada exitosamente');
      loadCampaigns();
    } catch (error) {
      toast.error('Error al desplegar campaña');
    }
  };

  const handlePauseCampaign = async (campaignId) => {
    try {
      await axios.put(`${API}/campaigns/${campaignId}`, {
        status: 'scheduled'
      });
      toast.success('Campaña pausada');
      loadCampaigns();
    } catch (error) {
      toast.error('Error al pausar campaña');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activa' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Programada' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Vencida' }
    };
    const style = styles[status] || styles.scheduled;
    return (
      <Badge className={`${style.bg} ${style.text}`}>
        {style.label}
      </Badge>
    );
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

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Gestión de Campañas
            </h1>
            <p className="text-gray-600 mt-1">Administra wallpapers y campañas de marketing</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: '#79b9e7' }}>
                <Plus size={20} className="mr-2" />
                Nueva Campaña
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Campaña</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nombre de la Campaña</Label>
                  <Input 
                    id="name"
                    placeholder="Ej: Promoción Verano 2025"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Fecha de Inicio</Label>
                    <Input 
                      id="start_date"
                      type="date"
                      value={newCampaign.start_date}
                      onChange={(e) => setNewCampaign({...newCampaign, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Fecha de Término</Label>
                    <Input 
                      id="end_date"
                      type="date"
                      value={newCampaign.end_date}
                      onChange={(e) => setNewCampaign({...newCampaign, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="wallpaper">URL del Wallpaper</Label>
                  <Input 
                    id="wallpaper"
                    placeholder="https://..."
                    value={newCampaign.wallpaper_url}
                    onChange={(e) => setNewCampaign({...newCampaign, wallpaper_url: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Puedes usar imágenes de muestra de Unsplash</p>
                </div>
                {newCampaign.wallpaper_url && (
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={newCampaign.wallpaper_url} 
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/800x400?text=Preview+No+Disponible'}
                    />
                  </div>
                )}
                <Button 
                  className="w-full"
                  style={{ backgroundColor: '#79b9e7' }}
                  onClick={handleCreateCampaign}
                  disabled={!newCampaign.name || !newCampaign.start_date || !newCampaign.end_date}
                >
                  Crear Campaña
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <Card key={campaign.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              {/* Campaign Image */}
              <div className="relative h-48 bg-gray-200">
                <img 
                  src={campaign.wallpaper_url}
                  alt={campaign.name}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'}
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(campaign.status)}
                </div>
              </div>

              {/* Campaign Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{campaign.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Inicio: {campaign.start_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Fin: {campaign.end_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    <span>Desplegada: {campaign.deployed_count}/{campaign.total_balances} locales</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${(campaign.deployed_count / campaign.total_balances) * 100}%`,
                      backgroundColor: '#79b9e7'
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {campaign.status === 'scheduled' && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      style={{ backgroundColor: '#10b981' }}
                      onClick={() => handleDeployCampaign(campaign.id)}
                    >
                      <Play size={16} className="mr-1" />
                      Desplegar
                    </Button>
                  )}
                  {campaign.status === 'active' && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      style={{ backgroundColor: '#f59e0b' }}
                      onClick={() => handlePauseCampaign(campaign.id)}
                    >
                      <Pause size={16} className="mr-1" />
                      Pausar
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(campaign.wallpaper_url, '_blank')}
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CampaignsPage;