# Guia de Implementação: Ícones de Categorias no Supabase

## 📋 Resumo da Solução

Você agora pode hospedar as imagens de categorias no **Supabase Storage**, a mesma solução que usa para produtos. Isso oferece:

- ✅ **Consistência arquitetural** com o resto do projeto
- ✅ **CDN global** para entrega rápida de imagens
- ✅ **Escalabilidade** sem necessidade de deploy
- ✅ **Versionamento** e controle de mudanças
- ✅ **Permissões** granulares

---

## 🚀 Passos de Implementação

### 1. **Executar Migration**

```bash
npm run migration

# Ou manualmente com AdonisJS
node ace migration:run
```

Isso adicionará o campo `icon_path` à tabela `categories`.

### 2. **Registrar Ace Command (Opcional)**

Se ainda não estiver registrado, adicione em `start/kernel.js`:

```javascript
const commands = [
  // ... outros commands
  'App/Commands/MigrationCategoryIcons'
]
```

### 3. **Fazer Upload das Imagens Existentes**

```bash
node ace migration-category-icons
```

Este comando:
- Lê todos os arquivos de `assets/categories_svg/`
- Faz upload para Supabase Storage
- Atualiza automaticamente os registos de categorias
- Mostra um relatório de sucesso/erro

---

## 📡 API - Novos Endpoints

### **Upload de Ícone para Categoria**

```http
POST /api/categories/:id/icon
Content-Type: multipart/form-data

Field: icon (binary file)
Max size: 5MB
Allowed types: image/png, image/jpeg, image/gif, image/svg+xml
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/api/categories/1/icon \
  -F "icon=@/path/to/icon.png" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta (200):**
```json
{
  "id": 1,
  "name": "Bebidas",
  "slug": "bebidas",
  "icon_path": "categories/1705234567890-bebidas.png",
  "iconUrl": "https://seu-projeto.supabase.co/storage/v1/object/public/uploads/categories/1705234567890-bebidas.png",
  "created_at": "2025-01-12T10:30:00.000Z",
  "updated_at": "2025-01-14T15:45:20.000Z"
}
```

---

### **Deletar Ícone de Categoria**

```http
DELETE /api/categories/:id/icon
```

**Exemplo com cURL:**
```bash
curl -X DELETE http://localhost:3000/api/categories/1/icon \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta (200):**
```json
{
  "id": 1,
  "name": "Bebidas",
  "icon_path": null,
  "iconUrl": null
}
```

---

## 📊 Endpoints Modificados

### **Listar Categorias com Ícones**

```http
GET /api/categories
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Bebidas",
      "description": "Bebidas variadas",
      "slug": "bebidas",
      "icon_path": "categories/1705234567890-bebidas.png",
      "iconUrl": "https://seu-projeto.supabase.co/storage/v1/object/public/uploads/categories/1705234567890-bebidas.png"
    },
    {
      "id": 2,
      "name": "Eletrodomésticos",
      "description": "...",
      "slug": "eletrodomesticos",
      "icon_path": null,
      "iconUrl": null  // Sem ícone
    }
  ],
  "total": 15,
  "perPage": 10,
  "page": 1
}
```

---

### **Árvore de Categorias com Ícones**

```http
GET /api/categories/tree
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Eletrônicos",
    "slug": "eletronicos",
    "icon_path": "categories/xxx-eletronicos.png",
    "iconUrl": "https://...",
    "children": [
      {
        "id": 5,
        "name": "Smartphones",
        "slug": "smartphones",
        "icon_path": null,
        "iconUrl": null,
        "children": []
      }
    ]
  }
]
```

---

## 💾 Estrutura do Banco de Dados

### Alteração na Tabela `categories`

```sql
ALTER TABLE categories ADD COLUMN icon_path VARCHAR(255) NULL;

-- Índice para melhor performance
CREATE INDEX idx_categories_icon_path ON categories(icon_path);
```

### Campo Adicionado

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `icon_path` | VARCHAR(255) | Caminho relativo do ícone no Supabase Storage |

---

## 🎯 Boas Práticas

### ✅ DO's

- ✅ Usar formato PNG com fundo transparente para categorias principais
- ✅ Manter dimensões consistentes (ex: 512x512px)
- ✅ Deixar `icon_path` vazio/null para subcategorias
- ✅ Validar tipo de arquivo no frontend
- ✅ Usar URLs públicas do Supabase para cache-busting

### ❌ DON'Ts

- ❌ Não fazer upload de arquivos acima de 5MB
- ❌ Não usar imagens com dimensões muito grandes (>2MB)
- ❌ Não deletar arquivos do Supabase manualmente sem atualizar BD
- ❌ Não servir imagens locais para categorias criadas depois

---

## 🔧 Troubleshooting

### Problema: "Icon uploaded successfully" mas não aparece

**Solução:**
1. Verifique se o Supabase está acessível
2. Confirme que a permissão `icon_path` foi carregada (check DB)
3. Limpe o cache do navegador (Ctrl+Shift+Del)
4. Verifique a URL no DevTools

### Problema: Upload falha com "File not found"

**Solução:**
1. Confirme que o arquivo existe em `assets/categories_svg/`
2. Verifique permissões da pasta
3. Tente fazer upload manualmente via Supabase Dashboard

### Problema: "SUPABASE_URL não definido"

**Solução:**
Adicione ao `.env`:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon-key
SUPABASE_BUCKET=uploads
```

---

## 📱 Exemplo Frontend - React/Vue

### React
```jsx
function CategoryList() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data));
  }, []);

  return (
    <div className="categories">
      {categories.map(cat => (
        <div key={cat.id} className="category-card">
          {cat.iconUrl && (
            <img 
              src={cat.iconUrl} 
              alt={cat.name}
              style={{ maxWidth: '100px' }}
            />
          )}
          <h3>{cat.name}</h3>
          <p>{cat.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Upload de Ícone
```jsx
function UploadCategoryIcon({ categoryId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('icon', file);

    try {
      const response = await fetch(`/api/categories/${categoryId}/icon`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      console.log('Icon uploaded:', result.iconUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Icon'}
      </button>
    </form>
  );
}
```

---

## 📚 Referências

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [AdonisJS File Upload](https://docs.adonisjs.com/guides/http/file-uploads)
- [LocalFilesService Documentation](./app/Services/README_SUPABASE.md)
