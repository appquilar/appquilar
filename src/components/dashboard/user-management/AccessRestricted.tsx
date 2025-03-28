
const AccessRestricted = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-xl font-medium mb-2">Acceso Restringido</h1>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        Solo los administradores de la empresa pueden acceder a las funciones de gestión de usuarios.
      </p>
    </div>
  );
};

export default AccessRestricted;
