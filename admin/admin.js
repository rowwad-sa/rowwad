import { supabase, propertyService, inquiryService, authService } from '../src/lib/supabase.js'

// متغيرات عامة
let currentUser = null
let currentProperties = []
let currentInquiries = []
let editingPropertyId = null

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async () => {
    // التحقق من تسجيل الدخول
    currentUser = await authService.getCurrentUser()
    
    if (currentUser) {
        showAdminPanel()
        await loadDashboardData()
    } else {
        showLoginForm()
    }

    // إعداد نموذج تسجيل الدخول
    document.getElementById('loginForm').addEventListener('submit', handleLogin)
    document.getElementById('propertyForm').addEventListener('submit', handlePropertySubmit)
})

// عرض نموذج تسجيل الدخول
function showLoginForm() {
    document.getElementById('loginContainer').style.display = 'flex'
    document.getElementById('adminContainer').style.display = 'none'
}

// عرض لوحة التحكم
function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none'
    document.getElementById('adminContainer').style.display = 'block'
    
    if (currentUser) {
        document.getElementById('adminName').textContent = `مرحباً، ${currentUser.admin.name}`
    }
}

// معالجة تسجيل الدخول
async function handleLogin(e) {
    e.preventDefault()
    
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
    try {
        currentUser = await authService.signInAdmin(email, password)
        showAdminPanel()
        await loadDashboardData()
        showNotification('تم تسجيل الدخول بنجاح', 'success')
    } catch (error) {
        showNotification(error.message, 'error')
    }
}

// تسجيل الخروج
async function logout() {
    try {
        await authService.signOut()
        currentUser = null
        showLoginForm()
        showNotification('تم تسجيل الخروج بنجاح', 'success')
    } catch (error) {
        showNotification('حدث خطأ أثناء تسجيل الخروج', 'error')
    }
}

// تحميل بيانات لوحة المعلومات
async function loadDashboardData() {
    try {
        // تحميل العقارات
        currentProperties = await propertyService.getAllProperties()
        
        // تحميل الاستفسارات
        currentInquiries = await inquiryService.getAllInquiries()
        
        // تحديث الإحصائيات
        updateStats()
        
        // تحديث الجداول
        updatePropertiesTable()
        updateInquiriesTable()
        
    } catch (error) {
        showNotification('حدث خطأ في تحميل البيانات', 'error')
        console.error(error)
    }
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('totalProperties').textContent = currentProperties.length
    document.getElementById('availableProperties').textContent = 
        currentProperties.filter(p => p.status === 'متاح').length
    document.getElementById('totalInquiries').textContent = currentInquiries.length
    document.getElementById('featuredProperties').textContent = 
        currentProperties.filter(p => p.featured).length
}

// عرض قسم معين
function showSection(sectionName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active')
    })
    
    // إزالة الفئة النشطة من جميع أزرار التنقل
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active')
    })
    
    // عرض القسم المحدد
    document.getElementById(sectionName).classList.add('active')
    
    // تفعيل زر التنقل المحدد
    event.target.classList.add('active')
}

