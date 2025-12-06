import React from 'react';
import {Calendar, Eye, MessageCircle, Package} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import MonthlyStatsChart from '../stats/MonthlyStatsChart';
import {chartConfig} from '@/presentation/config/chartConfig';
import {MOCK_STATS} from '@/infrastructure/repositories/mock-data/statsMockData';
import {useCompanyStats} from '@/application/hooks/useCompanyStats';
import {Link} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import {UserRole} from '@/domain/models/UserRole';

const DashboardOverview = () => {
    const { stats, isLoading } = useCompanyStats();
    const { currentUser } = useAuth();

    // Roles del usuario actual
    const roles = currentUser?.roles ?? [];
    const isAdmin = roles.includes(UserRole.ADMIN);
    const isRegularUser = roles.includes(UserRole.REGULAR_USER);

    // Ensure we always have data to display even if loading
    const viewsData =
        !isLoading && stats?.monthlyViews
            ? stats.monthlyViews
            : MOCK_STATS.monthlyViews;

    const rentalsData =
        !isLoading && stats?.monthlyRentals
            ? stats.monthlyRentals
            : MOCK_STATS.monthlyRentals;

    return (
        <div className="space-y-6">
            {/* Cabecera del dashboard */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl sm:text-2xl font-bold">Resumen</h1>

                {/* Ejemplo de badge de rol */}
                {isAdmin && (
                    <span className="rounded-full border px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50">
            Admin
          </span>
                )}
            </div>

            {/* Tarjetas de KPIs principales: visibles para cualquier usuario logado */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Productos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : stats?.totalProducts ?? 12}
                        </div>
                        <p className="text-xs text-emerald-600">3 agregados esta semana</p>
                    </CardContent>
                </Card>

                {/* Alquileres */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alquileres</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : stats?.totalRentals ?? 8}
                        </div>
                        <p className="text-xs text-emerald-600">
                            2 pendientes de aprobación
                        </p>
                    </CardContent>
                </Card>

                {/* Mensajes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-red-600">2 sin leer</p>
                    </CardContent>
                </Card>

                {/* Visitas */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitas</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : stats?.totalViews ?? MOCK_STATS.productViews}
                        </div>
                        <p className="text-xs text-emerald-600">
                            +12% respecto a ayer
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Actividad y próximos eventos */}
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {/* Actividad reciente: visible para cualquier usuario logado */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link
                            to="/dashboard/rentals/new-rental"
                            className="block hover:bg-muted transition-colors rounded-md p-2 -mx-2"
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Nuevo alquiler recibido</p>
                                <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                            </div>
                        </Link>
                        <Link
                            to="/dashboard/messages"
                            className="block hover:bg-muted transition-colors rounded-md p-2 -mx-2"
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Mensaje de cliente</p>
                                <p className="text-xs text-muted-foreground">Hace 5 horas</p>
                            </div>
                        </Link>
                        <Link
                            to="/dashboard/products"
                            className="block hover:bg-muted transition-colors rounded-md p-2 -mx-2"
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Producto actualizado</p>
                                <p className="text-xs text-muted-foreground">Ayer</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Próximos eventos: por ejemplo, solo admins */}
                {isAdmin && (
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Próximos Eventos (admin)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Entrega de producto</p>
                                <p className="text-xs text-muted-foreground">
                                    Mañana a las 10:00
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Recogida de producto</p>
                                <p className="text-xs text-muted-foreground">
                                    Miércoles a las 15:00
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Llamada con cliente</p>
                                <p className="text-xs text-muted-foreground">
                                    Viernes a las 12:00
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Si quieres que los REGULAR_USER vean algo distinto a los admin */}
                {isRegularUser && !isAdmin && (
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Próximos pasos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Publica más productos y activa las notificaciones para no perderte
                                ningún alquiler.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Gráficas */}
            <div className="space-y-6">
                {/* Gráfica vistas mensuales: visible para todos */}
                <Card className="w-full overflow-hidden">
                    <CardHeader>
                        <CardTitle>Vistas Mensuales</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Historial de vistas por día
                        </p>
                    </CardHeader>
                    <CardContent className="p-0 h-[350px] sm:h-[400px]">
                        <MonthlyStatsChart
                            title=""
                            description=""
                            data={viewsData}
                            dataKey="views"
                            chartColor="#0ea5e9"
                            label="Vistas"
                            config={chartConfig}
                        />
                    </CardContent>
                </Card>

                {/* Gráfica de alquileres mensuales: solo admins */}
                {isAdmin && (
                    <Card className="w-full overflow-hidden">
                        <CardHeader>
                            <CardTitle>Alquileres Mensuales (admin)</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Historial de alquileres por día
                            </p>
                        </CardHeader>
                        <CardContent className="p-0 h-[350px] sm:h-[400px]">
                            <MonthlyStatsChart
                                title=""
                                description=""
                                data={rentalsData}
                                dataKey="rentals"
                                chartColor="#10b981"
                                label="Alquileres"
                                config={chartConfig}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default DashboardOverview;
