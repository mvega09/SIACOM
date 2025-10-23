import { useState, useEffect } from "react";

export default function PatientStatusCard({ patientId }) {
  const [status, setStatus] = useState({
    current_status: "preparacion",
    progress: 0,
    elapsed_time: "00:00",
    heart_rate: 72,
    blood_pressure: "120/80",
    temperature: 36.5,
    oxygen_saturation: 98,
    notifications: []
  });

  useEffect(() => {
    // Simular actualizaciones en tiempo real
    const interval = setInterval(() => {
      setStatus(prevStatus => {
        // Simular cambios en los valores médicos
        const newHeartRate = Math.max(60, Math.min(120, prevStatus.heart_rate + (Math.random() - 0.5) * 10));
        const newProgress = Math.min(100, prevStatus.progress + Math.random() * 2);
        
        // Simular notificaciones ocasionales
        const shouldAddNotification = Math.random() < 0.1; // 10% de probabilidad
        let newNotifications = [...prevStatus.notifications];
        
        if (shouldAddNotification) {
          const messages = [
            "Cirugía progresando normalmente",
            "Vitales estables",
            "Procedimiento en curso",
            "Todo marcha bien"
          ];
          
          newNotifications.push({
            message: messages[Math.floor(Math.random() * messages.length)],
            timestamp: new Date().toISOString()
          });
          
          // Mantener solo las últimas 5 notificaciones
          if (newNotifications.length > 5) {
            newNotifications = newNotifications.slice(-5);
          }
        }

        return {
          ...prevStatus,
          heart_rate: Math.round(newHeartRate),
          progress: Math.round(newProgress),
          notifications: newNotifications
        };
      });
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, [patientId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "preparacion": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "en_progreso": return "bg-blue-100 text-blue-800 border-blue-200";
      case "finalizada": return "bg-green-100 text-green-800 border-green-200";
      case "complicacion": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "preparacion": return "En Preparación";
      case "en_progreso": return "Cirugía en Progreso";
      case "finalizada": return "Cirugía Finalizada";
      case "complicacion": return "Complicación Detectada";
      default: return "Estado Desconocido";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Estado en Tiempo Real</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>En vivo</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Estado Actual */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(status.current_status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-current"></div>
              <span className="font-semibold">{getStatusText(status.current_status)}</span>
            </div>
            <span className="text-sm opacity-75">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progreso de la Cirugía</span>
            <span>{status.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Métricas Médicas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-semibold text-blue-800">FC</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{status.heart_rate} <span className="text-xs">bpm</span></p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
              </svg>
              <span className="text-xs font-semibold text-green-800">PA</span>
            </div>
            <p className="text-lg font-bold text-green-900">{status.blood_pressure} <span className="text-xs">mmHg</span></p>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-semibold text-purple-800">Temp</span>
            </div>
            <p className="text-lg font-bold text-purple-900">{status.temperature} <span className="text-xs">°C</span></p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs font-semibold text-orange-800">SpO2</span>
            </div>
            <p className="text-lg font-bold text-orange-900">{status.oxygen_saturation} <span className="text-xs">%</span></p>
          </div>
        </div>

        {/* Notificaciones */}
        {status.notifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Últimas actualizaciones:</h4>
            {status.notifications.slice(-2).map((notification, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded text-xs">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-blue-800">{notification.message}</p>
                  <p className="text-blue-600 text-xs">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
