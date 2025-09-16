import React from 'react';

const CardLayout = ({ title, children }) => {
  return (
    <div className="mt-4">
      <div className="row p-5 pt-0 justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h1 className="h4 mb-0">{title}</h1>
            </div>
            <div className="card-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardLayout;