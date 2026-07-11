'use strict'

/*
|--------------------------------------------------------------------------
| PopulateV2CategoriesSeeder
|--------------------------------------------------------------------------
|
| Popula as 3 categorias principais do novo sistema (V2):
| 1. Orgânicos
| 2. Produtos
| 3. Serviços
|
| E suas respectivas subcategorias
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Database = use('Database')

class PopulateV2CategoriesSeeder {
  async run () {
    console.log('🚀 Iniciando população de categorias V2...')
    
    try {
      // 1. Criar as 3 categorias principais V2
      await this._createMainCategories()
      
      // 2. Criar subcategorias de Orgânicos
      await this._createOrganicSubcategories()
      
      // 3. Criar subcategorias de Produtos (migrar/copiar categorias V1)
      await this._createProductSubcategories()
      
      // 4. Criar subcategorias de Serviços
      await this._createServiceSubcategories()
      
      console.log('✅ Categorias V2 populadas com sucesso!')
      console.log('📊 Resumo:')
      
      const v2Count = await Database.from('categories')
        .where('category_version', 'v2')
        .count('* as total')
      
      console.log(`   - Total de categorias V2: ${v2Count[0].total}`)
      
    } catch (error) {
      console.error('❌ Erro ao popular categorias V2:', error)
      throw error
    }
  }

  async _createMainCategories() {
    console.log('📦 Criando categorias principais...')
    
    const mainCategories = [
      {
        name: 'Orgânicos',
        name_en: 'Organic',
        description: 'Produtos naturais e saudáveis',
        description_en: 'Natural and healthy products',
        slug: 'organicos',
        service_fee: 0,
        parentCategoryId: null,
        category_version: 'v2',
        is_legacy: false,
        icon_path: null, // TODO: Adicionar ícone depois
      },
      {
        name: 'Produtos',
        name_en: 'Products',
        description: 'Tudo para sua vida',
        description_en: 'Everything for your life',
        slug: 'produtos',
        service_fee: 0,
        parentCategoryId: null,
        category_version: 'v2',
        is_legacy: false,
        icon_path: null,
      },
      {
        name: 'Serviços',
        name_en: 'Services',
        description: 'Profissionais ao seu dispor',
        description_en: 'Professionals at your service',
        slug: 'servicos',
        service_fee: 0,
        parentCategoryId: null,
        category_version: 'v2',
        is_legacy: false,
        icon_path: null,
      }
    ]

    for (const category of mainCategories) {
      // Verificar se já existe
      const existing = await Database.from('categories')
        .where('slug', category.slug)
        .where('category_version', 'v2')
        .first()
      
      if (!existing) {
        await Database.table('categories').insert(category)
        console.log(`   ✓ ${category.name} criada`)
      } else {
        console.log(`   → ${category.name} já existe`)
      }
    }
  }

  async _createOrganicSubcategories() {
    console.log('🌱 Criando subcategorias de Orgânicos...')
    
    // Buscar ID da categoria Orgânicos
    const organicCategory = await Database.from('categories')
      .where('slug', 'organicos')
      .where('category_version', 'v2')
      .first()
    
    if (!organicCategory) {
      console.log('   ⚠️  Categoria Orgânicos não encontrada')
      return
    }

    const subcategories = [
      {
        name: 'Frutas Orgânicas',
        name_en: 'Organic Fruits',
        description: 'Frutas frescas e naturais',
        description_en: 'Fresh and natural fruits',
        slug: 'frutas-organicas',
      },
      {
        name: 'Vegetais Orgânicos',
        name_en: 'Organic Vegetables',
        description: 'Vegetais frescos e saudáveis',
        description_en: 'Fresh and healthy vegetables',
        slug: 'vegetais-organicos',
      },
      {
        name: 'Grãos Integrais',
        name_en: 'Whole Grains',
        description: 'Arroz, feijão e cereais',
        description_en: 'Rice, beans and cereals',
        slug: 'graos-integrais',
      },
      {
        name: 'Produtos Naturais',
        name_en: 'Natural Products',
        description: 'Alimentos sem conservantes',
        description_en: 'Foods without preservatives',
        slug: 'produtos-naturais',
      },
      {
        name: 'Cosméticos Naturais',
        name_en: 'Natural Cosmetics',
        description: 'Beleza natural e sustentável',
        description_en: 'Natural and sustainable beauty',
        slug: 'cosmeticos-naturais',
      }
    ]

    for (const subcat of subcategories) {
      const existing = await Database.from('categories')
        .where('slug', subcat.slug)
        .where('category_version', 'v2')
        .first()
      
      if (!existing) {
        await Database.table('categories').insert({
          ...subcat,
          service_fee: 0,
          parentCategoryId: organicCategory.id,
          category_version: 'v2',
          is_legacy: false,
          icon_path: null,
        })
        console.log(`   ✓ ${subcat.name}`)
      }
    }
  }

  async _createProductSubcategories() {
    console.log('📦 Criando subcategorias de Produtos...')
    
    // Buscar ID da categoria Produtos
    const productsCategory = await Database.from('categories')
      .where('slug', 'produtos')
      .where('category_version', 'v2')
      .first()
    
    if (!productsCategory) {
      console.log('   ⚠️  Categoria Produtos não encontrada')
      return
    }

    console.log(`   → ID da categoria Produtos: ${productsCategory.id}`)

    // Buscar categorias principais V1 para transformar em subcategorias de Produtos
    const v1MainCategories = await Database.from('categories')
      .where('category_version', 'v1')
      .whereNull('parentCategoryId')
      .whereNotIn('slug', ['trendings', 'promotions', 'novidades']) // Excluir especiais
      .select('id', 'name', 'slug', 'description', 'name_en', 'description_en', 'icon_path')
      .orderBy('name')
    
    console.log(`   → Encontradas ${v1MainCategories.length} categorias V1 para migrar`)

    // Criar subcategorias V2 baseadas nas V1
    for (const v1Cat of v1MainCategories) {
      // Verificar se já existe
      const existing = await Database.from('categories')
        .where('slug', v1Cat.slug + '-v2')
        .where('category_version', 'v2')
        .first()
      
      if (!existing) {
        await Database.table('categories').insert({
          name: v1Cat.name,
          name_en: v1Cat.name_en || v1Cat.name,
          description: v1Cat.description || v1Cat.name,
          description_en: v1Cat.description_en || v1Cat.description || v1Cat.name,
          slug: v1Cat.slug + '-v2', // Adicionar -v2 para evitar conflito
          service_fee: 0,
          parentCategoryId: productsCategory.id,
          category_version: 'v2',
          is_legacy: false,
          icon_path: v1Cat.icon_path, // Manter ícone original
          v1_category_id: v1Cat.id, // Guardar ID da categoria V1 para buscar produtos
        })
        console.log(`   ✓ ${v1Cat.name} (migrada de V1, icon_path: ${v1Cat.icon_path || 'NULL'})`)
      } else {
        // Atualizar categoria existente com icon_path e v1_category_id se não tiver
        const updates = {}
        if (!existing.icon_path && v1Cat.icon_path) {
          updates.icon_path = v1Cat.icon_path
        }
        if (!existing.v1_category_id) {
          updates.v1_category_id = v1Cat.id
        }
        
        if (Object.keys(updates).length > 0) {
          await Database.table('categories')
            .where('id', existing.id)
            .update(updates)
          console.log(`   → ${v1Cat.name} atualizado (icon_path: ${v1Cat.icon_path || 'NULL'}, v1_id: ${v1Cat.id})`)
        } else {
          console.log(`   → ${v1Cat.name} já existe e está completo`)
        }
      }
    }
  }

  async _createServiceSubcategories() {
    console.log('💼 Criando subcategorias de Serviços...')
    
    // Buscar ID da categoria Serviços
    const servicesCategory = await Database.from('categories')
      .where('slug', 'servicos')
      .where('category_version', 'v2')
      .first()
    
    if (!servicesCategory) {
      console.log('   ⚠️  Categoria Serviços não encontrada')
      return
    }

    // Categorias de nível 2 (subcategorias diretas de Serviços)
    const level2Categories = [
      {
        name: 'Multimédia',
        name_en: 'Multimedia',
        description: 'Serviços de streaming e entretenimento',
        description_en: 'Streaming and entertainment services',
        slug: 'multimedia',
      },
      {
        name: 'Manutenção',
        name_en: 'Maintenance',
        description: 'Serviços de limpeza e instalação',
        description_en: 'Cleaning and installation services',
        slug: 'manutencao',
      },
      {
        name: 'Eventos',
        name_en: 'Events',
        description: 'Serviços para eventos',
        description_en: 'Event services',
        slug: 'eventos',
      }
    ]

    // Criar categorias de nível 2
    const level2Ids = {}
    
    for (const cat of level2Categories) {
      let existing = await Database.from('categories')
        .where('slug', cat.slug)
        .where('category_version', 'v2')
        .first()
      
      if (!existing) {
        const inserted = await Database.table('categories').insert({
          ...cat,
          service_fee: 0,
          parentCategoryId: servicesCategory.id,
          category_version: 'v2',
          is_legacy: false,
          icon_path: null,
        }).returning('id')
        
        level2Ids[cat.slug] = inserted[0]
        console.log(`   ✓ ${cat.name} (nível 2)`)
      } else {
        level2Ids[cat.slug] = existing.id
        console.log(`   → ${cat.name} já existe`)
      }
    }

    // Categorias de nível 3 (subcategorias de Multimédia)
    const multimediaSubcategories = [
      {
        name: 'Netflix',
        name_en: 'Netflix',
        description: 'Streaming de filmes e séries',
        description_en: 'Movies and series streaming',
        slug: 'netflix',
        parent: 'multimedia'
      },
      {
        name: 'Prime Video',
        name_en: 'Prime Video',
        description: 'Amazon Prime Video',
        description_en: 'Amazon Prime Video',
        slug: 'prime-video',
        parent: 'multimedia'
      },
      {
        name: 'HBO Max',
        name_en: 'HBO Max',
        description: 'HBO Max streaming',
        description_en: 'HBO Max streaming',
        slug: 'hbo-max',
        parent: 'multimedia'
      },
      {
        name: 'Spotify',
        name_en: 'Spotify',
        description: 'Streaming de música',
        description_en: 'Music streaming',
        slug: 'spotify',
        parent: 'multimedia'
      }
    ]

    // Criar subcategorias de Multimédia
    for (const subcat of multimediaSubcategories) {
      const parentId = level2Ids[subcat.parent]
      if (!parentId) continue
      
      const existing = await Database.from('categories')
        .where('slug', subcat.slug)
        .where('category_version', 'v2')
        .first()
      
      if (!existing) {
        await Database.table('categories').insert({
          name: subcat.name,
          name_en: subcat.name_en,
          description: subcat.description,
          description_en: subcat.description_en,
          slug: subcat.slug,
          service_fee: 0,
          parentCategoryId: parentId,
          category_version: 'v2',
          is_legacy: false,
          icon_path: null,
        })
        console.log(`   ✓ ${subcat.name} (nível 3 - filho de ${subcat.parent})`)
      }
    }

    // Subcategorias de Manutenção
    const maintenanceSubcategories = [
      {
        name: 'Limpeza',
        name_en: 'Cleaning Service',
        description: 'Serviço de limpeza profissional',
        description_en: 'Professional cleaning service',
        slug: 'limpeza',
        parent: 'manutencao'
      },
      {
        name: 'Instalação Casa Inteligente',
        name_en: 'Smart Home Installation',
        description: 'Instalação de sistemas inteligentes',
        description_en: 'Smart systems installation',
        slug: 'instalacao-smart-home',
        parent: 'manutencao'
      }
    ]

    for (const subcat of maintenanceSubcategories) {
      const parentId = level2Ids[subcat.parent]
      if (!parentId) continue
      
      const existing = await Database.from('categories')
        .where('slug', subcat.slug)
        .where('category_version', 'v2')
        .first()
      
      if (!existing) {
        await Database.table('categories').insert({
          name: subcat.name,
          name_en: subcat.name_en,
          description: subcat.description,
          description_en: subcat.description_en,
          slug: subcat.slug,
          service_fee: 0,
          parentCategoryId: parentId,
          category_version: 'v2',
          is_legacy: false,
          icon_path: null,
        })
        console.log(`   ✓ ${subcat.name} (nível 3 - filho de ${subcat.parent})`)
      }
    }

    // Subcategorias de Eventos
    const eventsSubcategories = [
      {
        name: 'Espaço para Eventos',
        name_en: 'Event Venue',
        description: 'Locais para realizar eventos',
        description_en: 'Venues for events',
        slug: 'espaco-eventos',
        parent: 'eventos'
      },
      {
        name: 'Fotógrafo',
        name_en: 'Cameraman',
        description: 'Serviço de fotografia profissional',
        description_en: 'Professional photography service',
        slug: 'fotografo',
        parent: 'eventos'
      },
      {
        name: 'DJ',
        name_en: 'DJ',
        description: 'Serviço de DJ para eventos',
        description_en: 'DJ service for events',
        slug: 'dj',
        parent: 'eventos'
      }
    ]

    for (const subcat of eventsSubcategories) {
      const parentId = level2Ids[subcat.parent]
      if (!parentId) continue
      
      const existing = await Database.from('categories')
        .where('slug', subcat.slug)
        .where('category_version', 'v2')
        .first()
      
      if (!existing) {
        await Database.table('categories').insert({
          name: subcat.name,
          name_en: subcat.name_en,
          description: subcat.description,
          description_en: subcat.description_en,
          slug: subcat.slug,
          service_fee: 0,
          parentCategoryId: parentId,
          category_version: 'v2',
          is_legacy: false,
          icon_path: null,
        })
        console.log(`   ✓ ${subcat.name} (nível 3 - filho de ${subcat.parent})`)
      }
    }
  }
}

module.exports = PopulateV2CategoriesSeeder
