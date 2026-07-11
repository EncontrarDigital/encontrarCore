'use strict'

/**
 * Seeder para fazer upload de imagens de categorias para Supabase
 * e atualizar os icon_path na base de dados
 */

const Database = use('Database')
const Helpers = use('Helpers')
const Env = use('Env')
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

class UploadCategoryImagesSeeder {
  constructor() {
    // Inicializar Supabase client
    this.supabaseUrl = Env.get('SUPABASE_URL')
    this.supabaseKey = Env.get('SUPABASE_SERVICE_KEY') || Env.get('SUPABASE_KEY')
    this.bucket = Env.get('SUPABASE_BUCKET', 'uploads')
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey)
  }

  async run() {
    try {
      console.log('🚀 Iniciando upload de imagens de categorias...')
      console.log(`📦 Supabase URL: ${this.supabaseUrl}`)
      console.log(`📦 Bucket: ${this.bucket}`)
      console.log('')

      // 1. Upload imagens das 3 categorias principais (categories_svg)
      await this.uploadMainCategoriesImages()

      // 2. Upload imagens de Serviços (nível 2 e 3)
      await this.uploadServicesImages()

      // 3. Upload imagens de categorias V1 (subcategorias de Produtos)
      await this.uploadProductSubcategoriesImages()

      console.log('')
      console.log('✅ Upload de imagens concluído!')
      
      process.exit(0)
    } catch (error) {
      console.error('❌ Erro:', error)
      process.exit(1)
    }
  }

  /**
   * Upload de imagens das 3 categorias principais
   */
  async uploadMainCategoriesImages() {
    console.log('🌟 Upload de imagens das categorias principais...')
    
    // Mapeamento de slugs para arquivos
    const mainCategoriesMap = {
      'organicos': null, // Não tem imagem ainda
      'produtos': 'box.png',
      'servicos': null // Usaremos uma imagem genérica ou null
    }

    for (const [slug, filename] of Object.entries(mainCategoriesMap)) {
      if (!filename) {
        console.log(`   ⚠️  ${slug}: sem imagem definida`)
        continue
      }

      const category = await Database.from('categories')
        .where('slug', slug)
        .where('category_version', 'v2')
        .first()

      if (!category) {
        console.log(`   ⚠️  Categoria ${slug} não encontrada`)
        continue
      }

      const localPath = path.join(Helpers.appRoot(), 'assets', 'categories_svg', filename)
      
      if (!fs.existsSync(localPath)) {
        console.log(`   ⚠️  Arquivo não encontrado: ${localPath}`)
        continue
      }

      const uploadedPath = await this.uploadToSupabase(localPath, `categories/${slug}/${filename}`)
      
      if (uploadedPath) {
        await Database.table('categories')
          .where('id', category.id)
          .update({ icon_path: uploadedPath })
        
        console.log(`   ✓ ${category.name}: ${uploadedPath}`)
      }
    }
  }

  /**
   * Upload de imagens de Serviços (Multimédia, Manutenção, Eventos e suas subcategorias)
   */
  async uploadServicesImages() {
    console.log('')
    console.log('💼 Upload de imagens de Serviços...')

    // Nível 2: Multimédia, Manutenção, Eventos
    const level2Map = {
      'multimedia': 'Serviços/entertainment.jpeg',
      'manutencao': 'Serviços/manutencao.jpeg',
      'eventos': 'Serviços/eventos.jpg'
    }

    for (const [slug, relativePath] of Object.entries(level2Map)) {
      if (!relativePath) {
        console.log(`   ⚠️  ${slug}: sem imagem definida`)
        continue
      }

      const category = await Database.from('categories')
        .where('slug', slug)
        .where('category_version', 'v2')
        .first()

      if (!category) {
        console.log(`   ⚠️  Categoria ${slug} não encontrada`)
        continue
      }

      const localPath = path.join(Helpers.appRoot(), 'assets', relativePath)
      
      if (!fs.existsSync(localPath)) {
        console.log(`   ⚠️  Arquivo não encontrado: ${localPath}`)
        continue
      }

      const filename = path.basename(relativePath)
      const uploadedPath = await this.uploadToSupabase(localPath, `categories/servicos/${slug}/${filename}`)
      
      if (uploadedPath) {
        await Database.table('categories')
          .where('id', category.id)
          .update({ icon_path: uploadedPath })
        
        console.log(`   ✓ ${category.name}: ${uploadedPath}`)
      }
    }

    // Nível 3: Subcategorias de Multimédia
    const multimediaMap = {
      'netflix': 'Serviços/Multimedia/netflix.png',
      'prime-video': 'Serviços/Multimedia/prime_video.png',
      'hbo-max': 'Serviços/Multimedia/hbo.jpg',
      'spotify': 'Serviços/Multimedia/spotify.png'
    }

    for (const [slug, relativePath] of Object.entries(multimediaMap)) {
      const category = await Database.from('categories')
        .where('slug', slug)
        .where('category_version', 'v2')
        .first()

      if (!category) {
        console.log(`   ⚠️  Categoria ${slug} não encontrada`)
        continue
      }

      const localPath = path.join(Helpers.appRoot(), 'assets', relativePath)
      
      if (!fs.existsSync(localPath)) {
        console.log(`   ⚠️  Arquivo não encontrado: ${localPath}`)
        continue
      }

      const filename = path.basename(relativePath)
      const uploadedPath = await this.uploadToSupabase(localPath, `categories/servicos/multimedia/${slug}/${filename}`)
      
      if (uploadedPath) {
        await Database.table('categories')
          .where('id', category.id)
          .update({ icon_path: uploadedPath })
        
        console.log(`   ✓ ${category.name}: ${uploadedPath}`)
      }
    }

    // Nível 3: Subcategorias de Manutenção
    const manutencaoMap = {
      'limpeza': 'Serviços/Manutenção/limpeza.jpeg'
    }

    for (const [slug, relativePath] of Object.entries(manutencaoMap)) {
      const category = await Database.from('categories')
        .where('slug', slug)
        .where('category_version', 'v2')
        .first()

      if (!category) {
        console.log(`   ⚠️  Categoria ${slug} não encontrada`)
        continue
      }

      const localPath = path.join(Helpers.appRoot(), 'assets', relativePath)
      
      if (!fs.existsSync(localPath)) {
        console.log(`   ⚠️  Arquivo não encontrado: ${localPath}`)
        continue
      }

      const filename = path.basename(relativePath)
      const uploadedPath = await this.uploadToSupabase(localPath, `categories/servicos/manutencao/${slug}/${filename}`)
      
      if (uploadedPath) {
        await Database.table('categories')
          .where('id', category.id)
          .update({ icon_path: uploadedPath })
        
        console.log(`   ✓ ${category.name}: ${uploadedPath}`)
      }
    }
  }

  /**
   * Upload de imagens das subcategorias de Produtos (categorias V1 migradas)
   */
  async uploadProductSubcategoriesImages() {
    console.log('')
    console.log('📦 Upload de imagens de subcategorias de Produtos...')

    // Buscar categoria Produtos
    const productsCategory = await Database.from('categories')
      .where('slug', 'produtos')
      .where('category_version', 'v2')
      .first()

    if (!productsCategory) {
      console.log('   ⚠️  Categoria Produtos não encontrada')
      return
    }

    // Buscar todas as subcategorias de Produtos
    const subcategories = await Database.from('categories')
      .where('parentCategoryId', productsCategory.id)
      .where('category_version', 'v2')
      .select('id', 'name', 'slug')

    // Mapeamento de nomes de categorias para arquivos
    // (usando nome ao invés de slug porque slug pode variar)
    const nameToFileMap = {
      'Bebidas e Alimentação': 'drink_foods.png',
      'Cuidados Pessoais': 'personal_care.png',
      'Diversos': 'toys.png',
      'Eletrodomésticos': 'electrics.png',
      'Escritorio': 'stationery.png',
      'Flores': 'flores.jpg',
      'Itens para Casa': 'home_items.png',
      'Moda & Vestuário': 'fashion_clothing.png'
    }

    for (const category of subcategories) {
      const filename = nameToFileMap[category.name]
      
      if (!filename) {
        console.log(`   ⚠️  ${category.name} (${category.slug}): sem mapeamento de imagem`)
        continue
      }

      const localPath = path.join(Helpers.appRoot(), 'assets', 'categories_svg', filename)
      
      if (!fs.existsSync(localPath)) {
        console.log(`   ⚠️  Arquivo não encontrado: ${localPath}`)
        continue
      }

      const uploadedPath = await this.uploadToSupabase(localPath, `categories/produtos/${category.slug}/${filename}`)
      
      if (uploadedPath) {
        await Database.table('categories')
          .where('id', category.id)
          .update({ icon_path: uploadedPath })
        
        console.log(`   ✓ ${category.name}: ${uploadedPath}`)
      }
    }
  }

  /**
   * Upload de arquivo para Supabase Storage
   * @param {string} localPath - Caminho local do arquivo
   * @param {string} remotePath - Caminho no Supabase (sem bucket)
   * @returns {Promise<string|null>} - Caminho do arquivo no Supabase ou null se falhar
   */
  async uploadToSupabase(localPath, remotePath) {
    try {
      // Ler arquivo
      const fileBuffer = fs.readFileSync(localPath)
      const contentType = this.getContentType(localPath)

      // Upload para Supabase
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(remotePath, fileBuffer, {
          contentType,
          upsert: true // Sobrescrever se já existir
        })

      if (error) {
        console.error(`   ❌ Erro ao fazer upload de ${remotePath}:`, error.message)
        return null
      }

      return remotePath
    } catch (error) {
      console.error(`   ❌ Erro ao processar ${localPath}:`, error.message)
      return null
    }
  }

  /**
   * Determina o Content-Type baseado na extensão do arquivo
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase()
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    }
    return contentTypes[ext] || 'application/octet-stream'
  }
}

module.exports = UploadCategoryImagesSeeder
