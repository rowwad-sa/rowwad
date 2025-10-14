import { supabase, propertyService, inquiryService } from './lib/supabase.js'
import { createPropertyCard } from './components/PropertyCard.js'

// متغيرات عامة
let allProperties = []
let filteredProperties = []

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async () => {
    await loadProperties()
    initializeEventListeners()
    initializeAnimations()
})

// تحميل العقارات من قاعدة البيانات
async function loadProperties() {
    try {
        allProperties = await propertyService.getAllProperties()
        filteredProperties = allProperties.filter(p => p.status === 'متاح')
        displayProperties(filteredProperties)
        updateStats()
    } catch (error) {
        console.error('خطأ في تحميل العقارات:', error)
        showNotification('حدث خطأ في تحميل العقارات', 'error')
    }
}

// عرض العقارات
function displayProperties(properties) {
    const propertiesGrid = document.querySelector('.properties-grid')
    
    if (!propertiesGrid) return
    
    if (properties.length === 0) {
        propertiesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-light);">
                <i class="fas fa-home" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>لا توجد عقارات متاحة</h3>
                <p>جاري إضافة عقارات جديدة قريباً</p>
            </div>
        `
        return
    }
    
    propertiesGrid.innerHTML = properties.map(property => createPropertyCard(property)).join('')
    
    // إضافة تأثيرات الحركة
    setTimeout(() => {
        document.querySelectorAll('.property-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible')
            }, index * 100)
        })
    }, 100)
}

// تحديث الإحصائيات
function updateStats() {
    const totalProperties = allProperties.length
    const availableProperties = allProperties.filter(p => p.status === 'متاح').length
    const featuredProperties = allProperties.filter(p => p.featured).length
    
    // تحديث إحصائيات الصفحة الرئيسية
    const statElements = document.querySelectorAll('[data-target]')
    statElements.forEach(element => {
        const target = element.getAttribute('data-target')
        let value = 0
        
        switch (target) {
            case '150':
                value = totalProperties
                break
            case '95':
                value = Math.round((availableProperties / totalProperties) * 100) || 0
                break
            case '50':
                value = featuredProperties
                break
            default:
                value = parseInt(target)
        }
        
        element.setAttribute('data-target', value)
        animateCounter(element, value)
    })
}

// تهيئة مستمعي الأحداث
function initializeEventListeners() {
    // البحث
    const searchForm = document.querySelector('.search-form')
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch)
    }
    
    // فلاتر العقارات
    const filterButtons = document.querySelectorAll('.filter-btn')
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilter)
    })
    
    // نموذج الاتصال
    const contactForm = document.getElementById('contactForm')
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm)
    }
    
    // تبديل البحث
    const searchTabs = document.querySelectorAll('.search-tab')
    searchTabs.forEach(tab => {
        tab.addEventListener('click', handleSearchTab)
    })
}

// معالجة البحث
async function handleSearch(e) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const filters = {
        city: formData.get('city'),
        district: formData.get('district'),
        propertyType: formData.get('property-type'),
        minPrice: formData.get('min-price') ? parseFloat(formData.get('min-price')) : null,
        maxPrice: formData.get('max-price') ? parseFloat(formData.get('max-price')) : null
    }
    
    try {
        const searchResults = await propertyService.searchProperties(filters)
        filteredProperties = searchResults
        displayProperties(filteredProperties)
        
        // التمرير إلى قسم العقارات
        document.getElementById('properties')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        })
        
        showNotification(`تم العثور على ${searchResults.length} عقار`, 'success')
    } catch (error) {
        console.error('خطأ في البحث:', error)
        showNotification('حدث خطأ في البحث', 'error')
    }
}

// معالجة الفلاتر
function handleFilter(e) {
    const filterButtons = document.querySelectorAll('.filter-btn')
    const category = e.target.getAttribute('data-filter')
    
    // تحديث الأزرار النشطة
    filterButtons.forEach(btn => btn.classList.remove('active'))
    e.target.classList.add('active')
    
    // تطبيق الفلتر
    if (category === 'all') {
        filteredProperties = allProperties.filter(p => p.status === 'متاح')
    } else {
        filteredProperties = allProperties.filter(p => 
            p.status === 'متاح' && p.property_type === category
        )
    }
    
    displayProperties(filteredProperties)
}

// معالجة تبويبات البحث
function handleSearchTab(e) {
    const searchTabs = document.querySelectorAll('.search-tab')
    searchTabs.forEach(tab => tab.classList.remove('active'))
    e.target.classList.add('active')
}

// معالجة نموذج الاتصال
async function handleContactForm(e) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const inquiryData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        inquiry_type: 'استفسار عام'
    }
    
    try {
        await inquiryService.createInquiry(inquiryData)
        showNotification('تم إرسال رسالتك بنجاح! سيتم التواصل معك قريباً.', 'success')
        e.target.reset()
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error)
        showNotification('حدث خطأ في إرسال الرسالة', 'error')
    }
}

// فتح تفاصيل العقار
function openPropertyDetails(propertyId) {
    window.open(`property-${propertyId}.html`, '_blank')
}

// إضافة للمفضلة
function toggleFavorite(propertyId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const index = favorites.indexOf(propertyId)
    
    if (index > -1) {
        favorites.splice(index, 1)
        showNotification('تم إزالة العقار من المفضلة', 'info')
    } else {
        favorites.push(propertyId)
        showNotification('تم إضافة العقار للمفضلة', 'success')
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites))
    updateFavoriteButtons()
}

// تحديث أزرار المفضلة
function updateFavoriteButtons() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    
    document.querySelectorAll('.favorite').forEach(btn => {
        const propertyId = btn.closest('.property-card').getAttribute('data-property-id')
        const icon = btn.querySelector('i')
        
        if (favorites.includes(propertyId)) {
            icon.classList.remove('far')
            icon.classList.add('fas')
            btn.style.color = '#ef4444'
        } else {
            icon.classList.remove('fas')
            icon.classList.add('far')
            btn.style.color = ''
        }
    })
}

// مشاركة العقار
function shareProperty(propertyId) {
    const property = allProperties.find(p => p.id === propertyId)
    
    if (navigator.share && property) {
        navigator.share({
            title: property.title,
            text: property.description,
            url: `${window.location.origin}/property-${propertyId}.html`
        })
    } else {
        const url = `${window.location.origin}/property-${propertyId}.html`
        navigator.clipboard.writeText(url)
        showNotification('تم نسخ رابط العقار', 'success')
    }
}

// عرض 360 درجة
function view360(propertyId) {
    const property = allProperties.find(p => p.id === propertyId)
    
    if (property?.virtual_360?.images?.length > 0) {
        openPropertyDetails(propertyId)
    } else {
        showNotification('العرض 360 غير متوفر لهذا العقار', 'info')
    }
}

// طلب زيارة عقار
async function requestPropertyVisit(propertyId) {
    const property = allProperties.find(p => p.id === propertyId)
    
    if (!property) return
    
    const name = prompt('الاسم:')
    const phone = prompt('رقم الهاتف:')
    
    if (name && phone) {
        try {
            await inquiryService.createInquiry({
                property_id: propertyId,
                name,
                phone,
                message: `طلب زيارة للعقار: ${property.title}`,
                inquiry_type: 'طلب زيارة'
            })
            
            showNotification('تم تسجيل طلب الزيارة بنجاح', 'success')
        } catch (error) {
            showNotification('حدث خطأ في تسجيل طلب الزيارة', 'error')
        }
    }
}

// التواصل مع الوكيل
function contactAgent(phone, propertyTitle) {
    const message = `مرحباً، أنا مهتم بالعقار: ${propertyTitle}`
    const whatsappUrl = `https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
}

