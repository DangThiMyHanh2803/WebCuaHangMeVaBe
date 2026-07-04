import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./confirmPayment.css";

const ORDER_API_URL = "http://localhost:5000/api/orders";

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
        <div className="confirm-wrapper">
            <div className="confirm-box">
                <div style={{ fontSize: "70px", marginBottom: "15px" }}>🎉</div>
                <h2 style={{ color: "#333", marginBottom: "10px" }}>Đặt hàng thành công!</h2>
                <p style={{ color: "#666", fontSize: "15px" }}>
                    Đơn hàng COD đã được ghi nhận. Hệ thống đang tiến hành đóng gói!
                </p>
                <div className="confirm-btn-group">
                    <button className="confirm-btn-home" onClick={() => navigate("/")}>Hoàn thành</button>
                    <button className="confirm-btn-primary" onClick={() => navigate("/history")}>Xem lịch sử đặt hàng</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="confirm-wrapper">
            <div className="confirm-box">
                <div style={{ color: "#ff69b4", fontSize: "60px", marginBottom: "15px" }}>📦</div>
                <h2 style={{ color: "#333", margin: "0 0 10px 0" }}>Xác nhận đặt hàng COD</h2>
                <p style={{ color: "#666", fontSize: "14px" }}>Thanh toán tiền mặt khi nhận hàng</p>
                <p className="confirm-amount-lg" style={{ color: "#ff69b4" }}>
                    {finalAmountWithShip.toLocaleString()}đ
                </p>
                <button
                    className="confirm-btn"
                    style={{ backgroundColor: "#ff69b4" }}
                    disabled={isSubmitting}
                    onClick={handleCompleteOrder}
                >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                </button>
            </div>
        </div>
    );
};

// ==========================================
// 2. VNPAY — Form nhập thẻ sandbox
// ==========================================
export const ConfirmVNPAY: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [step, setStep] = useState<"card" | "otp">("card");

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

    // ── Màn thành công ──
    if (isSuccess) return (
        <div className="confirm-wrapper">
            <div className="confirm-box">
                <div style={{ fontSize: "70px", marginBottom: "15px" }}>🎉</div>
                <h2 style={{ color: "#333", marginBottom: "10px" }}>Thanh toán thành công!</h2>
                <p style={{ color: "#666", fontSize: "15px" }}>Giao dịch VNPAY đã hoàn tất.</p>
                <div className="confirm-btn-group">
                    <button className="confirm-btn-home" onClick={() => navigate("/")}>Hoàn thành</button>
                    <button className="confirm-btn-primary" onClick={() => navigate("/history")}>Xem lịch sử đặt hàng</button>
                </div>
            </div>
        </div>
    );

    // ── Bước OTP ──
    if (step === "otp") return (
        <div className="confirm-wrapper">
            <div className="confirm-box">
                <div style={{ color: "#005baa", fontSize: "50px", fontWeight: "bold", marginBottom: "10px" }}>🔑</div>
                <h2 style={{ color: "#005baa", margin: "0 0 10px 0" }}>Xác thực OTP</h2>
                <p style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>
                    OTP đã được gửi về số điện thoại đăng ký.
                </p>
                <p className="confirm-amount-md" style={{ color: "#333" }}>
                    {finalAmountWithShip.toLocaleString()} VND
                </p>
                <input
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="confirm-input"
                    style={{
                        fontSize: "16px",
                        letterSpacing: "2px",
                        textAlign: "center",
                        marginBottom: "10px",
                    }}
                />
                {errorMsg && (
                    <p style={{ color: "#f44336", fontSize: "13px", margin: "5px 0" }}>{errorMsg}</p>
                )}
                <button
                    className="confirm-btn"
                    style={{ backgroundColor: "#005baa" }}
                    disabled={isSubmitting}
                    onClick={handleConfirmVNPAY}
                >
                    {isSubmitting ? "Đang xác thực..." : "Thanh toán"}
                </button>
                <button
                    className="confirm-btn-home"
                    style={{ marginTop: "10px", border: "none", color: "#888" }}
                    onClick={() => setStep("card")}
                >
                    ← Quay lại
                </button>
            </div>
        </div>
    );

    // ── Bước nhập thẻ (mặc định) ──
    return (
        <div className="confirm-wrapper">
            <div className="confirm-box">
                <div style={{ color: "#005baa", fontSize: "60px", fontWeight: "bold", marginBottom: "15px" }}>💳</div>
                <h2 style={{ color: "#005baa", margin: "0 0 10px 0" }}>Thanh toán qua Ngân hàng</h2>
                <p style={{ color: "#666", fontSize: "14px", margin: "0 0 5px 0" }}>
                    Đơn hàng tại: <strong>Babyshop</strong>
                </p>
                <p className="confirm-amount-lg" style={{ color: "#333" }}>
                    {finalAmountWithShip.toLocaleString()} VND
                </p>

                <div style={{ textAlign: "left" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "5px" }}>
                        Số thẻ
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập số thẻ"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="confirm-input"
                    />

                    <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "5px" }}>
                        Tên chủ thẻ
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="confirm-input"
                    />

                    <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "5px" }}>
                        Ngày phát hành (mm/dd)
                    </label>
                    <input
                        type="text"
                        placeholder="mm/dd"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="confirm-input"
                        style={{ marginBottom: "5px" }}
                    />
                </div>

                {errorMsg && (
                    <p style={{ color: "#f44336", fontSize: "13px", margin: "8px 0 0 0" }}>{errorMsg}</p>
                )}

                <button
                    className="confirm-btn"
                    style={{ backgroundColor: "#005baa" }}
                    onClick={handleSubmitCard}
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    );
};