// تحديث جدول العقارات
function updatePropertiesTable() {
    const tableContainer = document.getElementById('propertiesTable')
    
    if (currentProperties.length === 0) {
        tableContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">لا توجد عقارات</p>'
        return
    }
    
    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>العنوان</th>
                    <th>النوع</th>
                    <th>المدينة</th>
                    <th>السعر</th>
                    <th>الحالة</th>
                    <th>مميز</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${currentProperties.map(property => `
                    <tr>
                        <td>${property.title}</td>
                        <td>${property.property_type}</td>
                        <td>${property.location_city}</td>
                        <td>${formatPrice(property.price)} ريال</td>
                        <td>
                            <span class="status-badge ${getStatusClass(property.status)}">
                                ${property.status}
                            </span>
                        </td>
                        <td>${property.featured ? '⭐' : '-'}</td>
                        <td>
                            <button class="btn btn-primary" onclick="editProperty('${property.id}')" style="margin-left: 5px; padding: 5px 10px; font-size: 0.8rem;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger" onclick="deleteProperty('${property.id}')" style="padding: 5px 10px; font-size: 0.8rem;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `
    
    tableContainer.innerHTML = table
}

// تحديث جدول الاستفسارات
function updateInquiriesTable() {
    const tableContainer = document.getElementById('inquiriesTable')
    
    if (currentInquiries.length === 0) {
        tableContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">لا توجد استفسارات</p>'
        return
    }
    
    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>الاسم</th>
                    <th>الهاتف</th>
                    <th>العقار</th>
                    <th>النوع</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${currentInquiries.map(inquiry => `
                    <tr>
                        <td>${inquiry.name}</td>
                        <td>${inquiry.phone}</td>
                        <td>${inquiry.properties?.title || 'غير محدد'}</td>
                        <td>${inquiry.inquiry_type}</td>
                        <td>
                            <select onchange="updateInquiryStatus('${inquiry.id}', this.value)" style="padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                                <option value="جديد" ${inquiry.status === 'جديد' ? 'selected' : ''}>جديد</option>
                                <option value="قيد المراجعة" ${inquiry.status === 'قيد المراجعة' ? 'selected' : ''}>قيد المراجعة</option>
                                <option value="تم الرد" ${inquiry.status === 'تم الرد' ? 'selected' : ''}>تم الرد</option>
                                <option value="مغلق" ${inquiry.status === 'مغلق' ? 'selected' : ''}>مغلق</option>
                            </select>
                        </td>
                        <td>${formatDate(inquiry.created_at)}</td>
                        <td>
                            <button class="btn btn-primary" onclick="viewInquiry('${inquiry.id}')" style="padding: 5px 10px; font-size: 0.8rem;">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `
    
    tableContainer.innerHTML = table
}

// فتح مودال العقار
function openPropertyModal(propertyId = null) {
    editingPropertyId = propertyId
    const modal = document.getElementById('propertyModal')
    const form = document.getElementById('propertyForm')
    const title = document.getElementById('modalTitle')
    
    if (propertyId) {
        // تعديل عقار موجود
        const property = currentProperties.find(p => p.id === propertyId)
        if (property) {
            title.textContent = 'تعديل العقار'
            fillPropertyForm(property)
        }
    } else {
        // إضافة عقار جديد
        title.textContent = 'إضافة عقار جديد'
        form.reset()
    }
    
    modal.style.display = 'block'
}

// إغلاق مودال العقار
function closePropertyModal() {
    document.getElementById('propertyModal').style.display = 'none'
    editingPropertyId = null
}

// ملء نموذج العقار بالبيانات
function fillPropertyForm(property) {
    const form = document.getElementById('propertyForm')
    
    form.title.value = property.title || ''
    form.description.value = property.description || ''
    form.price.value = property.price || ''
    form.price_type.value = property.price_type || ''
    form.location_city.value = property.location_city || ''
    form.location_district.value = property.location_district || ''
    form.property_type.value = property.property_type || ''
    form.bedrooms.value = property.bedrooms || ''
    form.bathrooms.value = property.bathrooms || ''
    form.area.value = property.area || ''
    form.agent_name.value = property.agent_name || ''
    form.agent_phone.value = property.agent_phone || ''
    form.status.value = property.status || 'متاح'
    form.featured.checked = property.featured || false
}

// معالجة إرسال نموذج العقار
async function handlePropertySubmit(e) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const propertyData = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        price_type: formData.get('price_type'),
        location_city: formData.get('location_city'),
        location_district: formData.get('location_district'),
        property_type: formData.get('property_type'),
        bedrooms: parseInt(formData.get('bedrooms')) || 0,
        bathrooms: parseInt(formData.get('bathrooms')) || 0,
        area: parseFloat(formData.get('area')) || 0,
        agent_name: formData.get('agent_name'),
        agent_phone: formData.get('agent_phone'),
        status: formData.get('status'),
        featured: formData.has('featured'),
        features: [],
        images: [],
        virtual_360: {}
    }
    
    try {
        if (editingPropertyId) {
            // تحديث عقار موجود
            await propertyService.updateProperty(editingPropertyId, propertyData)
            showNotification('تم تحديث العقار بنجاح', 'success')
        } else {
            // إضافة عقار جديد
            await propertyService.createProperty(propertyData)
            showNotification('تم إضافة العقار بنجاح', 'success')
        }
        
        closePropertyModal()
        await loadDashboardData()
        
    } catch (error) {
        showNotification('حدث خطأ في حفظ العقار', 'error')
        console.error(error)
    }
}

// تعديل عقار
function editProperty(propertyId) {
    openPropertyModal(propertyId)
}

// حذف عقار
async function deleteProperty(propertyId) {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) {
        return
    }
    
    try {
        await propertyService.deleteProperty(propertyId)
        showNotification('تم حذف العقار بنجاح', 'success')
        await loadDashboardData()
    } catch (error) {
        showNotification('حدث خطأ في حذف العقار', 'error')
        console.error(error)
    }
}

// تحديث حالة الاستفسار
async function updateInquiryStatus(inquiryId, newStatus) {
    try {
        await inquiryService.updateInquiryStatus(inquiryId, newStatus)
        showNotification('تم تحديث حالة الاستفسار', 'success')
        await loadDashboardData()
    } catch (error) {
        showNotification('حدث خطأ في تحديث الحالة', 'error')
        console.error(error)
    }
}

// عرض تفاصيل الاستفسار
function viewInquiry(inquiryId) {
    const inquiry = currentInquiries.find(i => i.id === inquiryId)
    if (inquiry) {
        alert(`
الاسم: ${inquiry.name}
الهاتف: ${inquiry.phone}
البريد: ${inquiry.email || 'غير محدد'}
الرسالة: ${inquiry.message || 'لا توجد رسالة'}
        `)
    }
}

// دوال مساعدة
function formatPrice(price) {
    return new Intl.NumberFormat('ar-SA').format(price)
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-SA')
}

function getStatusClass(status) {
    switch (status) {
        case 'متاح': return 'status-available'
        case 'مباع': return 'status-sold'
        default: return 'status-new'
    }
}

// نظام الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? 'var(--success-color)' : 
                    type === 'error' ? 'var(--danger-color)' : 
                    'var(--primary-color)'};
    `
    
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease'
        setTimeout(() => {
            document.body.removeChild(notification)
        }, 300)
    }, 3000)
}

// تصدير الدوال للاستخدام العام
window.showSection = showSection
window.logout = logout
window.openPropertyModal = openPropertyModal
window.closePropertyModal = closePropertyModal
window.editProperty = editProperty
window.deleteProperty = deleteProperty
window.updateInquiryStatus = updateInquiryStatus
window.viewInquiry = viewInquiry
