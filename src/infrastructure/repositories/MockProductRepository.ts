
import { Product, ProductFormData } from '@/domain/models/Product';
import { ProductRepository } from '@/domain/repositories/ProductRepository';
import { MOCK_PRODUCTS } from '@/components/dashboard/products/hooks/data/mockProducts';

/**
 * Mock implementation of the ProductRepository interface
 */
export class MockProductRepository implements ProductRepository {
  private products: Product[] = [...MOCK_PRODUCTS];

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
    // In a real implementation, we would get the company and category objects from their respective repositories
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      internalId: `PRD${(this.products.length + 1).toString().padStart(3, '0')}`,
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      imageUrl: productData.imageUrl,
      thumbnailUrl: productData.thumbnailUrl,
      price: productData.price,
      company: {
        id: productData.companyId,
        name: 'Mock Company', // This would come from the company repository
        slug: 'mock-company'
      },
      category: {
        id: productData.categoryId,
        name: 'Mock Category', // This would come from the category repository
        slug: 'mock-category'
      },
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
          name: 'Mock Company', // This would come from the company repository
          slug: 'mock-company'
        };
        
    const category = productData.categoryId === existingCategoryId
      ? this.products[index].category
      : {
          id: productData.categoryId,
          name: 'Mock Category', // This would come from the category repository
          slug: 'mock-category'
        };
    
    const updatedProduct: Product = {
      ...this.products[index],
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      imageUrl: productData.imageUrl,
      thumbnailUrl: productData.thumbnailUrl,
      price: productData.price,
      company,
      category,
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
