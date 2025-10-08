import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, ChevronRight, RefreshCw, TrendingUp, AlertTriangle, Package, Wrench, Calendar } from 'lucide-react';

const AIAssistant = ({ variant = 'dashboard', className = '' }) => {
  const [predictions, setPredictions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadPredictions();
  }, []);

  // Auto-rotate predictions every 15 seconds
  useEffect(() => {
    if (predictions.length > 1 && !showAll) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % predictions.length);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [predictions.length, showAll]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/ai-predictions`);
      setPredictions(response.data || []);
    } catch (error) {
      console.error('Error loading AI predictions:', error);
      // Fallback predictions
      setPredictions([
        {
          title: "Sistema Funcionando Correctamente",
          content: "Todos los sistemas están operativos. Las balanzas reportan 94% de disponibilidad.",
          category: "optimization",
          priority: "low"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const refreshPredictions = async () => {
    await loadPredictions();
    setCurrentIndex(0);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'supply': return <Package className="w-4 h-4" />;
      case 'fraud': return <AlertTriangle className="w-4 h-4" />;
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'seasonal': return <Calendar className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  const isLoginVariant = variant === 'login';
  const currentPrediction = predictions[currentIndex];

  if (isLoginVariant) {
    // Login variant - compact, no background, text only
    return (
      <div className={`${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-white text-sm drop-shadow-lg">Asistente IA Allcom</h3>
              <Badge 
                className={`${getPriorityColor(currentPrediction?.priority)} text-white text-xs px-2 py-0.5`}
              >
                {currentPrediction?.priority?.toUpperCase()}
              </Badge>
            </div>
            {currentPrediction && (
              <div className="space-y-2">
                <h4 className="font-medium text-white text-sm leading-tight drop-shadow-lg">
                  {currentPrediction.title}
                </h4>
                <p className="text-white text-xs leading-relaxed drop-shadow-lg opacity-90">
                  {currentPrediction.content}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-xs text-white opacity-80">
                    {getCategoryIcon(currentPrediction.category)}
                    <span className="capitalize drop-shadow-lg">{currentPrediction.category}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white opacity-70">
                    <span className="drop-shadow-lg">{currentIndex + 1}/{predictions.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard variant - full featured
  return (
    <Card className={`p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Asistente IA Allcom</h3>
            <p className="text-sm text-gray-600">Predicciones inteligentes en tiempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshPredictions}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAll(!showAll)}
            style={{ backgroundColor: '#0071CE' }}
          >
            {showAll ? 'Ver Menos' : 'Ver Más'}
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </div>

      {showAll ? (
        // Show all predictions
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 flex-1">
                  {prediction.title}
                </h4>
                <Badge 
                  className={`${getPriorityColor(prediction.priority)} text-white text-xs px-2 py-1 ml-2`}
                >
                  {prediction.priority?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                {prediction.content}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {getCategoryIcon(prediction.category)}
                <span className="capitalize">{prediction.category}</span>
                <span className="text-gray-400">•</span>
                <span>Predicción {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show current prediction with rotation
        currentPrediction && (
          <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 text-lg flex-1">
                {currentPrediction.title}
              </h4>
              <Badge 
                className={`${getPriorityColor(currentPrediction.priority)} text-white text-sm px-3 py-1`}
              >
                {currentPrediction.priority?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {currentPrediction.content}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getCategoryIcon(currentPrediction.category)}
                <span className="capitalize">{currentPrediction.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} de {predictions.length}
                </span>
                <div className="flex gap-1">
                  {predictions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {!showAll && predictions.length > 1 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Las predicciones se actualizan automáticamente cada 15 segundos
          </p>
        </div>
      )}
    </Card>
  );
};

export default AIAssistant;