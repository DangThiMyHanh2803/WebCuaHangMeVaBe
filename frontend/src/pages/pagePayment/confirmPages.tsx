import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ORDER_API_URL = "http://localhost:5000/api/orders";

const wrapperStyle: React.CSSProperties = {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "100vh", backgroundColor: "#f4f6f9", margin: 0, padding: "20px"
};
const boxStyle: React.CSSProperties = {
    maxWidth: "480px", width: "100%", padding: "40px 30px",
    backgroundColor: "#fff", borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)", textAlign: "center", fontFamily: "Arial, sans-serif"
};
const btnStyle: React.CSSProperties = {
    backgroundColor: "#ff69b4", color: "#fff", border: "none",
    padding: "14px 40px", borderRadius: "30px", fontSize: "16px",
    fontWeight: "bold", cursor: "pointer", marginTop: "25px", width: "100%"
};
const successBtnGroupStyle: React.CSSProperties = { display: "flex", gap: "15px", marginTop: "25px", width: "100%" };
const btnHomeStyle: React.CSSProperties = {
    flex: 1, backgroundColor: "#fff", color: "#ff69b4", border: "2px solid #ff69b4",
    padding: "12px 15px", borderRadius: "25px", fontSize: "14px", fontWeight: "bold", cursor: "pointer"
};
const btnHistoryStyle: React.CSSProperties = {
    flex: 1, backgroundColor: "#ff69b4", color: "#fff", border: "none",
    padding: "12px 15px", borderRadius: "25px", fontSize: "14px", fontWeight: "bold", cursor: "pointer"
};

const clearPurchasedItems = (checkoutProducts: any[]) => {
    const saved = localStorage.getItem("cart_products");
    if (saved && checkoutProducts?.length > 0) {
        const currentCart = JSON.parse(saved);
        const checkoutKeys = checkoutProducts.map((p: any) => `${p.id || p.productId}-${p.size}`);
        const updatedCart = currentCart.filter((p: any) => !checkoutKeys.includes(`${p.id}-${p.size}`));
        localStorage.setItem("cart_products", JSON.stringify(updatedCart));
    }
};

