# 🎈 Party Rentals Ecosystem

Sistema completo de alquiler de inflables para fiestas con arquitectura DDD, TDD, y integración MCP + IA.

## 🏗️ Arquitectura Multi-Proyecto

```
party-rentals-ecosystem/
├── 🎨 party-rentals-frontend/      # GitHub Pages - Frontend interactivo
├── 🏛️ party-rentals-core/          # Domain + Business Logic (DDD)
├── 🌐 party-rentals-api/           # REST API + Infrastructure
├── 🤖 party-rentals-mcp-server/    # MCP Server específico del dominio
├── 🧠 mcp-orchestrator/            # MCP Core reutilizable + IA
└── 📋 shared-contracts/            # Interfaces compartidas
```

## 🎯 Características

### **Domain Driven Design (DDD)**
- ✅ Separación clara de responsabilidades
- ✅ Domain entities y value objects
- ✅ Use cases bien definidos
- ✅ Repositories pattern

### **Test Driven Development (TDD)**
- 🔴 Red: Escribir test que falle
- 🟢 Green: Código mínimo para pasar
- 🔄 Refactor: Limpiar código
- ♻️ Repeat: Siguiente feature

### **Clean Code + XP**
- 📖 Código legible y mantenible
- 🧪 Cobertura de tests alta
- 🔄 Integración continua
- 👥 Código colectivo

### **MCP + IA Integration**
- 🤖 IA gestiona el negocio 24/7
- 📊 Optimización automática de precios
- 🗓️ Gestión inteligente de calendario
- 📈 Analytics predictivos

## 🚀 Stack Tecnológico

### **Frontend**
- HTML5 + CSS3 + JavaScript ES6+
- GitHub Pages (hosting gratuito)
- Calendario interactivo

### **Backend**
- TypeScript + Node.js
- Supabase (base de datos gratuita)
- Netlify Functions (API gratuita)

### **MCP + IA**
- Model Context Protocol
- Anthropic Claude integration
- Event-driven architecture

## 🎈 Modelo de Negocio

### **Productos**
- 🏰 **Inflable Grande**: Castillo para 10-15 niños
- 🎪 **Inflable Pequeño**: Mini castillo para 5-8 niños

### **Funcionalidades**
- 📅 Calendario de disponibilidad
- 💰 Precios dinámicos (IA optimiza)
- 📧 Notificaciones automáticas
- 🚚 Programación de montaje
- 📊 Reportes automáticos

## 📋 Roadmap

1. ✅ **Setup inicial** - Estructura de proyectos
2. ✅ **Core Domain** - Entidades + Value Objects (TDD)
3. ✅ **Use Cases** - Lógica de negocio (TDD)
4. ✅ **API** - Controllers + Infrastructure
5. ✅ **Frontend** - Calendario interactivo
6. ✅ **MCP Server** - IA que sugiere (no ejecuta automáticamente)
7. ✅ **IA Integration** - Business Intelligence Engine
8. ✅ **Deployment** - GitHub Pages + Supabase + Netlify

## 🧪 Comandos de Desarrollo

```bash
# Instalar dependencias en todos los proyectos
npm run install:all

# Ejecutar todos los tests (TDD)
npm run test:all

# Ejecutar en modo desarrollo
npm run dev:all

# Build para producción
npm run build:all

# Deploy a GitHub Pages
npm run deploy
```

## 📚 Documentación

- [🏛️ Core Domain](./party-rentals-core/README.md)
- [🌐 API Documentation](./party-rentals-api/README.md)
- [🎨 Frontend Guide](./party-rentals-frontend/README.md)
- [🤖 MCP Server](./party-rentals-mcp-server/README.md)
- [🧠 AI Orchestrator](./mcp-orchestrator/README.md)

---

**Desarrollado con 💖 usando DDD + TDD + Clean Code + MCP + IA**
