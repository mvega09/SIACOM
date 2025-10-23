import { useEffect, useState } from "react";
import { FamilyAPI } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function FamilyDashboard() {
  const [patientData, setPatientData] = useState(null);
  const [surgeryStatus, setSurgeryStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientId = localStorage.getItem("patient_id");
        const res = await FamilyAPI.get(`/family/patient/${patientId}`);
        setPatientData(res.data.patient);
        setSurgeryStatus(res.data.surgery_status);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchPatientData();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("family_token");
    localStorage.removeItem("patient_id");
    navigate("/family/login");
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portal Familiar SIACOM</h1>
                <p className="text-sm text-gray-500">Estado del paciente en tiempo real</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del Paciente */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Información del Paciente</h2>
            <div className="text-sm text-gray-500">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{patientData?.name || "Nombre del Paciente"}</h3>
              <p className="text-gray-600">Paciente</p>
            </div>
            
            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{patientData?.age || "Edad"}</h3>
              <p className="text-gray-600">Años</p>
            </div>
            
            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{patientData?.surgery_type || "Tipo de Cirugía"}</h3>
              <p className="text-gray-600">Procedimiento</p>
            </div>
          </div>
        </div>

        {/* Estado de la Cirugía */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado Actual */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Estado Actual</h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${getStatusColor(surgeryStatus?.current_status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-current"></div>
                    <span className="font-semibold">{getStatusText(surgeryStatus?.current_status)}</span>
                  </div>
                  <span className="text-sm opacity-75">
                    {surgeryStatus?.current_status_time ? 
                      new Date(surgeryStatus.current_status_time).toLocaleTimeString() : 
                      "N/A"
                    }
                  </span>
                </div>
              </div>

              {/* Progreso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progreso de la Cirugía</span>
                  <span>{surgeryStatus?.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${surgeryStatus?.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Tiempo transcurrido */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Tiempo transcurrido:</span>
                  <span>{surgeryStatus?.elapsed_time || "00:00"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Información Médica</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-semibold text-blue-800">Frecuencia Cardíaca</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{surgeryStatus?.heart_rate || "---"} <span className="text-sm">bpm</span></p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                    </svg>
                    <span className="font-semibold text-green-800">Presión Arterial</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{surgeryStatus?.blood_pressure || "---/---"} <span className="text-sm">mmHg</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-semibold text-purple-800">Temperatura</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{surgeryStatus?.temperature || "---"} <span className="text-sm">°C</span></p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-semibold text-orange-800">Saturación O2</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{surgeryStatus?.oxygen_saturation || "---"} <span className="text-sm">%</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {surgeryStatus?.notifications && surgeryStatus.notifications.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Notificaciones Recientes</h3>
            <div className="space-y-3">
              {surgeryStatus.notifications.map((notification, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800">{notification.message}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de Contacto */}
        <div className="mt-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <h3 className="text-xl font-bold">¿Necesitas ayuda?</h3>
          </div>
          <p className="text-blue-100 mb-4">
            Si tienes alguna pregunta o necesitas información adicional sobre el estado de tu ser querido, 
            no dudes en contactar con nuestro equipo médico.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Tel: (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Piso 3, Sala de Espera</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