// ==========================================
// 1. COD (Thanh toán khi nhận hàng)
// ==========================================
export const ConfirmCOD: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = currentUser.userId || null;

    const stateData = location.state || {};
    const addressId = stateData.addressId || 1;
    const checkoutProducts = stateData.checkoutProducts || [];
    const finalTotal = stateData.finalTotal || 0;
    const finalAmountWithShip = finalTotal + 25000;

    const handleCompleteOrder = async () => {
        setIsSubmitting(true);
        try {
            const items = checkoutProducts.map((p: any) => ({
                productId: p.id || p.productId,
                quantity: p.quantity || 1,
                price: p.priceBySize ? (p.priceBySize[p.size] || 0) : (p.price || 0),
                size: p.size || "M"
            }));

            await axios.post(ORDER_API_URL, {
                userId,
                addressId,
                totalAmount: finalAmountWithShip,
                finalAmount: finalAmountWithShip,
                paymentMethod: "COD",
                status: "Pending",
                items
            });

            clearPurchasedItems(checkoutProducts);
            setIsSuccess(true);
        } catch (error: any) {
            console.error("Lỗi đặt hàng COD:", error);
            if (error.response?.status === 404) {
                alert(`Lỗi 404: Không tìm thấy route ${ORDER_API_URL}`);
            } else {
                alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) return (
        <div style={wrapperStyle}><div style={boxStyle}>
            <div style={{ fontSize: "70px", marginBottom: "15px" }}>🎉</div>
            <h2 style={{ color: "#333", marginBottom: "10px" }}>Đặt hàng thành công!</h2>
            <p style={{ color: "#666", fontSize: "15px" }}>Đơn hàng COD đã được ghi nhận. Hệ thống đang tiến hành đóng gói!</p>
            <div style={successBtnGroupStyle}>
                <button style={btnHomeStyle} onClick={() => navigate("/")}>Hoàn thành</button>
                <button style={btnHistoryStyle} onClick={() => navigate("/history")}>Xem lịch sử đặt hàng</button>
            </div>
        </div></div>
    );

    return (
        <div style={wrapperStyle}><div style={boxStyle}>
            <div style={{ color: "#ff69b4", fontSize: "60px", marginBottom: "15px" }}>📦</div>
            <h2 style={{ color: "#333", margin: "0 0 10px 0" }}>Xác nhận đặt hàng COD</h2>
            <p style={{ color: "#666", fontSize: "14px" }}>Thanh toán tiền mặt khi nhận hàng</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#ff69b4", margin: "20px 0" }}>
                {finalAmountWithShip.toLocaleString()}đ
            </p>
            <button style={btnStyle} disabled={isSubmitting} onClick={handleCompleteOrder}>
                {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
        </div></div>
    );
};

// ==========================================
// 3. VNPAY — Redirect sang cổng VNPAY sandbox
// ==========================================
export const ConfirmVNPAY: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [step, setStep] = useState<"card" | "otp">("card");

    // Thông tin số thẻ test và OTP mặc định của VNPAY sandbox
    const TEST_CARD = {
        cardNumber: "9704198526191432198",
        otp: "123456"
    };

    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiry, setExpiry] = useState("");
    const [otp, setOtp] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = currentUser.userId || null;

    const stateData = location.state || {};
    const addressId = stateData.addressId || 1;
    const checkoutProducts = stateData.checkoutProducts || [];
    const finalTotal = stateData.finalTotal || 0;
    const finalAmountWithShip = finalTotal + 25000;

    // Bước 1: Kiểm tra thông tin điền vào form
    const handleSubmitCard = () => {
        setErrorMsg("");
        const cleanCardNumber = cardNumber.replace(/\s/g, "");
        const cleanHolder = cardHolder.trim();

        if (!cleanCardNumber || !cleanHolder || !expiry) {
            setErrorMsg("Vui lòng nhập đầy đủ thông tin thẻ!");
            return;
        }
        if (cleanCardNumber !== TEST_CARD.cardNumber) {
            setErrorMsg("Số thẻ không đúng. Vui lòng dùng số thẻ test sandbox hợp lệ!");
            return;
        }
        setStep("otp");
    };

    // Bước 2: Xác thực OTP rồi tạo đơn hàng
    const handleConfirmVNPAY = async () => {
        setErrorMsg("");
        if (otp !== TEST_CARD.otp) {
            setErrorMsg("Mã OTP không đúng. Vui lòng nhập lại!");
            return;
        }

        setIsSubmitting(true);
        try {
            const items = checkoutProducts.map((p: any) => ({
                productId: p.id || p.productId,
                quantity: p.quantity || 1,
                price: p.priceBySize ? (p.priceBySize[p.size] || 0) : (p.price || 0),
                size: p.size || "M"
            }));

            await axios.post(ORDER_API_URL, {
                userId,
                addressId,
                totalAmount: finalAmountWithShip,
                finalAmount: finalAmountWithShip,
                paymentMethod: "VNPAY",
                status: "Confirmed",
                items
            });

            clearPurchasedItems(checkoutProducts);
            setIsSuccess(true);
        } catch (error) {
            console.error("Lỗi đặt hàng VNPAY:", error);
            alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Màn thành công
    if (isSuccess) return (
        <div style={wrapperStyle}><div style={boxStyle}>
            <div style={{ fontSize: "70px", marginBottom: "15px" }}>🎉</div>
            <h2 style={{ color: "#333", marginBottom: "10px" }}>Thanh toán thành công!</h2>
            <p style={{ color: "#666", fontSize: "15px" }}>Giao dịch VNPAY đã hoàn tất.</p>
            <div style={successBtnGroupStyle}>
                <button style={btnHomeStyle} onClick={() => navigate("/")}>Hoàn thành</button>
                <button style={btnHistoryStyle} onClick={() => navigate("/history")}>Xem lịch sử đặt hàng</button>
            </div>
        </div></div>
    );

    // ✅ Bước OTP
    if (step === "otp") return (
        <div style={wrapperStyle}><div style={boxStyle}>
            <div style={{ color: "#005baa", fontSize: "50px", fontWeight: "bold", marginBottom: "10px" }}>🔑</div>
            <h2 style={{ color: "#005baa", margin: "0 0 10px 0" }}>Xác thực OTP</h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>
                OTP đã được gửi về số điện thoại đăng ký.
            </p>
            <p style={{ fontSize: "22px", fontWeight: "bold", color: "#333", margin: "15px 0" }}>
                {finalAmountWithShip.toLocaleString()} VND
            </p>
            <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                    width: "93%", padding: "12px", borderRadius: "8px",
                    border: "1px solid #ccc", fontSize: "16px", letterSpacing: "2px",
                    textAlign: "center", marginBottom: "10px"
                }}
            />
            {errorMsg && (
                <p style={{ color: "#f44336", fontSize: "13px", margin: "5px 0" }}>{errorMsg}</p>
            )}
            <button
                style={{ ...btnStyle, backgroundColor: "#005baa" }}
                disabled={isSubmitting}
                onClick={handleConfirmVNPAY}
            >
                {isSubmitting ? "Đang xác thực..." : "Thanh toán"}
            </button>
            <button
                style={{ ...btnHomeStyle, marginTop: "10px", width: "100%", border: "none", color: "#888" }}
                onClick={() => setStep("card")}
            >
                ← Quay lại
            </button>
        </div></div>
    );

    // ✅ Bước nhập thẻ (Mặc định)
    return (
        <div style={wrapperStyle}><div style={boxStyle}>
            <div style={{ color: "#005baa", fontSize: "60px", fontWeight: "bold", marginBottom: "15px" }}>💳</div>
            <h2 style={{ color: "#005baa", margin: "0 0 10px 0" }}>Thanh toán qua Ngân hàng </h2>
            <p style={{ color: "#666", fontSize: "14px", margin: "0 0 5px 0" }}>
                Đơn hàng tại: <strong>Babyshop</strong>
            </p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#333", margin: "15px 0" }}>
                {finalAmountWithShip.toLocaleString()} VND
            </p>

            <div style={{ textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "5px" }}>Số thẻ</label>
                <input
                    type="text"
                    placeholder="Nhập số thẻ"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{ width: "93%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px", fontSize: "14px" }}
                />

                <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "5px" }}>Tên chủ thẻ</label>
                <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    style={{ width: "93%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px", fontSize: "14px" }}
                />

                <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "5px" }}>Ngày phát hành (mm/dd)</label>
                <input
                    type="text"
                    placeholder="mm/dd"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    style={{ width: "93%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "5px", fontSize: "14px" }}
                />
            </div>

            {errorMsg && (
                <p style={{ color: "#f44336", fontSize: "13px", margin: "8px 0 0 0" }}>{errorMsg}</p>
            )}

            <button
                style={{ ...btnStyle, backgroundColor: "#005baa" }}
                onClick={handleSubmitCard}
            >
                Tiếp tục
            </button>
        </div></div>
    );
};