'use strict'

const ProductPhotoRepository = use('App/Modules/Catalog/Repositories/ProductPhotoRepository')
const ProductsRepository = use('App/Modules/Catalog/Repositories/ProductsRepository')
const LocalFilesService = use('App/Services/LocalFilesService')
const NotFoundException = use('App/Exceptions/NotFoundException')
const FileNotFoundException = use('App/Exceptions/FileNotFoundException')

class ProductPhotosService {
  constructor() {
    this.productPhotoRepository = new ProductPhotoRepository()
    this.productsRepository = new ProductsRepository()
    this.localFilesService = new LocalFilesService()
  }

  /**
   * Get all product photos with pagination and filters
   * @param {Object} filters - Request filters
   * @returns {Promise<Object>} Paginated photos with metadata
   */
  async getProductPhotos(filters) {
    const search = filters.input("search");
    const options = {
      page: filters.input("page") || 1,
      perPage: filters.input("perPage") || 10,
      orderBy: filters.input("orderBy") || "id",
      typeOrderBy: filters.input("typeOrderBy") || "DESC",
      searchBy: ["name", "path"],
      isPaginate: true
    };

    let query = this.productPhotoRepository.model
      .query()
      // .with('product')
      .orderBy(options.orderBy, options.typeOrderBy);

    // Apply search filter if provided
    if (search) {
      query = query.where(function() {
        options.searchBy.forEach(column => {
          this.orWhere(column, 'LIKE', `%${search}%`);
        });
      });
    }

    // Filter by is_primary if provided
    const isPrimary = filters.input('is_primary');
    if (isPrimary !== undefined) {
      query = query.where('is_primary', isPrimary === 'true' || isPrimary === true);
    }

    return await query.paginate(options.page, options.perPage);
  }

  /**
   * Get a specific product photo (with optional thumbnail)
   * @param {number} productId
   * @param {number} photoId
   * @param {boolean} thumbnail
   * @returns {Promise<Buffer>}
   */
  async getProductPhoto(productId, photoId, thumbnail = false) {
    const productPhoto = await this.productPhotoRepository.findByProductAndPhoto(productId, photoId)

    if (!productPhoto) {
      throw new NotFoundException(`Product photo with id ${photoId} not found for product ${productId}`)
    }

    const path = thumbnail ? productPhoto.thumbnailPath : productPhoto.path
    const file = await this.localFilesService.getPhoto(path)
    
    if (!file) {
      throw new FileNotFoundException(`Product photo file not found: ${path}`)
    }

    return file
  }

