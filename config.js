
module.exports = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    STRIPE_API_TOKEN: process.env.STRIPE_API_TOKEN || ""
};

// ==============================================================================
// MÃ THỬ NGHIỆM SAST: CÁC LỖ HỔNG BẢO MẬT KINH ĐIỂN (DEVSECOPS LAB)
// ==============================================================================

// LỖI 1 (CWE-95): Sử dụng hàm nguy hiểm eval() để thực thi code từ input người dùng
function calculateExpression(userInput) {
    // Lỗ hổng: Kẻ tấn công có thể chèn mã độc thực thi tùy ý trên máy chủ
    return eval(userInput);
}

// LỖI 2 (CWE-89): Ghép chuỗi trực tiếp vào câu lệnh SQL (SQL Injection)
function getUserData(userId) {
    // Lỗ hổng: Không tham số hóa (Parameterized Query) tạo cơ hội khai thác SQL Injection
    const sqlQuery = "SELECT * FROM users WHERE id = '" + userId + "' AND active = 1";
    return sqlQuery;
}