# MÔ HÌNH 3D MẢNG KIẾN TẠO TRÁI ĐẤT

Mô hình 3D chuyên nghiệp mô phỏng chân thực các mảng kiến tạo của Trái Đất với hiệu ứng ghép nối và chuyển động động học.

## Tính năng nổi bật

### 1. Đồ họa chuyên nghiệp
- **Trái Đất bán trong suốt**: Sử dụng custom shader với hiệu ứng Fresnel
- **7 mảng kiến tạo 3D**: Mỗi mảng có độ dày thực tế (150km thu nhỏ)
- **Texture procedural**: Mô phỏng đá bazan-granit với độ nhám tự nhiên
- **PBR Material**: Physically Based Rendering với roughness và metalness
- **Normal mapping**: Tạo độ nhấp nhô chi tiết cho bề mặt

### 2. Hiệu ứng đặc biệt
- **Glow effect**: Phát sáng tại ranh giới các mảng (giống magma)
- **Dynamic lighting**: Nhiều nguồn sáng với shadow mapping
- **Post-processing**: Tone mapping và color grading chuyên nghiệp

### 3. Animation
- **Chuyển động ghép mảng**: Mảng từ vị trí tách ra ghép lại
- **Ease in-out**: Chuyển động mượt mà, tự nhiên
- **Tốc độ điều chỉnh**: Từ 0.1x đến 3x
- **Điều khiển linh hoạt**: Play, Pause, Reset

### 4. Tương tác
- **OrbitControls**: Xoay, zoom, pan mô hình
- **Auto-rotate**: Tự động xoay chậm
- **Responsive**: Tự động điều chỉnh theo kích thước màn hình

### 5. Xuất file
- **Export GLTF/GLB**: Xuất mô hình để dùng trong Blender, Unity, Unreal Engine
- **Bao gồm texture**: Tất cả material và ánh sáng được xuất kèm

## Cách sử dụng

### Bước 1: Mở file
Mở file `tectonic_plates_3d.html` bằng trình duyệt web hiện đại:
- Google Chrome (khuyến nghị)
- Microsoft Edge
- Firefox
- Safari

**Lưu ý**: File yêu cầu kết nối internet lần đầu để tải thư viện Three.js từ CDN.

### Bước 2: Điều khiển mô hình

#### Điều khiển chuột
- **Chuột trái + kéo**: Xoay mô hình
- **Chuột phải + kéo**: Di chuyển mô hình
- **Cuộn chuột**: Phóng to/thu nhỏ

#### Bảng điều khiển Animation
- **▶ Phát Animation**: Bắt đầu chuyển động ghép mảng
- **⏸ Tạm dừng**: Dừng animation ở vị trí hiện tại
- **⟲ Reset**: Đưa các mảng về vị trí ban đầu

#### Tùy chọn
- **Tốc độ animation**: Kéo thanh trượt để điều chỉnh (0.1x - 3x)
- **Hiệu ứng phát sáng**: Bật/tắt glow effect tại ranh giới
- **Hiển thị Trái Đất**: Bật/tắt hình cầu Trái Đất bán trong suốt

### Bước 3: Xuất file 3D
1. Click nút **📦 Xuất GLTF**
2. File sẽ được tải xuống với tên `tectonic_plates_model.glb`
3. Import vào phần mềm 3D:
   - **Blender**: File → Import → glTF 2.0
   - **Unity**: Kéo thả vào Assets
   - **Unreal Engine**: Import FBX (chuyển đổi từ GLB)

## Chi tiết kỹ thuật

### Các mảng kiến tạo

| Mảng | Màu sắc | Vị trí địa lý |
|------|---------|---------------|
| Mảng Thái Bình Dương | Xanh dương | Đại Tây Dương |
| Mảng Bắc Mỹ | Đỏ | Bắc Mỹ, Greenland |
| Mảng Nam Mỹ | Xanh lá | Nam Mỹ |
| Mảng Phi | Cam | Châu Phi |
| Mảng Âu-Á | Tím | Châu Âu + Châu Á |
| Mảng Ấn-Úc | Xanh ngọc | Ấn Độ + Úc |
| Mảng Nam Cực | Trắng xám | Nam Cực |

