import React from "react";

export const Select = ({selectedDepartamento, onDepartamentoChange, departamentos=[]}) => {  
  return (
    <>
      {departamentos && departamentos.length > 0 && (
            <div className="relative">
              {"\t\t"}
              {/* Added relative positioning if needed for dropdown menus */}
              <select
          style={{ marginLeft: "10px" }}

                value={selectedDepartamento}
                onChange={(e) => onDepartamentoChange(e.target.value)}
                className="px-3 h-full w-fit py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white text-gray-700"
                aria-label="Filtrar por departamento"
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map((dept) => (
                  // Assuming dept has 'id' and 'name' properties
                  // Ensure key is unique, id is usually good
                  <option key={dept.id} value={dept.nombre}>
                    {dept.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
    </>
  );
};

