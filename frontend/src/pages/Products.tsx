import React, { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Package, Plus, Search, Trash2, Tag, Layers, BarChart } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  category: string;
  status: 'In Stock' | 'Out of Stock' | 'Discontinued';
  createdAt: string;
}

export const Products: React.FC = () => {
  const breadcrumbs = [{ label: 'Products' }];
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'FlowCRM AI Professional License', price: 999, sku: 'FCRM-PRO-01', category: 'Software SaaS', status: 'In Stock', createdAt: '2026-01-05' },
    { id: '2', name: 'FlowCRM AI Enterprise Custom Server', price: 4999, sku: 'FCRM-ENT-99', category: 'SaaS Platform', status: 'In Stock', createdAt: '2026-02-12' },
    { id: '3', name: 'Lead Pipeline Automation Toolkit', price: 299, sku: 'FCRM-LPA-04', category: 'Add-on module', status: 'In Stock', createdAt: '2026-03-20' },
    { id: '4', name: 'Support Portal & Knowledge Integration', price: 450, sku: 'FCRM-SPK-08', category: 'Support Tooling', status: 'Out of Stock', createdAt: '2026-04-05' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'In Stock' | 'Out of Stock'>('In Stock');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !sku.trim()) return;

    const newProduct: Product = {
      id: String(Date.now()),
      name,
      price: Number(price),
      sku,
      category: category || 'General',
      status,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts([newProduct, ...products]);
    toast.success('Product Registered', `${name} catalog successfully added.`);
    setShowAddModal(false);

    setName('');
    setPrice('');
    setSku('');
    setCategory('');
    setStatus('In Stock');
  };

  const handleDelete = (id: string, productName: string) => {
    if (confirm(`Remove product catalog "${productName}"?`)) {
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product Removed', 'Product catalog deleted.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Products</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Product</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {products.length > 0 && (
          <div className="flex max-w-sm relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products SKU or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
            />
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={products.length === 0 ? "No Products in Catalog" : "No Matches Found"}
              description={products.length === 0 ? "Create products or add SaaS subscriptions to calculate opportunity metrics." : "Adjust search parameters."}
              icon={<Package className="w-12 h-12 text-slate-300" />}
              actionLabel={products.length === 0 ? "New Product" : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                  <th className="px-4 py-2.5">Product Name</th>
                  <th className="px-4 py-2.5">SKU Number</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Price</th>
                  <th className="px-4 py-2.5">Stock Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono font-bold">{p.sku}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{p.category}</td>
                    <td className="px-4 py-3 font-black text-slate-850 dark:text-slate-100">${p.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                        p.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Add Product Catalog Item</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Define product naming and pricing rates.</p>

            <form onSubmit={handleAddProduct} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Support Upgrade"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">SKU Reference *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FCRM-SUP-09"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Price ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                  <input
                    type="text"
                    placeholder="Software Add-on"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim() || !price || !sku.trim()}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Create Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
