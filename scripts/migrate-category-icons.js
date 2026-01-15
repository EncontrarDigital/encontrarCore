/**
 * Script para fazer upload das imagens SVG/PNG das categorias do diretório
 * assets/categories_svg para o Supabase Storage
 * 
 * Execução:
 * node ace migration-category-icons
 * 
 * Ou diretamente:
 * node scripts/migrate-category-icons.js
 */

'use strict'

const path = require('path')
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
const Env = use('Env')

// Mapping entre nomes de arquivo e IDs de categoria
// Ajuste este objeto de acordo com suas categorias reais
const ICON_MAPPING = {
  'bebidas.png': null, // Será preenchido automaticamente
  'black-friday.png': null,
  'box.png': null,
  'brinquedos.png': null,
  'cuidados-pessoais.png': null,
  'eletrodomesticos.png': null,
  'escritorio.png': null,
  'fashion_clothing.png': null,
  'items-para-casa.png': null
}

class MigrateCategoryIcons {
  constructor() {
    this.supabaseUrl = Env.get('SUPABASE_URL')
    this.supabaseKey = Env.get('SUPABASE_KEY')
    this.bucket = Env.get('SUPABASE_BUCKET', 'uploads')
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey)
  }

  /**
   * Executar migração
   */
  async run() {
    const Database = use('Database')
    const CategoriesService = use('App/Modules/Catalog/Services/CategoriesService')

    console.log('\n📁 Iniciando migração de ícones de categorias...\n')

    const assetsDir = path.join(__dirname, '../assets/categories_svg')

    // Verificar se diretório existe
    if (!fs.existsSync(assetsDir)) {
      console.error(`❌ Diretório ${assetsDir} não encontrado`)
      return
    }

    // Obter lista de arquivos
    const files = fs.readdirSync(assetsDir).filter(f => 
      f.endsWith('.png') || f.endsWith('.svg')
    )

    console.log(`✓ Encontrados ${files.length} arquivos de ícone`)

    // Buscar todas as categorias principais
    const categories = await Database.select('id', 'name', 'slug').from('categories')
      .whereNull('parentCategoryId')
      .limit(50)

    console.log(`✓ Encontradas ${categories.length} categorias principais\n`)

    // Fazer upload de cada arquivo
    for (const file of files) {
      const filePath = path.join(assetsDir, file)
      const fileName = file.toLowerCase()

      // Encontrar categoria correspondente pelo nome ou slug
      const category = this.findCategoryByFile(fileName, categories)

      if (!category) {
        console.warn(`⚠️  Nenhuma categoria encontrada para: ${file}`)
        continue
      }

      try {
        // Ler arquivo
        const fileBuffer = fs.readFileSync(filePath)
        const mimeType = file.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
        const uploadPath = `categories/${Date.now()}-${fileName}`

        // Upload para Supabase
        console.log(`⏳ Fazendo upload: ${file}...`)
        const { error } = await this.supabase.storage
          .from(this.bucket)
          .upload(uploadPath, fileBuffer, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: true
          })

        if (error) {
          console.error(`❌ Erro ao fazer upload de ${file}: ${error.message}`)
          continue
        }

        // Atualizar categoria com caminho do ícone
        const categoriesService = new CategoriesService()
        await categoriesService.updatedCategories(category.id, {
          icon_path: uploadPath
        })

        console.log(`✅ ${file} → Categoria ID ${category.id} (${category.name})`)
      } catch (error) {
        console.error(`❌ Erro ao processar ${file}: ${error.message}`)
      }
    }

    console.log('\n✅ Migração de ícones de categorias concluída!\n')
  }

  /**
   * Encontrar categoria correspondente ao arquivo
   * @param {string} fileName - Nome do arquivo
   * @param {Array} categories - Lista de categorias
   * @returns {Object|null} Categoria encontrada ou null
   */
  findCategoryByFile(fileName, categories) {
    // Remover extensão
    let cleanName = fileName.replace(/\.(png|svg)$/, '').toLowerCase()

    // Normalizar underscores e hífens
    cleanName = cleanName.replace(/_/g, ' ')

    // Procurar por correspondência aproximada
    return categories.find(cat => {
      const catName = cat.name.toLowerCase()
      const catSlug = cat.slug.toLowerCase()
      
      // Match exato
      if (catName === cleanName || catSlug === cleanName) {
        return true
      }

      // Match parcial
      if (catName.includes(cleanName) || cleanName.includes(catName)) {
        return true
      }

      return false
    })
  }
}

module.exports = MigrateCategoryIcons