  /**
   * Get product photos sizes with pagination and filters
   * @param {Object} filters - Filtros da requisição
   * @returns {Promise<Object>} Dados paginados com os tamanhos das fotos
   */
  async getProductPhotosSizes(filters) {
    const search = filters.input('search');
    const minSize = filters.input('min_size');
    const maxSize = filters.input('max_size');

    const options = {
      page: parseInt(filters.input("page")) || 1,
      perPage: parseInt(filters.input("perPage")) || 10,
      orderBy: filters.input("orderBy") || "path",
      typeOrderBy: (filters.input("typeOrderBy", "asc") || "asc").toUpperCase()
    };

    let query = this.productPhotoRepository.model
      .query()
      // .with('product')
      .select(
        'id', 
        'path', 
        'mimeType as mime_type',
        'thumbnailPath',
        'placeholderBase64',
      )
      .orderBy(options.orderBy, options.typeOrderBy);

    // Aplicar filtro de busca
    if (search) {
      query = query.where('path', 'LIKE', `%${search}%`);
    }

    // Executar a consulta paginada
    const result = await query.paginate(options.page, options.perPage);

    // Calcular o tamanho dos arquivos em MB
    const fs = require('fs');
    const path = require('path');
    const Helpers = use('Helpers');
    
    const photosWithSize = [];
    
    // Verificar se estamos no ambiente Railway
    const isRailway = true
    
    if (isRailway) {
      console.log('Modo Railway ativado - buscando arquivos via API');
      
      // URL base da API do outro backend (substitua pela URL correta)
      const API_BASE_URL = process.env.OTHER_BACKEND_URL || 'http://localhost:3381';
      
      // Buscar os tamanhos dos arquivos via API
      for (const photo of result.rows) {
        try {
          // Se o caminho já for uma URL completa, usar diretamente
          if (photo.path.startsWith('http')) {
            const response = await fetch(photo.path, { method: 'HEAD' });
            const size = response.headers.get('content-length');
            const sizeMB = (size / (1024 * 1024)).toFixed(2);
            
            photosWithSize.push({
              ...photo.toJSON(),
              size: parseFloat(sizeMB),
              sizeMB: sizeMB + ' MB',
              source: 'remote',
              url: photo.path
            });
          } else {
            // Se for um caminho relativo, montar a URL completa
            const fileUrl = `${API_BASE_URL}${photo.path.startsWith('/') ? '' : '/'}${photo.path}`;
            const response = await fetch(fileUrl, { method: 'HEAD' });
            const size = response.headers.get('content-length');
            const sizeMB = (size / (1024 * 1024)).toFixed(2);
            
            photosWithSize.push({
              ...photo.toJSON(),
              size: parseFloat(sizeMB),
              sizeMB: sizeMB + ' MB',
              source: 'remote',
              url: fileUrl
            });
          }
        } catch (error) {
          console.error(`Erro ao buscar arquivo ${photo.path}:`, error);
          photosWithSize.push({
            ...photo.toJSON(),
            size: 0,
            sizeMB: '0 MB',
            error: 'Erro ao acessar arquivo remoto',
            debug: { error: error.message }
          });
        }
      }
      
      // Pular o resto da lógica local
      return {
        data: photosWithSize,
        pagination: result.pagination
      };
    }
    
    // Se não for Railway, continuar com a lógica local
    const possibleBasePaths = [
      path.resolve(__dirname, '../../../../../public'),
      path.resolve(__dirname, '../../../../../storage/app/public'),
      Helpers.publicPath(),
      path.join(Helpers.publicPath(), 'uploads')
    ];
    
    console.log('Modo local - Procurando arquivos em:', possibleBasePaths);
    
    // Verificar quais diretórios existem
    const existingPaths = [];
    for (const basePath of possibleBasePaths) {
      try {
        await fs.promises.access(basePath, fs.constants.R_OK);
        existingPaths.push(basePath);
        console.log(`Diretório encontrado: ${basePath}`);
      } catch (err) {
        console.log(`Diretório não encontrado: ${basePath}`);
      }
    }
    
    if (existingPaths.length === 0) {
      throw new Error('Nenhum diretório de armazenamento válido encontrado');
    }
    
    for (const photo of result.rows) {
      let fileFound = false;
      const triedPaths = [];
      
      // Tentar encontrar o arquivo em cada local possível
      for (const basePath of existingPaths) {
        try {
          // Tentar com o caminho exato
          let filePath = path.join(basePath, photo.path);
          triedPaths.push(filePath);
          
          const stats = await fs.promises.stat(filePath);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          
          photosWithSize.push({
            ...photo.toJSON(),
            size: parseFloat(sizeMB),
            sizeMB: sizeMB + ' MB',
            debug: { path: filePath, exists: true }
          });
          
          fileFound = true;
          break; // Arquivo encontrado, pode parar de procurar
          
        } catch (error) {
          // Se não encontrar, tenta sem o 'uploads/' no início
          if (photo.path.startsWith('uploads/')) {
            try {
              const cleanPath = photo.path.substring(8);
              const altPath = path.join(basePath, cleanPath);
              triedPaths.push(altPath);
              
              const stats = await fs.promises.stat(altPath);
              const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
              
              photosWithSize.push({
                ...photo.toJSON(),
                size: parseFloat(sizeMB),
                sizeMB: sizeMB + ' MB',
                debug: { path: altPath, exists: true, usedAlternativePath: true }
              });
              
              fileFound = true;
              break; // Arquivo encontrado, pode parar de procurar
            } catch (altError) {
              // Continua para o próximo caminho
            }
          }
        }
      }
      
      // Se não encontrou em nenhum local
      if (!fileFound) {
        console.error(`Arquivo não encontrado em nenhum local: ${photo.path}`);
        photosWithSize.push({
          ...photo.toJSON(),
          size: 0,
          sizeMB: '0 MB',
          error: 'Arquivo não encontrado',
          debug: {
            originalPath: photo.path,
            triedPaths: triedPaths,
            existingPaths: existingPaths
          }
        });
      }
    }

    // Aplicar filtros de tamanho após o cálculo
    let filteredPhotos = [...photosWithSize];
    
    if (minSize) {
      filteredPhotos = filteredPhotos.filter(photo => photo.size >= parseFloat(minSize));
    }
    
    if (maxSize) {
      filteredPhotos = filteredPhotos.filter(photo => photo.size <= parseFloat(maxSize));
    }

    // Ordenar por tamanho se necessário
    if (options.orderBy === 'size') {
      filteredPhotos.sort((a, b) => {
        return options.typeOrderBy === 'DESC' ? b.size - a.size : a.size - b.size;
      });
    }

    // Aplicar paginação manualmente após a filtragem
    const start = (options.page - 1) * options.perPage;
    const end = start + options.perPage;
    const paginatedPhotos = filteredPhotos.slice(start, end);
    const total = filteredPhotos.length;

    return {
      data: paginatedPhotos,
      pagination: {
        total: total,
        per_page: options.perPage,
        current_page: options.page,
        last_page: Math.ceil(total / options.perPage),
        from: start + 1,
        to: Math.min(total, end)
      }
    };
  }