### Thông số kỹ thuật
- **Bán kính Trái Đất**: 5 units (thu nhỏ)
- **Độ dày mảng**: 0.15 units (~150km thực tế)
- **Polygon count**: ~50,000 triangles
- **Texture resolution**: 512x512 per plate
- **Animation duration**: 20 giây

### Công nghệ sử dụng
- **Three.js v0.160**: WebGL framework
- **Custom GLSL Shaders**: Vertex & Fragment shaders
- **Canvas API**: Procedural texture generation
- **OrbitControls**: Camera control
- **GLTFExporter**: Model export

## Yêu cầu hệ thống

### Tối thiểu
- CPU: Intel Core i3 hoặc tương đương
- RAM: 4GB
- GPU: Intel HD Graphics 4000 hoặc tương đương
- Trình duyệt: Chrome 90+, Firefox 88+, Edge 90+

### Khuyến nghị
- CPU: Intel Core i5 hoặc tương đương
- RAM: 8GB
- GPU: NVIDIA GTX 1050 hoặc tương đương
- Trình duyệt: Chrome mới nhất

## Tùy biến nâng cao

### Thay đổi màu sắc mảng
Tìm biến `plateData` trong code (dòng ~410) và sửa thuộc tính `color`:

```javascript
{
    name: 'Pacific',
    color: '#3498db', // Đổi mã màu hex tại đây
    ...
}
```

### Điều chỉnh độ dày mảng
Thay đổi constant `PLATE_THICKNESS` (dòng ~86):

```javascript
const PLATE_THICKNESS = 0.15; // Tăng/giảm giá trị này
```

### Thay đổi tốc độ animation
Sửa `ANIMATION_DURATION` (dòng ~87):

```javascript
const ANIMATION_DURATION = 20; // Thời gian tính bằng giây
```

### Thêm texture thật
Thay thế hàm `createRockTexture()` bằng texture loader:

```javascript
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('path/to/your/texture.jpg');
```

## Khắc phục sự cố

### Mô hình không hiển thị
- Kiểm tra console (F12) để xem lỗi
- Đảm bảo có kết nối internet (để tải Three.js)
- Thử trình duyệt khác

### Hiệu suất chậm
- Giảm pixel ratio: `renderer.setPixelRatio(1);`
- Tắt shadow: `renderer.shadowMap.enabled = false;`
- Giảm độ phân giải texture

### Không xuất được GLTF
- Kiểm tra console để xem lỗi chi tiết
- Thử xuất scene nhỏ hơn (tắt một số mảng)

## Ứng dụng

### Giáo dục
- Giảng dạy địa chất học
- Minh họa kiến tạo mảng
- Phim tài liệu khoa học

### Nghiên cứu
- Mô phỏng chuyển động mảng
- Nghiên cứu động đất
- Phân tích ranh giới mảng

### Truyền thông
- Video motion graphics
- Presentation chuyên nghiệp
- Museum exhibits

## Phát triển thêm

### Tính năng có thể thêm
- [ ] Thêm các mảng kiến tạo nhỏ (Philippine, Cocos, Nazca...)
- [ ] Animation chuyển động thực tế dựa trên GPS
- [ ] Hiển thị động đất lịch sử
- [ ] Thêm núi lửa và dãy núi
- [ ] VR/AR support
- [ ] Mobile touch controls
- [ ] Chế độ xem mặt cắt
- [ ] Timeline slider để xem quá khứ/tương lai

## Giấy phép

Mô hình này được tạo cho mục đích giáo dục và nghiên cứu. Bạn có thể:
- Sử dụng cho mục đích phi thương mại
- Chỉnh sửa và phát triển thêm
- Chia sẻ với người khác

Vui lòng ghi nguồn khi sử dụng.

## Liên hệ & Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi:
- Kiểm tra phần "Khắc phục sự cố" ở trên
- Mở console (F12) để xem chi tiết lỗi
- Đảm bảo sử dụng trình duyệt và GPU tương thích

## Credits

- **Three.js**: https://threejs.org/
- **Dữ liệu địa chất**: USGS (United States Geological Survey)
- **Concept**: Plate Tectonics Theory (Alfred Wegener, 1912)

---

**Phiên bản**: 1.0
**Ngày tạo**: 2025
**Tương thích**: Chrome 90+, Firefox 88+, Edge 90+

Chúc bạn khám phá mô hình vui vẻ!
