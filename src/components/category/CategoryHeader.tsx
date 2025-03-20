
import React from 'react';

interface CategoryHeaderProps {
  name: string;
  description: string;
}

const CategoryHeader = ({ name, description }: CategoryHeaderProps) => {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-display font-semibold">{name}</h1>
      <p className="text-muted-foreground mt-2 max-w-3xl">{description}</p>
    </div>
  );
};

export default CategoryHeader;
