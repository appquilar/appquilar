import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import ProductCard, { Product as ProductCardModel } from '../products/ProductCard';
import type { Product } from '@/domain/models/Product';
import { useLatestPublicProducts } from '@/application/hooks/useLatestPublicProducts';

const getDailyPrice = (product: Product): number => {
  const tiers = product.price?.tiers ?? [];
  return tiers[0]?.pricePerDay ?? 0;
};

const FeaturedProducts = () => {
  const { data, isLoading } = useLatestPublicProducts();

  const products = useMemo<ProductCardModel[]>(() => {
    const domainProducts = data ?? [];
    return domainProducts.map((product) => ({
      id: product.id,
      internalId: product.internalId,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      thumbnailUrl: product.thumbnailUrl,
      description: product.description ?? '',
      price: {
        daily: getDailyPrice(product),
        deposit: product.price?.deposit,
      },
      company: {
        id: product.ownerData?.ownerId ?? '',
        name: product.ownerData?.name ?? '',
        slug: '',
      },
      category: {
        id: product.category?.id ?? '',
        name: product.category?.name ?? '',
        slug: product.category?.slug ?? '',
      },
      rating: product.rating ?? 0,
      reviewCount: product.reviewCount ?? 0,
    }));
  }, [data]);

  return (
    <section className="py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-display font-semibold tracking-tight">Últimos productos</h2>
          </div>
          <Link 
            to="/search" 
            className="text-sm font-medium hover:underline"
          >
            Ver todos los productos
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-sm text-muted-foreground">
              Cargando últimos productos...
            </div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-sm text-muted-foreground">
              Todavía no hay productos publicados.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
