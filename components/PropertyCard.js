export function createPropertyCard(property) {
  const formatPrice = (price, priceType) => {
    const formattedPrice = new Intl.NumberFormat('ar-SA').format(price)
    return `${formattedPrice} ريال${priceType.includes('شهري') ? '/شهرياً' : ''}`
  }

  const getBadgeClass = (priceType) => {
    if (priceType.includes('للبيع') || priceType.includes('للتمليك')) return 'sale'
    if (priceType.includes('للإيجار')) return 'rent'
    if (priceType.includes('بالتقسيط')) return 'installment'
    return 'investment'
  }

  const mainImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'

  return `
    <div class="property-card fade-in" data-category="${property.property_type}" onclick="openPropertyDetails('${property.id}')">
      <div class="property-image">
        <img src="${mainImage}" alt="${property.title}">
        <div class="property-overlay">
          <div class="property-actions">
            <button class="action-btn favorite" onclick="event.stopPropagation(); toggleFavorite('${property.id}')">
              <i class="far fa-heart"></i>
            </button>
            <button class="action-btn share" onclick="event.stopPropagation(); shareProperty('${property.id}')">
              <i class="fas fa-share-alt"></i>
            </button>
            <button class="action-btn view-360" onclick="event.stopPropagation(); view360('${property.id}')" ${!property.virtual_360?.images?.length ? 'style="display:none"' : ''}>
              <i class="fas fa-vr-cardboard"></i>
            </button>
          </div>
        </div>
        <div class="property-badge ${getBadgeClass(property.price_type)}">${property.price_type}</div>
        <div class="property-price">${formatPrice(property.price, property.price_type)}</div>
      </div>
      
      <div class="property-content">
        <div class="property-location">
          <i class="fas fa-map-marker-alt"></i>
          <span>${property.location_city} - ${property.location_district || ''}</span>
        </div>
        
        <h3 class="property-title">${property.title}</h3>
        
        <div class="property-features">
          <div class="feature">
            <i class="fas fa-bed"></i>
            <span>${property.bedrooms || 0}</span>
          </div>
          <div class="feature">
            <i class="fas fa-bath"></i>
            <span>${property.bathrooms || 0}</span>
          </div>
          <div class="feature">
            <i class="fas fa-ruler-combined"></i>
            <span>${property.area || 0} م²</span>
          </div>
        </div>
        
        <div class="property-footer">
          <div class="agent-info">
            <img src="${property.agent_image || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'}" alt="${property.agent_name}">
            <div class="agent-details">
              <span class="agent-name">${property.agent_name || 'مستشار عقاري'}</span>
              <span class="agent-title">مستشار عقاري</span>
            </div>
          </div>
          
          <button class="view-details-btn" onclick="event.stopPropagation(); openPropertyDetails('${property.id}')">
            <span>التفاصيل</span>
            <i class="fas fa-arrow-left"></i>
          </button>
        </div>
      </div>
    </div>
  `
}
