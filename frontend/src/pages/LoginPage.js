import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AIAssistant from '@/components/AIAssistant';

const LoginPage = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundImage: 'url(/images/login-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black opacity-30" />

      {/* Contenido */}
      <div className="relative z-10 w-full flex">
        {/* Columna Izquierda - Welcome */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16">
          <div>
            {/* Logo Walmart */}
            <div className="mb-12">
              <img 
                src="https://customer-assets.emergentagent.com/job_scale-manager-2/artifacts/82tx75n1_logowalmart.png" 
                alt="Walmart Logo" 
                className="h-16 w-auto"
              />
            </div>

            {/* AI Assistant - Moved up */}
            <div className="mt-8">
              <AIAssistant variant="login" className="max-w-md" />
            </div>

            {/* Welcome Message */}
            <div className="mt-8">
              <h1 className="text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}>
                Bienvenido
                <br />
                de nuevo
              </h1>
              <p className="text-white text-lg leading-relaxed max-w-md opacity-90">
                Sistema integral de gestión de balanzas para Walmart Chile. 
                Controla, monitorea y optimiza tu red de equipos en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-end p-8 pr-16">
          <div className="w-full max-w-xs">
            {/* Título del formulario - Sin cuadro */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white mb-1 drop-shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                Iniciar Sesión
              </h2>
              <p className="text-white text-xs drop-shadow-lg opacity-90">BM MANAGER</p>
            </div>

            {/* Formulario - Sin contenedor - 30% más pequeño */}
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-white text-xs font-medium drop-shadow-lg">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="mpino@allcom.cl"
                  className="mt-1 h-8 text-xs backdrop-blur-md bg-white/90 border-white/50"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-white text-xs font-medium drop-shadow-lg">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  defaultValue="4227"
                  className="mt-1 h-8 text-xs backdrop-blur-md bg-white/90 border-white/50"
                />
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-3 h-3 rounded"
                  style={{ accentColor: '#0071CE' }}
                />
                <label htmlFor="remember" className="ml-2 text-[10px] text-white drop-shadow-lg">
                  Recordarme
                </label>
              </div>

              {/* Botón de login - Color azul Walmart */}
              <Button 
                data-testid="login-button"
                type="submit"
                disabled={isLoading}
                className="w-full h-8 text-xs font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ 
                  backgroundColor: '#0071CE',
                  color: 'white'
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Iniciando...
                  </span>
                ) : (
                  'Ingresar ahora'
                )}
              </Button>

              {/* Lost password */}
              <div className="text-center pt-1">
                <a href="#" className="text-[10px] text-white drop-shadow-lg hover:opacity-80 transition-opacity">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </form>

            {/* Copyright */}
            <div className="mt-6 text-center text-[10px] text-white">
              <p className="drop-shadow-lg opacity-80">© ALLCOM IA Technologies 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;