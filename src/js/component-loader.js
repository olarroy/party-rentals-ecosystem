/**
 * Sistema de inclusión de componentes - Clean Code
 * Implementa DRY principle para header y footer
 */
class ComponentLoader {
    constructor() {
        this.components = new Map();
        console.log('🧩 ComponentLoader iniciado - Aplicando DRY principle');
    }

    /**
     * Carga un componente HTML desde archivo
     * @param {string} componentName - Nombre del componente (header, footer)
     * @param {string} targetSelector - Selector donde insertar el componente
     */
    async loadComponent(componentName, targetSelector) {
        try {
            // Cache para evitar múltiples cargas del mismo componente
            if (!this.components.has(componentName)) {
                const response = await fetch(`components/${componentName}.html`);
                
                if (!response.ok) {
                    throw new Error(`Error cargando ${componentName}: ${response.status}`);
                }
                
                const html = await response.text();
                this.components.set(componentName, html);
                console.log(`✅ Componente ${componentName} cargado y cacheado`);
            }

            // Insertar componente en el DOM
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                targetElement.innerHTML = this.components.get(componentName);
                console.log(`🎯 Componente ${componentName} insertado en ${targetSelector}`);
                
                // Activar navegación activa después de cargar header
                if (componentName === 'header') {
                    this.activateCurrentNavigation();
                }
            } else {
                console.warn(`⚠️ Selector ${targetSelector} no encontrado`);
            }

        } catch (error) {
            console.error(`❌ Error cargando componente ${componentName}:`, error);
            this.createFallbackComponent(componentName, targetSelector);
        }
    }

    /**
     * Activa el enlace de navegación correspondiente a la página actual
     */
    activateCurrentNavigation() {
        const currentPage = this.getCurrentPage();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('data-page');
            
            if ((currentPage === 'index' && linkPage === 'home') ||
                (currentPage === 'reservas' && linkPage === 'reservas')) {
                link.classList.add('active');
                console.log(`🎯 Navegación activa: ${linkPage}`);
            }
        });
    }

    /**
     * Determina la página actual basada en la URL
     * @returns {string} Nombre de la página actual
     */
    getCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('reservas')) {
            return 'reservas';
        } else if (path.includes('index') || path === '/' || path.endsWith('/')) {
            return 'index';
        }
        
        return 'unknown';
    }

    /**
     * Crea componente de respaldo si falla la carga
     * @param {string} componentName - Nombre del componente
     * @param {string} targetSelector - Selector destino
     */
    createFallbackComponent(componentName, targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return;

        console.log(`🔄 Creando fallback para ${componentName}`);

        if (componentName === 'header') {
            targetElement.innerHTML = `
                <header class="header">
                    <div class="container">
                        <div class="nav">
                            <div class="logo">
                                <h1>🎈 Pequefest.com</h1>
                                <p>Diversión sin límites</p>
                            </div>
                        </div>
                    </div>
                </header>
            `;
        } else if (componentName === 'footer') {
            targetElement.innerHTML = `
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
    }

    /**
     * Carga todos los componentes estándar de una página
     */
    async loadPageComponents() {
        const loadPromises = [];

        // Cargar header si existe el placeholder
        if (document.querySelector('[data-component="header"]')) {
            loadPromises.push(this.loadComponent('header', '[data-component="header"]'));
        }

        // Cargar footer si existe el placeholder
        if (document.querySelector('[data-component="footer"]')) {
            loadPromises.push(this.loadComponent('footer', '[data-component="footer"]'));
        }

        // Esperar a que todos los componentes se carguen
        await Promise.all(loadPromises);
        console.log('🎉 Todos los componentes cargados correctamente');
    }

    /**
     * Inicialización automática cuando el DOM esté listo
     */
    static async initialize() {
        const loader = new ComponentLoader();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => loader.loadPageComponents());
        } else {
            await loader.loadPageComponents();
        }
        
        return loader;
    }
}

// Auto-inicialización
ComponentLoader.initialize();

// Exportar para uso manual si es necesario
window.ComponentLoader = ComponentLoader;
