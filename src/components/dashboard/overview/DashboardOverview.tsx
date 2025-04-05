
import React from 'react';
import { Calendar, MessageCircle, Package, Users, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsOverview from '../stats/StatsOverview';
import MonthlyStatsChart from '../stats/MonthlyStatsChart';
import { chartConfig } from '@/presentation/config/chartConfig';
import { MOCK_STATS } from '@/infrastructure/repositories/mock-data/statsMockData';
import { useCompanyStats } from '@/application/hooks/useCompanyStats';

const DashboardOverview = () => {
  const { stats, isLoading } = useCompanyStats();
  
  // Ensure we always have data to display even if loading
  const viewsData = !isLoading && stats?.monthlyViews ? stats.monthlyViews : MOCK_STATS.monthlyViews;
  const rentalsData = !isLoading && stats?.monthlyRentals ? stats.monthlyRentals : MOCK_STATS.monthlyRentals;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resumen</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalRentals || 12}</div>
            <p className="text-xs text-muted-foreground">
              3 agregados esta semana
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alquileres</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalRentals || 8}</div>
            <p className="text-xs text-muted-foreground">
              2 pendientes de aprobación
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              2 sin leer
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalViews || MOCK_STATS.productViews}</div>
            <p className="text-xs text-muted-foreground">
              +12% respecto a ayer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Upcoming Events - Moved above charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Nuevo alquiler recibido</p>
              <p className="text-xs text-muted-foreground">Hace 2 horas</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Mensaje de cliente</p>
              <p className="text-xs text-muted-foreground">Hace 5 horas</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Producto actualizado</p>
              <p className="text-xs text-muted-foreground">Ayer</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Entrega de producto</p>
              <p className="text-xs text-muted-foreground">Mañana a las 10:00</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Recogida de producto</p>
              <p className="text-xs text-muted-foreground">Miércoles a las 15:00</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Llamada con cliente</p>
              <p className="text-xs text-muted-foreground">Viernes a las 12:00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Charts - Full width, one per row */}
      <div className="space-y-6">
        <Card className="w-full overflow-hidden">
          <CardHeader>
            <CardTitle>Vistas Mensuales</CardTitle>
            <p className="text-sm text-muted-foreground">Historial de vistas por día</p>
          </CardHeader>
          <CardContent className="p-0 h-[400px]">
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
        
        <Card className="w-full overflow-hidden">
          <CardHeader>
            <CardTitle>Alquileres Mensuales</CardTitle>
            <p className="text-sm text-muted-foreground">Historial de alquileres por día</p>
          </CardHeader>
          <CardContent className="p-0 h-[400px]">
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
      </div>
    </div>
  );
};

export default DashboardOverview;
