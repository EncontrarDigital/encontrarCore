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
        })
        console.log(`   ✓ ${v1Cat.name} (migrada de V1)`)
      } else {
        console.log(`   → ${v1Cat.name} já existe`)
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

    const subcategories = [
      {
        name: 'Fotografia',
        name_en: 'Photography',
        description: 'Ensaios fotográficos e eventos',
        description_en: 'Photo shoots and events',
        slug: 'fotografia',
      },
      {
        name: 'Vídeo e Produção',
        name_en: 'Video and Production',
        description: 'Filmagens e produção audiovisual',
        description_en: 'Filming and audiovisual production',
        slug: 'video-producao',
      },
      {
        name: 'Design Gráfico',
        name_en: 'Graphic Design',
        description: 'Criação visual e branding',
        description_en: 'Visual creation and branding',
        slug: 'design-grafico',
      },
      {
        name: 'Eventos',
        name_en: 'Events',
        description: 'Casamentos, festas e eventos corporativos',
        description_en: 'Weddings, parties and corporate events',
        slug: 'eventos',
      },
      {
        name: 'Consultoria',
        name_en: 'Consulting',
        description: 'Serviços profissionais e consultoria',
        description_en: 'Professional services and consulting',
        slug: 'consultoria',
      },
      {
        name: 'Educação e Treinamento',
        name_en: 'Education and Training',
        description: 'Cursos, aulas e treinamentos',
        description_en: 'Courses, classes and training',
        slug: 'educacao-treinamento',
      },
      {
        name: 'Manutenção e Reparos',
        name_en: 'Maintenance and Repairs',
        description: 'Reparos e manutenção em geral',
        description_en: 'General repairs and maintenance',
        slug: 'manutencao-reparos',
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
          parentCategoryId: servicesCategory.id,
          category_version: 'v2',
          is_legacy: false,
          icon_path: null,
        })
        console.log(`   ✓ ${subcat.name}`)
      }
    }
  }
}

module.exports = PopulateV2CategoriesSeeder
