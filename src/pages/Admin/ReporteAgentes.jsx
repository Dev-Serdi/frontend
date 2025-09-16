import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import * as XLSX from "xlsx";
import { listReportesAgentes } from "../../services/ReportesService";
import { Link } from "react-router-dom";

// Definimos el tipo para los datos del agente

export const ReporteAgentes = () => {
  const [metricas, setMetricas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await listReportesAgentes();
        const data = response.data;
        setMetricas(data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      metricas.map((item) => ({
        Agente: item.groupName,
        DepartmentName: item.departmentName,
        "Total Tickets": item.totalTickets,
        "Tickets Cerrados": item.ticketsCerrados,
        "Tickets Activos": item.ticketsActivos,
        "Tickets Sin Respuesta": item.ticketsSinRespuesta,
        "Tiempo Resolución Promedio (h)": (
          item.avgResolutionTimeHoras || 0
        ).toFixed(2),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    // Generar archivo XLSX
    XLSX.writeFile(workbook, "reporte_agentes.xlsx");
  };

  // Función para formatear el tiempo
  const formatTiempo = (horas) => {
    if (horas == null) return "NA";
    if (horas < 1) return `${Math.round(horas * 60)} min`;
    if (horas < 24) return `${horas.toFixed(1)} h`;
    return `${(horas / 24).toFixed(1)} días`;
  };

  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      className="max-w-7xl mx-auto p-4 sm: lg:p-8"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className=" p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Reporte de Métricas por Agente
          </h2>
          <button
            onClick={exportToExcel}
            className="sm:mt-0 inline-flex items-center p-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Exportar a Excel
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : metricas.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-500 text-lg">No se encontraron datos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className=" p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Agente
                  </th>
                  <th
                    scope="col"
                    className=" p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Departamento
                  </th>
                  <th
                    scope="col"
                    className=" p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Activos
                  </th>
                  <th
                    scope="col"
                    className=" p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sin respuesta
                  </th>
                  <th
                    scope="col"
                    className=" p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cerrados
                  </th>
                  <th
                    scope="col"
                    className=" p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Tickets
                  </th>
                  <th
                    scope="col"
                    className=" p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tiempo Resolución
                  </th>
                  <th
                    scope="col"
                    className=" p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Eficiencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metricas.map((agente, index) => {
                  const eficiencia =
                    agente.totalTickets > 0
                      ? (agente.ticketsCerrados / agente.totalTickets) * 100
                      : 0;

                  return (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className=" p-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-800 font-bold">
                              {agente.groupName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {agente.groupName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className=" p-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {agente.departmentName}
                        </div>
                      </td>
                      <td className=" p-4 whitespace-nowrap">
                        <span className="p-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-900">
                          {agente.ticketsActivos}
                        </span>
                      </td>
                      <td className=" p-4 whitespace-nowrap">
                        <span className="p-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-900">
                          {agente?.ticketsSinRespuesta || 0}
                        </span>
                      </td>
                      <td className=" p-4 whitespace-nowrap">
                        <span className="p-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {agente.ticketsCerrados}
                        </span>
                      </td>
                      <td className=" p-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {agente.totalTickets}
                        </div>
                      </td>
                      <td className=" p-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTiempo(agente.avgResolutionTimeHoras)}
                      </td>
                      <td className=" p-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{ width: `${eficiencia}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {eficiencia.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Transition>
  );
};
