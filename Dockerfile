# ==============================================================================
# Dockerfile chuẩn hóa cho ứng dụng Web Node.js theo chuẩn DevSecOps & Best Practices
# ==============================================================================

# 1. Base Image: Dùng phiên bản cụ thể kèm Alpine để dung lượng siêu nhẹ (~50MB) và giảm lỗ hổng bảo mật
FROM node:20-alpine AS base

# Thêm metadata nhãn cho image
LABEL maintainer="devsecops-team" \
      description="Game Co X-O Web Application" \
      version="1.0.0"

# Thiết lập biến môi trường
ENV NODE_ENV=production \
    PORT=3000

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Tối ưu Layer Caching: Copy package.json trước
COPY package*.json ./

# Cài đặt dependencies (nếu có thêm package sau này, --omit=dev để loại bỏ devDependencies)
# RUN npm ci --omit=dev

# 4. Copy toàn bộ mã nguồn ứng dụng
COPY --chown=node:node index.html style.css script.js server.js ./

# 5. Phân quyền và bảo mật (BẮT BUỘC TRONG DEVSECOPS)
# Tuyệt đối không chạy container dưới quyền 'root' để tránh lỗ hổng leo thang đặc quyền
USER node

# 6. Khai báo cổng ứng dụng lắng nghe
EXPOSE 3000

# 7. Healthcheck: Để Docker/Kubernetes tự động kiểm tra xem ứng dụng còn sống hay không
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# 8. Chạy ứng dụng dưới dạng exec form ["executable", "param"] để xử lý đúng tín hiệu SIGTERM/SIGINT
CMD ["node", "server.js"]