// تحريك العدادات
function animateCounter(element, target, duration = 2000) {
    let start = 0
    const increment = target / (duration / 16)
    
    function updateCounter() {
        start += increment
        if (start < target) {
            element.textContent = Math.floor(start)
            requestAnimationFrame(updateCounter)
        } else {
            element.textContent = target
        }
    }
    
    updateCounter()
}

// تهيئة الحركات
function initializeAnimations() {
    // مراقب التمرير للحركات
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible')
            }
        })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    
    // مراقبة العناصر
    document.querySelectorAll('.fade-in, .property-card, .service-card, .contact-card').forEach(el => {
        el.classList.add('fade-in')
        scrollObserver.observe(el)
    })
    
    // مراقب الإحصائيات
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('[data-target]')
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'))
                    animateCounter(counter, target)
                })
                statsObserver.unobserve(entry.target)
            }
        })
    }, { threshold: 0.5 })
    
    // مراقبة أقسام الإحصائيات
    document.querySelectorAll('.hero-stats, .about-stats').forEach(section => {
        statsObserver.observe(section)
    })
}

// نظام الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.innerHTML = `
        <div style="background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'}; color: white; padding: 15px 20px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 10px; font-weight: 500;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease'
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification)
            }
        }, 300)
    }, 3000)
}

// تصدير الدوال للاستخدام العام
window.openPropertyDetails = openPropertyDetails
window.toggleFavorite = toggleFavorite
window.shareProperty = shareProperty
window.view360 = view360
window.requestPropertyVisit = requestPropertyVisit
window.contactAgent = contactAgent
