/**
 * 🔍 VERIFICADOR DE CONFIGURACIÓN - PEQUEFEST.COM
 * Usa este script para comprobar que todo está bien configurado
 */

class ConfigurationChecker {
    constructor() {
        this.results = {};
        this.checkAll();
    }

    async checkAll() {
        console.log('🔍 Iniciando verificación de configuración...\n');
        
        // Verificar cada servicio
        await this.checkEmailConfiguration();
        await this.checkTelegramConfiguration();
        await this.checkBusinessConfiguration();
        await this.checkDatabaseConfiguration();
        
        // Mostrar resumen
        this.showSummary();
    }

    async checkEmailConfiguration() {
        console.log('📧 Verificando configuración de EMAIL...');
        
        const config = window.configManager?.getEmailConfig();
        
        if (!config) {
            this.results.email = '❌ ConfigManager no encontrado';
            return;
        }

        const checks = {
            serviceId: config.serviceId !== 'YOUR_EMAILJS_SERVICE_ID',
            publicKey: config.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY',
            customerTemplate: config.customerTemplate !== 'YOUR_CUSTOMER_TEMPLATE_ID',
            ownerTemplate: config.ownerTemplate !== 'YOUR_OWNER_TEMPLATE_ID',
            enabled: config.enabled
        };

        const configured = Object.values(checks).filter(Boolean).length;
        
        if (configured === 5) {
            this.results.email = '✅ Completamente configurado';
        } else if (configured >= 4) {
            this.results.email = '⚠️ Casi listo (falta habilitar)';
        } else {
            this.results.email = '❌ Necesita configuración';
        }

        console.log(`   Service ID: ${checks.serviceId ? '✅' : '❌'}`);
        console.log(`   Public Key: ${checks.publicKey ? '✅' : '❌'}`);
        console.log(`   Template Cliente: ${checks.customerTemplate ? '✅' : '❌'}`);
        console.log(`   Template Propietario: ${checks.ownerTemplate ? '✅' : '❌'}`);
        console.log(`   Habilitado: ${checks.enabled ? '✅' : '❌'}\n`);
    }

    async checkTelegramConfiguration() {
        console.log('📱 Verificando configuración de TELEGRAM...');
        
        const config = window.configManager?.getTelegramConfig();
        
        if (!config) {
            this.results.telegram = '❌ ConfigManager no encontrado';
            return;
        }

        const checks = {
            botToken: config.botToken !== 'YOUR_BOT_TOKEN_HERE' && config.botToken.includes(':'),
            chatId: config.chatId !== 'YOUR_CHAT_ID_HERE' && !isNaN(config.chatId),
            enabled: config.enabled
        };

        const configured = Object.values(checks).filter(Boolean).length;
        
        if (configured === 3) {
            this.results.telegram = '✅ Completamente configurado';
            
            // Probar conexión si está configurado
            if (checks.botToken && checks.chatId) {
                await this.testTelegramConnection(config);
            }
        } else if (configured >= 2) {
            this.results.telegram = '⚠️ Casi listo (falta habilitar)';
        } else {
            this.results.telegram = '❌ Necesita configuración';
        }

        console.log(`   Bot Token: ${checks.botToken ? '✅' : '❌'}`);
        console.log(`   Chat ID: ${checks.chatId ? '✅' : '❌'}`);
        console.log(`   Habilitado: ${checks.enabled ? '✅' : '❌'}\n`);
    }

    async testTelegramConnection(config) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
            const data = await response.json();
            
            if (data.ok) {
                console.log(`   🤖 Bot conectado: ${data.result.first_name}`);
            } else {
                console.log(`   ❌ Error bot: ${data.description}`);
            }
        } catch (error) {
            console.log(`   ⚠️ No se pudo verificar bot: ${error.message}`);
        }
    }

    checkBusinessConfiguration() {
        console.log('🏢 Verificando configuración de NEGOCIO...');
        
        const config = window.configManager?.getBusinessConfig();
        
        if (!config) {
            this.results.business = '❌ ConfigManager no encontrado';
            return;
        }

        const checks = {
            name: config.name === 'Pequefest.com',
            email: config.email === 'oscarlarroy@gmail.com',
            phone: config.phone !== '(pendiente configuración)' && config.phone !== '+34 XXX XXX XXX',
            address: config.address.includes('Madrid')
        };

        const configured = Object.values(checks).filter(Boolean).length;
        
        if (configured === 4) {
            this.results.business = '✅ Completamente configurado';
        } else if (configured >= 3) {
            this.results.business = '⚠️ Casi listo (revisar teléfono)';
        } else {
            this.results.business = '❌ Necesita configuración';
        }

        console.log(`   Nombre: ${checks.name ? '✅' : '❌'} ${config.name}`);
        console.log(`   Email: ${checks.email ? '✅' : '❌'} ${config.email}`);
        console.log(`   Teléfono: ${checks.phone ? '✅' : '❌'} ${config.phone}`);
        console.log(`   Dirección: ${checks.address ? '✅' : '❌'} ${config.address}\n`);
    }

    checkDatabaseConfiguration() {
        console.log('💾 Verificando configuración de BASE DE DATOS...');
        
        const config = window.configManager?.getSupabaseConfig();
        
        if (!config) {
            this.results.database = '❌ ConfigManager no encontrado';
            return;
        }

        const checks = {
            url: config.url.includes('supabase.co'),
            key: config.key.length > 100
        };

        if (checks.url && checks.key) {
            this.results.database = '✅ Configurado correctamente';
        } else {
            this.results.database = '❌ Error en configuración';
        }

        console.log(`   URL: ${checks.url ? '✅' : '❌'}`);
        console.log(`   Key: ${checks.key ? '✅' : '❌'}\n`);
    }

    showSummary() {
        console.log('📊 RESUMEN DE CONFIGURACIÓN');
        console.log('================================');
        console.log(`📧 Email: ${this.results.email || '❌ No verificado'}`);
        console.log(`📱 Telegram: ${this.results.telegram || '❌ No verificado'}`);
        console.log(`🏢 Negocio: ${this.results.business || '❌ No verificado'}`);
        console.log(`💾 Base de Datos: ${this.results.database || '❌ No verificado'}`);
        console.log('================================\n');

        const allGood = Object.values(this.results).every(result => result.includes('✅'));
        
        if (allGood) {
            console.log('🎉 ¡CONFIGURACIÓN COMPLETA! Puedes activar modo producción.');
            console.log('🔧 Para activar: Cambiar TESTING_MODE=false en .env');
        } else {
            console.log('⚠️ Configuración incompleta. Revisa los elementos marcados con ❌');
            console.log('📖 Consulta CONFIGURACION_GUIA_COMPLETA.md para ayuda');
        }
    }
}

// Auto-ejecutar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que ConfigManager esté listo
    setTimeout(() => {
        console.clear();
        console.log('🔧 VERIFICADOR DE CONFIGURACIÓN - PEQUEFEST.COM\n');
        new ConfigurationChecker();
    }, 1000);
});

// También permitir ejecutar manualmente
window.checkConfig = () => new ConfigurationChecker();
