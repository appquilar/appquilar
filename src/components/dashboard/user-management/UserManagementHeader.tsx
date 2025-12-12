import React from "react";

const UserManagementHeader: React.FC = () => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-display font-semibold">
                    Gestión de usuarios
                </h1>
                <p className="text-muted-foreground">
                    Consulta y administra los usuarios de la plataforma.
                </p>
            </div>
        </div>
    );
};

export default UserManagementHeader;
