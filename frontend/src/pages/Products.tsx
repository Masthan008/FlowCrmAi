import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Package } from 'lucide-react';

const Products: React.FC = () => {
  const breadcrumbs = [{ label: 'Products' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Products</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Products Cataloged"
          description="Manage your inventory and price books here. Add products or services that you offer."
          icon={<Package className="w-12 h-12 text-slate-350" />}
          actionLabel="Add Product"
          onAction={() => console.log('Add Product clicked')}
        />
      </div>
    </div>
  );
};

export default Products;
