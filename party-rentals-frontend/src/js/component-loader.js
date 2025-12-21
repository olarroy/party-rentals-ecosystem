/**
 * Component Loader - Sistema de carga dinámica de componentes
 * Implementa el principio DRY eliminando duplicación de código en headers y footers
 */
class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.init();
    }

    async init() {
        // Cargar todos los componentes al inicializar la página
        await this.loadAllComponents();
        // Activar navegación después de cargar componentes
        this.activateCurrentNavigation();
    }

    async loadComponent(componentName) {
        // Verificar cache primero
        if (this.cache.has(componentName)) {
            return this.cache.get(componentName);
        }

        try {
            const response = await fetch(`components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            
            // Guardar en cache
            this.cache.set(componentName, html);
            return html;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            // Retornar componente de fallback
            return this.createFallbackComponent(componentName);
        }
    }

    createFallbackComponent(componentName) {
        if (componentName === 'header') {
            return `
                <header class="header">
                    <div class="container">
                        <div class="nav">
                            <div class="logo">
                                <h1>🎈 Pequefest.com</h1>
                                <p>Diversión sin límites</p>
                            </div>
                            <nav class="nav-menu">
                                <a href="index.html" class="nav-link">Inicio</a>
                                <a href="reservas.html" class="nav-link btn-primary">Reservar</a>
                            </nav>
                        </div>
                    </div>
                </header>
            `;
        } else if (componentName === 'footer') {
            return `
                <footer class="footer">
                    <div class="container">
                        <div class="footer-content">
                            <div class="footer-brand">
                                <h3>🎈 Pequefest.com</h3>
                                <p>Hacemos que cada fiesta sea inolvidable</p>
                            </div>
                        </div>
                        <div class="footer-bottom">
                            <p>&copy; 2025 Pequefest.com. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </footer>
            `;
        }
        return `<div>Error: Componente ${componentName} no disponible</div>`;
    }

    async loadAllComponents() {
        const componentPlaceholders = document.querySelectorAll('[data-component]');
        
        for (const placeholder of componentPlaceholders) {
            const componentName = placeholder.getAttribute('data-component');
            const componentHtml = await this.loadComponent(componentName);
            placeholder.innerHTML = componentHtml;
        }
    }

    activateCurrentNavigation() {
        // Determinar página actual
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        
        // Buscar enlaces de navegación y activar el correspondiente
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Inicializar el sistema de componentes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ComponentLoader();
});
