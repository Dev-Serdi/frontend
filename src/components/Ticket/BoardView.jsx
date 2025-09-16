import React, {memo} from "react";
import Card from "./Card";
import PropTypes from "prop-types";

const BoardView = ({ tickets, fetchTickets, userId }) => {
  const usuarioId = userId;
  // En tu componente padre
  const handleTicketStatusChange = () => {
    // Actualizar la lista de tickets
    fetchTickets();
  };

  return (
    <div className=" w-full pb-2 pt-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 2xl:gap-5">
      {tickets.map((ticket) => (
        <Card
          userId={usuarioId}
          key={ticket.id}
          ticket={ticket}
          onTicketStatusChange={handleTicketStatusChange}
          // onTicketDelete={handleTicketDelete}
        />
      ))}
    </div>
  );
};

// Add prop type validation
BoardView.propTypes = {
  tickets: PropTypes.array,
  fetchTickets: PropTypes.func,
  userId: PropTypes.number,
}

export default memo(BoardView);
