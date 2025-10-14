# دليل تعديل العرض 360 درجة

## 1. مكان بيانات الصور والفيديوهات 360

في ملف `script.js` ابحث عن `propertyData` (حوالي السطر 400):

```javascript
const propertyData = {
    villa1: {
        // ... باقي البيانات
        virtual360: {
            images: [
                'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1200'
            ],
            videos: [
                'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
            ]
        }
    }
}
```

## 2. كيفية إضافة صور 360 لعقار جديد

```javascript
propertyName: {
    // ... باقي بيانات العقار
    virtual360: {
        images: [
            'رابط_الصورة_الأولى_360.jpg',
            'رابط_الصورة_الثانية_360.jpg',
            'رابط_الصورة_الثالثة_360.jpg'
        ],
        videos: [
            'رابط_الفيديو_360.mp4'
        ]
    }
}
```

## 3. كود تهيئة العارض 360

في ملف `script.js` ابحث عن `init360Viewer` (حوالي السطر 1200):

```javascript
function init360Viewer(propertyId, imageUrl) {
    // كود تهيئة العارض
    viewers[propertyId] = pannellum.viewer(viewerId, {
        type: 'equirectangular',
        panorama: imageUrl,
        autoLoad: true,
        autoRotate: -2,
        compass: true,
        // ... باقي الإعدادات
        hotSpots: [
            {
                pitch: 10,
                yaw: 0,
                type: 'info',
                text: 'غرفة المعيشة الرئيسية',
                cssClass: 'hotspot'
            }
            // يمكنك إضافة المزيد من النقاط التفاعلية هنا
        ]
    });
}
```

## 4. أزرار التحكم

في ملف `script.js` ابحث عن هذه الدوال:

- `resetView(propertyId)` - إعادة تعيين العرض
- `toggleAutoRotate(propertyId)` - تشغيل/إيقاف الدوران
- `toggleFullscreen(propertyId)` - ملء الشاشة
- `switchViewer(type, tabElement)` - التبديل بين الصور والفيديو

## 5. تنسيقات CSS للعارض 360

في ملف `styles.css` ابحث عن:

```css
.viewer-360-container {
    position: relative;
    width: 100%;
    height: 400px;
    border-radius: 15px;
    overflow: hidden;
    background: #000;
    margin: 20px 0;
}

.viewer-controls {
    /* أزرار التحكم */
}

.hotspot {
    /* تنسيق النقاط التفاعلية */
}
```

## 6. مثال سريع لإضافة عقار جديد مع 360

```javascript
newProperty: {
    title: 'عقار جديد',
    location: 'الرياض - حي النرجس',
    price: '1,500,000 ريال',
    type: 'للبيع',
    // ... باقي البيانات
    virtual360: {
        images: [
            'https://your-image-url-1.jpg',
            'https://your-image-url-2.jpg'
        ],
        videos: [
            'https://your-video-url.mp4'
        ]
    }
}
```

## ملاحظات مهمة:

1. **نوع الصور**: يجب أن تكون الصور من نوع Equirectangular (360×180 درجة)
2. **حجم الصور**: يُفضل أن تكون عالية الدقة (2048×1024 أو أكبر)
3. **تنسيق الفيديو**: MP4 مع دعم 360 درجة
4. **الروابط**: تأكد من أن الروابط صحيحة ومتاحة

## لإضافة المزيد من النقاط التفاعلية:

```javascript
hotSpots: [
    {
        pitch: 10,    // الارتفاع (-90 إلى 90)
        yaw: 0,       // الاتجاه الأفقي (-180 إلى 180)
        type: 'info',
        text: 'وصف النقطة',
        cssClass: 'hotspot'
    },
    {
        pitch: -5,
        yaw: 90,
        type: 'info',
        text: 'نقطة أخرى',
        cssClass: 'hotspot'
    }
]
```
