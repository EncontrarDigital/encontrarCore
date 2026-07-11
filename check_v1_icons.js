const Database = use('Database')

class CheckV1Icons {
  async run() {
    try {
      const v1Cats = await Database.from('categories')
        .where('category_version', 'v1')
        .whereNull('parentCategoryId')
        .whereNotIn('slug', ['trendings', 'promotions', 'novidades'])
        .select('id', 'name', 'slug', 'icon_path')
        .orderBy('name')
      
      console.log('V1 Main Categories:')
      console.log('===================')
      v1Cats.forEach(cat => {
        console.log(`ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}`)
        console.log(`   icon_path: ${cat.icon_path || 'NULL'}`)
        console.log('')
      })
      
      console.log(`Total: ${v1Cats.length} categories`)
      const withIcons = v1Cats.filter(c => c.icon_path).length
      console.log(`With icon_path: ${withIcons}`)
      console.log(`Without icon_path: ${v1Cats.length - withIcons}`)
      
      process.exit(0)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  }
}

module.exports = CheckV1Icons
