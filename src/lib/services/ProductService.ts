import { prisma } from '../database/prisma';
import { Product, CreateProductRequest, UpdateProductRequest, ProductCategory } from '../types/product';

export class ProductService {
  // Pobierz wszystkie produkty
  static async getAllProducts(): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: true,
        },
      });
      
      return products.map((product: any) => ({
        ...product,
        price: Number(product.price),
        category: product.category.slug as ProductCategory,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Pobierz produkt po ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!product) return null;

      return {
        ...product,
        price: Number(product.price),
        category: product.category.slug as ProductCategory,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // Pobierz produkty po kategorii
  static async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: {
          category: {
            slug: category,
          },
        },
        include: {
          category: true,
        },
      });

      return products.map((product: any) => ({
        ...product,
        price: Number(product.price),
        category: product.category.slug as ProductCategory,
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  // Wyszukaj produkty
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          category: true,
        },
      });

      return products.map((product: any) => ({
        ...product,
        price: Number(product.price),
        category: product.category.slug as ProductCategory,
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  // Utwórz nowy produkt
  static async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      // Znajdź kategorię po slug
      const category = await prisma.category.findUnique({
        where: { slug: data.category || 'standard' },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: category.id,
          images: data.images || [],
          specifications: data.specifications || {},
          inStock: data.inStock !== false,
        },
        include: {
          category: true,
        },
      });

      return {
        ...product,
        price: Number(product.price),
        category: product.category.slug as ProductCategory,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  // Zaktualizuj produkt
  static async updateProduct(data: UpdateProductRequest): Promise<Product> {
    try {
      const updateData: any = {};
      
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price) updateData.price = data.price;
      if (data.images) updateData.images = data.images;
      if (data.specifications) updateData.specifications = data.specifications;
      if (data.inStock !== undefined) updateData.inStock = data.inStock;

      if (data.category) {
        const category = await prisma.category.findUnique({
          where: { slug: data.category },
        });
        if (!category) {
          throw new Error('Category not found');
        }
        updateData.categoryId = category.id;
      }

      const product = await prisma.product.update({
        where: { id: data.id },
        data: updateData,
        include: {
          category: true,
        },
      });

      return {
        ...product,
        price: Number(product.price),
        category: product.category.slug as ProductCategory,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  // Usuń produkt
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
} 