  /**
   * Create product photo (original version - saves to originals folder)
   * @param {number} productId
   * @param {Object} file - File object
   * @param {string} mimeType
   * @returns {Promise<Object>}
   */
  async createProductPhoto(productId, file, mimeType) {
    const product = await this.productsRepository.findById(productId).first()

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`)
    }

    // Get extension and create original path
    const originalName = file.clientName || file.originalname || 'photo'
    let extension = originalName.split('.').pop()
    const filePath = `originals/${Date.now()}-${originalName.replace(/\.[^/.]+$/, '')}.${extension}`

    // Create photo record
    const photo = await this.productPhotoRepository.create({
      path: filePath,
      mimeType: mimeType,
      productId: productId,
    })

    // Create thumbnail
    photo.thumbnailPath = await this.localFilesService.createPhotoThumbnail(file)

    // Create placeholder
    photo.placeholderBase64 = await this.localFilesService.createPhotoPlaceholder(file)

    // Save photo with thumbnail and placeholder
    await photo.save()

    // Update product photosOrder
    if (product.photosOrder) {
      product.photosOrder = [...product.photosOrder.split(','), photo.id.toString()].join(',')
    } else {
      product.photosOrder = photo.id.toString()
    }

    await product.save()

    return photo
  }

  /**
   * Add product photo (saves processed photo)
   * @param {number} productId
   * @param {Object} file - File object
   * @returns {Promise<Object>}
   */
  async addProductPhoto(productId, file) {
    const product = await this.productsRepository.findById(productId).with('photos').first()

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`)
    }

    // Save photo to Supabase
    const { path, mimeType } = await this.localFilesService.savePhoto(file)

    // Create photo record
    const photo = await this.productPhotoRepository.create({
      path: path,
      mimeType: mimeType,
      productId: productId,
    })

    // Create thumbnail
    photo.thumbnailPath = await this.localFilesService.createPhotoThumbnail(file)
    await photo.save()

    // Update product photosOrder
    if (product.photosOrder) {
      product.photosOrder = [...product.photosOrder.split(','), photo.id.toString()].join(',')
    } else {
      product.photosOrder = photo.id.toString()
    }

    await product.save()

    // Reload product with photos
    return await this.productsRepository.findById(productId).with('photos').first()
  }

  /**
   * Delete product photo
   * @param {number} productId
   * @param {number} photoId
   * @returns {Promise<Object>}
   */
  async deleteProductPhoto(productId, photoId) {
    const product = await this.productsRepository.findById(productId).with('photos').first()

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`)
    }

    // Check if photo exists
    const photo = await this.productPhotoRepository.findByProductAndPhoto(productId, photoId)

    if (!photo) {
      throw new NotFoundException(`Product photo with id ${photoId} not found for product ${productId}`)
    }

    // Delete photo
    await this.productPhotoRepository.delete(photoId)

    // Update product photosOrder
    if (product.photosOrder) {
      product.photosOrder = product.photosOrder
        .split(',')
        .filter((p) => p !== photoId.toString())
        .join(',')
    }

    await product.save()

    // Reload product with photos
    return await this.productsRepository.findById(productId).with('photos').first()
  }
}

module.exports = ProductPhotosService

