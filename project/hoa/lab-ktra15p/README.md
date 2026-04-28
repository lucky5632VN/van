# QuantumLab v4.0 - SmartChemistry Lab

## Hướng dẫn cài đặt (Local Development)

1. **Cài đặt NodeJS:** Đảm bảo bạn đã cài đặt NodeJS trên máy tính.
2. **Cài đặt thư viện:** Chạy lệnh `npm install` trong thư mục dự án.
3. **Cấu hình API Key:**
   - Tạo file `.env` từ file `.env.example`.
   - Dán Gemini API Key của bạn vào biến `VITE_GEMINI_API_KEY`.
4. **Chạy dự án:** Chạy lệnh `npm run dev`.
5. **Truy cập:** Mở trình duyệt tại địa chỉ `http://localhost:5173`.

## Triển khai lên Vercel

1. Đẩy dự án lên GitHub.
2. Kết nối GitHub repository với Vercel.
3. Trong phần **Environment Variables** trên Vercel Dashboard, thêm biến:
   - Key: `VITE_GEMINI_API_KEY`
   - Value: `(API Key của bạn)`
4. Vercel sẽ tự động build và deploy.

---
*Dự án STEM của Hồ Hoàng Anh & Nguyễn Công Cẩn (11A1)*
