/**
 * Gestor de configuración para Pequefest.com
 * Lee configuración desde .env y variables de entorno
 */
class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
        console.log('⚙️ Configuración cargada - Modo:', this.config.testingMode ? 'TESTING' : 'PRODUCTION');
    }
    
    loadConfig() {
        // En producción (GitHub Pages), usamos configuración hardcodeada segura
        const isProduction = window.location.hostname.includes('github.io');
        
        if (isProduction) {
            return this.getProductionConfig();
        } else {
            return this.getDevelopmentConfig();
        }
    }
    
    getProductionConfig() {
        return {
            // Telegram - Usuario debe configurar manualmente
            telegram: {
                botToken: 'YOUR_BOT_TOKEN_HERE',
                chatId: 'YOUR_CHAT_ID_HERE',
                enabled: false
            },
            
            // Email - Usuario debe configurar manualmente
            email: {
                serviceId: 'YOUR_EMAILJS_SERVICE_ID',
                publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
                customerTemplate: 'YOUR_CUSTOMER_TEMPLATE_ID',
                ownerTemplate: 'YOUR_OWNER_TEMPLATE_ID',
                enabled: false
            },
            
            // Supabase - Configurado
            supabase: {
                url: 'https://cstixfdstuaagfosnepn.supabase.co',
                key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdGl4ZmRzdHVhYWdmb3NuZXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTAwMTksImV4cCI6MjA3NTc4NjAxOX0.3ZUvkvFUhFGzIno_-SmJx_C9t8q2idFI54jGh8U3R-E'
            },
            
            // Información del negocio
            business: {
                name: 'Pequefest.com',
                email: 'oscarlarroy@gmail.com', // Email real para notificaciones
                phone: '(pendiente configuración)',
                address: 'Madrid, España',
                website: 'pequefest.com'
            },
            
            // Modo testing
            testingMode: true,
            simulateNotifications: true
        };
    }
    
    getDevelopmentConfig() {
        // En desarrollo local, intenta leer .env si está disponible
        // Como GitHub Pages no soporta .env, fallback a configuración por defecto
        return this.getProductionConfig();
    }
    
    // Métodos para acceder a la configuración
    getTelegramConfig() {
        return this.config.telegram;
    }
    
    getEmailConfig() {
        return this.config.email;
    }
    
    getSupabaseConfig() {
        return this.config.supabase;
    }
    
    getBusinessConfig() {
        return this.config.business;
    }
    
    isTestingMode() {
        return this.config.testingMode;
    }
    
    shouldSimulateNotifications() {
        return this.config.simulateNotifications;
    }
    
    // Método para verificar si una integración está configurada
    isIntegrationReady(service) {
        switch (service) {
            case 'telegram':
                const tg = this.config.telegram;
                return tg.enabled && 
                       tg.botToken !== 'YOUR_BOT_TOKEN_HERE' && 
                       tg.chatId !== 'YOUR_CHAT_ID_HERE';
                       
            case 'email':
                const em = this.config.email;
                return em.enabled && 
                       em.serviceId !== 'YOUR_EMAILJS_SERVICE_ID' &&
                       em.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY';
                       
            case 'supabase':
                return true; // Siempre configurado
                
            default:
                return false;
        }
    }
    
    // Método para mostrar status de configuración
    getConfigStatus() {
        return {
            telegram: this.isIntegrationReady('telegram') ? '✅ Configurado' : '⚠️ Pendiente configuración',
            email: this.isIntegrationReady('email') ? '✅ Configurado' : '⚠️ Pendiente configuración', 
            supabase: this.isIntegrationReady('supabase') ? '✅ Configurado' : '❌ Error configuración',
            mode: this.isTestingMode() ? '🧪 Testing' : '🚀 Producción'
        };
    }
}

// Crear instancia global
window.configManager = new ConfigManager();

// Exportar para uso en módulos
window.ConfigManager = ConfigManager;

// Log status en consola
console.log('📊 Status configuración:', window.configManager.getConfigStatus());
