// إعدادات قاعدة البيانات
const CONFIG = {
    // إعدادات Supabase
    SUPABASE_URL: 'https://ngvkakgcawarmdtzxnar.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmtha2djYXdhcm1kdHp4bmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDMxNTMsImV4cCI6MjA3NzA3OTE1M30.2vtL-jA4LNM8XnfivXcrbXq6rxFEUtXvxZIBRnStfNo',
    
    // إعدادات التطبيق
    APP_NAME: 'رواد العقار للتطوير والاستثمار العقاري',
    ADMIN_EMAIL: 'admin@rawadelaqar.com',
    ADMIN_PASSWORD: 'admin123',
    
    // إعدادات الاتصال
    WHATSAPP_NUMBER: '+966501234567',
    SUPPORT_EMAIL: 'info@rawadelaqar.com',
    
    // إعدادات العرض
    PROPERTIES_PER_PAGE: 12,
    ENABLE_360_VIEWER: true,
    ENABLE_NOTIFICATIONS: true
};

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
