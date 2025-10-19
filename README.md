# Women's Day 20/10 - Next.js Version 🌹

Trang web chúc mừng ngày Phụ nữ Việt Nam 20/10 với hiệu ứng animation đẹp mắt.

## 🎨 Tính năng

- Animation vẽ hoa hồng đẹp mắt
- Hiệu ứng phong bì Valentine có thể mở
- Thư chúc mừng với hiệu ứng typewriter
- Responsive design
- Các hiệu ứng bụi ma thuật

## 🚀 Cài đặt và chạy local

### Yêu cầu
- Node.js 18.0 trở lên
- npm hoặc yarn

### Các bước cài đặt

1. Cài đặt dependencies:
```bash
npm install
# hoặc
yarn install
```

2. Chạy development server:
```bash
npm run dev
# hoặc
yarn dev
```

3. Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000)

## 📦 Build cho production

```bash
npm run build
npm start
# hoặc
yarn build
yarn start
```

## 🌐 Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard (Đơn giản nhất)

1. Đẩy code lên GitHub repository
2. Truy cập [vercel.com](https://vercel.com)
3. Đăng nhập và click "Add New Project"
4. Import repository GitHub của bạn
5. Vercel sẽ tự động phát hiện cấu hình Next.js
6. Click "Deploy" và đợi vài phút

### Cách 2: Deploy qua Vercel CLI

1. Cài đặt Vercel CLI:
```bash
npm install -g vercel
```

2. Login vào Vercel:
```bash
vercel login
```

3. Deploy project:
```bash
vercel
```

4. Để deploy production:
```bash
vercel --prod
```

## 📝 Tùy chỉnh nội dung

### Thay đổi nội dung thư

Mở file `app/page.tsx` và tìm đến dòng:

```typescript
const textLetterP = "Hôm nay là ngày 20/10. Xin gửi lời chúc tới người tớ yêu thương nhất..."
```

Thay đổi nội dung này thành lời chúc của bạn.

### Thay đổi tiêu đề thư

Tìm dòng:

```typescript
const textLetterH2 = 'Gửi cậu!'
```

Thay đổi thành tiêu đề bạn muốn.

### Thay đổi hình ảnh

Thay thế các file hình ảnh trong thư mục `public/images/` bằng hình ảnh của bạn, giữ nguyên tên file.

## 🛠️ Công nghệ sử dụng

- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Anime.js** - Animation library
- **CSS3** - Styling và animations

## 📂 Cấu trúc thư mục

```
.
├── app/
│   ├── layout.tsx      # Layout chính
│   ├── page.tsx        # Trang chủ
│   └── globals.css     # CSS toàn cục
├── public/
│   └── images/         # Hình ảnh
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## 🎯 Lưu ý

- Đảm bảo có kết nối internet khi chạy vì project sử dụng các CDN cho fonts và icons
- Nếu muốn tối ưu hơn, có thể tải các fonts và icons về local
- Project đã được tối ưu cho Vercel deployment

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

## 💝 Chúc bạn một ngày 20/10 thật vui vẻ!

