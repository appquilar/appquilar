
import { Product, ProductFormData, AvailabilityPeriod } from '@/domain/models/Product';
import { ProductRepository } from '@/domain/repositories/ProductRepository';

/**
 * Mock implementation of the ProductRepository interface
 */
export class MockProductRepository implements ProductRepository {
  // We'll initialize with a minimal set of mock products that match our Product interface
  private products: Product[] = [
    {
      id: "1",
      internalId: "PRD001",
      name: "Taladro Percutor 20V",
      slug: "taladro-percutor-20v",
      description: "Taladro percutor de 20V con batería de litio de larga duración",
      imageUrl: "/images/products/taladro-1.jpg",
      thumbnailUrl: "/images/products/taladro-1-thumb.jpg",
      price: {
        daily: 12.99,
        weekly: 60.99,
        monthly: 180.99
      },
      isRentable: true,
      isForSale: false,
      company: {
        id: "1",
        name: "Herramientas Pro",
        slug: "herramientas-pro"
      },
      category: {
        id: "1",
        name: "Herramientas Eléctricas",
        slug: "herramientas-electricas"
      },
      rating: 4.7,
      reviewCount: 124,
      isAlwaysAvailable: true,
      availability: [
        {
          id: "period-1",
          startDate: "2024-04-01",
          endDate: "2024-12-31",
          status: "available",
          includeWeekends: true
        }
      ]
    },
    {
      id: "2",
      internalId: "PRD002",
      name: "Sierra de Mesa con Soporte",
      slug: "sierra-mesa-soporte",
      description: "Sierra de mesa profesional con soporte plegable",
      imageUrl: "/images/products/sierra-1.jpg",
      thumbnailUrl: "/images/products/sierra-1-thumb.jpg",
      price: {
        daily: 25.99,
        weekly: 120.99,
        monthly: 350.99,
        deposit: 100
      },
      secondHand: {
        price: 299.99,
        negotiable: true,
        additionalInfo: "Comprada hace 6 meses, en perfecto estado"
      },
      isRentable: true,
      isForSale: true,
      company: {
        id: "1",
        name: "Herramientas Pro",
        slug: "herramientas-pro"
      },
      category: {
        id: "1",
        name: "Herramientas Eléctricas",
        slug: "herramientas-electricas"
      },
      rating: 4.5,
      reviewCount: 89,
      isAlwaysAvailable: false,
      availability: [
        {
          id: "period-1",
          startDate: "2024-04-01",
          endDate: "2024-06-30",
          status: "available",
          includeWeekends: true
        }
      ],
      unavailableDates: ["2024-05-01", "2024-05-02", "2024-05-03"]
    }
  ];

  async getAllProducts(): Promise<Product[]> {
    return Promise.resolve([...this.products]);
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = this.products.find(product => product.id === id);
    return Promise.resolve(product || null);
  }

  async getProductsByCompanyId(companyId: string): Promise<Product[]> {
    const filtered = this.products.filter(product => product.company.id === companyId);
    return Promise.resolve(filtered);
  }

  async getProductsByCategoryId(categoryId: string): Promise<Product[]> {
    const filtered = this.products.filter(product => product.category.id === categoryId);
    return Promise.resolve(filtered);
  }

  async createProduct(productData: ProductFormData): Promise<Product> {
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      internalId: `PRD${(this.products.length + 1).toString().padStart(3, '0')}`,
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      imageUrl: productData.imageUrl,
      thumbnailUrl: productData.thumbnailUrl,
      price: productData.price,
      secondHand: productData.secondHand,
      isRentable: productData.isRentable,
      isForSale: productData.isForSale,
      company: {
        id: productData.companyId,
        name: 'Empresa Demo', 
        slug: 'empresa-demo'
      },
      category: {
        id: productData.categoryId,
        name: 'Categoría Demo', 
        slug: 'categoria-demo'
      },
      isAlwaysAvailable: productData.isAlwaysAvailable,
      availability: productData.availability,
      unavailableDates: productData.unavailableDates,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.products.push(newProduct);
    return Promise.resolve(newProduct);
  }

  async updateProduct(id: string, productData: ProductFormData): Promise<Product> {
    const index = this.products.findIndex(product => product.id === id);
    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }
    
    // Preserve existing company and category info if not changed
    const existingCompanyId = this.products[index].company.id;
    const existingCategoryId = this.products[index].category.id;
    
    const company = productData.companyId === existingCompanyId
      ? this.products[index].company
      : {
          id: productData.companyId,
          name: 'Empresa Demo', 
          slug: 'empresa-demo'
        };
        
    const category = productData.categoryId === existingCategoryId
      ? this.products[index].category
      : {
          id: productData.categoryId,
          name: 'Categoría Demo', 
          slug: 'categoria-demo'
        };
    
    const updatedProduct: Product = {
      ...this.products[index],
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      imageUrl: productData.imageUrl,
      thumbnailUrl: productData.thumbnailUrl,
      price: productData.price,
      secondHand: productData.secondHand,
      isRentable: productData.isRentable,
      isForSale: productData.isForSale,
      company,
      category,
      isAlwaysAvailable: productData.isAlwaysAvailable,
      availability: productData.availability,
      unavailableDates: productData.unavailableDates,
      updatedAt: new Date().toISOString()
    };
    
    this.products[index] = updatedProduct;
    return Promise.resolve(updatedProduct);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const initialLength = this.products.length;
    this.products = this.products.filter(product => product.id !== id);
    return Promise.resolve(this.products.length !== initialLength);
  }
}
