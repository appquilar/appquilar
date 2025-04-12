
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FormHeaderProps {
  title: string;
  backUrl: string;
}

const FormHeader = ({ title, backUrl }: FormHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(backUrl)}
        className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
      >
        <ArrowLeft size={18} />
      </Button>
      <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
    </div>
  );
};

export default FormHeader;
