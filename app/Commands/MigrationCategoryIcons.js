'use strict'

const { Command } = require('@adonisjs/ace')
const path = require('path')
const fs = require('fs')

// Polyfills necessários para Supabase no Node.js
if (typeof global.fetch === 'undefined') {
  const nodeFetchModule = require('node-fetch')
  global.fetch = nodeFetchModule.default || nodeFetchModule
  global.Response = nodeFetchModule.Response
  global.Headers = nodeFetchModule.Headers
  global.Request = nodeFetchModule.Request
}

const { createClient } = require('@supabase/supabase-js')

class MigrationCategoryIconsCommand extends Command {
  static get signature() {
    return 'migration-category-icons'
  }

  static get description() {
    return 'Migra ícones de categorias do diretório assets para Supabase Storage'
  }

  async handle() {
    const Env = use('Env')
    const Database = use('Database')
    const CategoriesService = use('App/Modules/Catalog/Services/CategoriesService')
    const Helpers = use('Helpers')

    this.info(`\n📁 Iniciando migração de ícones de categorias...\n`)

    const supabaseUrl = Env.get('SUPABASE_URL')
    const supabaseKey = Env.get('SUPABASE_KEY')
    const bucket = Env.get('SUPABASE_BUCKET', 'uploads')

    if (!supabaseUrl || !supabaseKey) {
      this.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY não definidas')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })

    const assetsDir = path.join(__dirname, '../../assets/categories_svg')

    // Verificar se diretório existe
    if (!fs.existsSync(assetsDir)) {
      this.error(`❌ Diretório ${assetsDir} não encontrado`)
      return
    }

    // Obter lista de arquivos
    const files = fs.readdirSync(assetsDir)
      .filter(f => f.endsWith('.png') || f.endsWith('.svg'))

    this.info(`✓ Encontrados ${files.length} arquivos de ícone\n`)

    // Buscar todas as categorias
    const categories = await Database.select('id', 'name', 'slug')
      .from('categories')
      .limit(100)

    this.info(`✓ Encontradas ${categories.length} categorias\n`)

    // Mapeamento direto de arquivo para slug
    const fileToSlugMap = {
      'bebidas.png': 'drink_foods',
      'black friday.png': 'black_friday',
      'black_friday.png': 'black_friday',
      'box.png': 'various',
      'brinquedos.png': 'toys',
      'cuidados pessoais.png': 'personal_care',
      'cuidados-pessoais.png': 'personal_care',
      'drink_foods.png': 'drink_foods',
      'eletrodomesticos.png': 'electronics',
      'eletrodomésticos.png': 'electronics',
      'electrics.png': 'electronics',
      'escritorio.png': 'stationery',
      'escritório.png': 'stationery',
      'fashion_clothing.png': 'fashion_clothing',
      'home_items.png': 'home_items',
      'items para casa.png': 'home_items',
      'itens para casa.png': 'home_items',
      'personal_care.png': 'personal_care',
      'stationery.png': 'stationery',
      'toys.png': 'toys'
    }

    let successCount = 0
    let errorCount = 0

    // Fazer upload de cada arquivo
    for (const file of files) {
      const filePath = path.join(assetsDir, file)
      const fileName = file.toLowerCase()

      // Encontrar categoria correspondente usando mapeamento direto
      const categorySlug = fileToSlugMap[fileName]
      
      if (!categorySlug) {
        this.warn(`⚠️  Arquivo não mapeado: ${file}`)
        errorCount++
        continue
      }

      const category = categories.find(cat => cat.slug === categorySlug)

      if (!category) {
        this.warn(`⚠️  Categoria com slug '${categorySlug}' não encontrada para: ${file}`)
        errorCount++
        continue
      }

      try {
        // Ler arquivo
        const fileBuffer = fs.readFileSync(filePath)
        const mimeType = file.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
        const uploadPath = `categories/${Date.now()}-${categorySlug}.${file.endsWith('.svg') ? 'svg' : 'png'}`

        // Upload para Supabase
        this.info(`⏳ Fazendo upload: ${file}...`)
        
        const { error, data } = await supabase.storage
          .from(bucket)
          .upload(uploadPath, fileBuffer, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: true
          })

        if (error) {
          this.error(`❌ Erro ao fazer upload de ${file}: ${error.message}`)
          errorCount++
          continue
        }

        // Atualizar categoria com caminho do ícone
         await Database.from('categories')
  .where('id', category.id)
  .update({
    icon_path: uploadPath
  })

        this.info(`✅ ${file} → Categoria #${category.id} (${category.name})`)
        successCount++
      } catch (err) {
        this.error(`❌ Erro ao processar ${file}: ${err.message}`)
        errorCount++
      }
    }

    // Resumo
    console.log('\n' + '='.repeat(60))
    this.info(`✅ Migração concluída!`)
    this.info(`   ✓ Sucesso: ${successCount}`)
    this.info(`   ✗ Erros: ${errorCount}`)
    this.info(`   Total: ${files.length}`)
    console.log('='.repeat(60) + '\n')
  }
}

module.exports = MigrationCategoryIconsCommand
