
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
    <div className="mb-6 flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(backUrl)}
        className="h-9 w-9"
      >
        <ArrowLeft size={18} />
      </Button>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
};

export default FormHeader;
