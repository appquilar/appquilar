
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { UseFieldArrayRemove } from 'react-hook-form';

interface DeletePeriodButtonProps {
  index: number;
  remove: UseFieldArrayRemove;
}

const DeletePeriodButton: React.FC<DeletePeriodButtonProps> = ({ index, remove }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => remove(index)}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 size={18} />
    </Button>
  );
};

export default DeletePeriodButton;
