
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
    label: string;
  };
  description?: string;
  descriptionColor?: 'positive' | 'negative' | 'neutral';
}

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  descriptionColor = 'neutral'
}: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon size={16} className="text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend ? (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className={`${trend.positive ? 'text-emerald-600' : 'text-red-600'} flex items-center mr-1`}>
              {trend.positive ? '↑' : '↓'}
              {trend.value}
            </span>
            {trend.label}
          </p>
        ) : (
          description && (
            <p className={`text-xs mt-1 ${
              descriptionColor === 'positive' ? 'text-emerald-600' : 
              descriptionColor === 'negative' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {description}
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
