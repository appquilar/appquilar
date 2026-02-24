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
    <section className="public-section">
      <div className="public-container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            Últimos productos
          </div>
          <h2 className="mt-4 text-2xl md:text-3xl font-display font-semibold tracking-tight">
            Novedades en alquiler
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Descubre los productos publicados recientemente en Appquilar.
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <Link
            to="/search"
            className="inline-flex items-center rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Ver todos los productos
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
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
