#!/bin/bash

# Script para configurar o sistema de categorias V2
# Executa migração e população de dados

set -e  # Para se houver erro

echo "🚀 Configurando Sistema de Categorias V2"
echo "========================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para mensagens
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar se estamos no diretório correto
if [ ! -f "ace" ]; then
    error "Execute este script na raiz do projeto encontrarCore"
    exit 1
fi

info "Diretório correto verificado ✓"
echo ""

# 2. Executar migração
info "Executando migração do banco de dados..."
echo ""

node ace migration:run --force

if [ $? -eq 0 ]; then
    info "Migração executada com sucesso ✓"
else
    error "Falha na execução da migração"
    exit 1
fi

echo ""

# 3. Executar seeder
info "Populando categorias V2..."
echo ""

node ace seed --files=PopulateV2CategoriesSeeder.js

if [ $? -eq 0 ]; then
    info "Categorias V2 populadas com sucesso ✓"
else
    error "Falha ao popular categorias"
    exit 1
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup completo!${NC}"
echo ""
echo "📊 Próximos passos:"
echo "  1. Testar API v1: curl http://localhost:3333/api/categories?default=true&version=v1"
echo "  2. Testar API v2: curl http://localhost:3333/api/categories?default=true&version=v2"
echo "  3. Verificar subcategorias: curl http://localhost:3333/api/categories/:id/subcategories?version=v2"
echo ""
