import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// دوال إدارة العقارات
export const propertyService = {
  // جلب جميع العقارات
  async getAllProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // جلب العقارات المميزة
  async getFeaturedProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('featured', true)
      .eq('status', 'متاح')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // جلب عقار واحد
  async getProperty(id) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // إضافة عقار جديد
  async createProperty(propertyData) {
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // تحديث عقار
  async updateProperty(id, propertyData) {
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // حذف عقار
  async deleteProperty(id) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // البحث في العقارات
  async searchProperties(filters) {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'متاح')

    if (filters.city) {
      query = query.eq('location_city', filters.city)
    }
    
    if (filters.district) {
      query = query.eq('location_district', filters.district)
    }
    
    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType)
    }
    
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice)
    }
    
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// دوال إدارة الاستفسارات
export const inquiryService = {
  // إرسال استفسار جديد
  async createInquiry(inquiryData) {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([inquiryData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // جلب جميع الاستفسارات (للمديرين فقط)
  async getAllInquiries() {
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        properties (
          title,
          location_city,
          location_district
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // تحديث حالة الاستفسار
  async updateInquiryStatus(id, status) {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// دوال المصادقة للمديرين
export const authService = {
  // تسجيل دخول المدير
  async signInAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    // التحقق من أن المستخدم مدير
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (adminError || !adminData) {
      await supabase.auth.signOut()
      throw new Error('غير مصرح لك بالدخول')
    }
    
    return { user: data.user, admin: adminData }
  },

  // تسجيل خروج
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // جلب المستخدم الحالي
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single()
    
    return adminData ? { user, admin: adminData } : null
  }
}
