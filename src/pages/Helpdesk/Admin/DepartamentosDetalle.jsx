import React from "react";
import { useParams } from "react-router-dom";
import { UsuariosTableGeneric } from "../../../components/Generic/UsuariosTableGeneric";
import { TicketTableGeneric } from "../../../components/Generic/TicketTableGeneric";

export const DepartamentosDetalle = () => {
  const { id } = useParams();
  return (
    <div className="container mx-auto px-5 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* --- SECCIÓN DE USUARIOS --- */}
      <UsuariosTableGeneric id={id}/>
      <TicketTableGeneric id ={id}/>
    </div>
  );
  
};

