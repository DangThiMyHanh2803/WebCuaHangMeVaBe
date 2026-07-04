import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./confirmPayment.css";

const VnpayReturn: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const responseCode = searchParams.get("vnp_ResponseCode");
    const orderId = searchParams.get("vnp_TxnRef");

    useEffect(() => {
        if (responseCode === "00") {
            localStorage.removeItem("cart");
        }
    }, [responseCode]);

    // ── THANH TOÁN THÀNH CÔNG ──
    if (responseCode === "00") {
        return (
            <div className="confirm-wrapper">
                <div className="confirm-box">
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "50%",
                        backgroundColor: "#e8f5e9", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px auto",
                    }}>
                        <span style={{ fontSize: "40px", color: "#4caf50" }}>✓</span>
                    </div>

                    <h2 style={{ color: "#333", marginBottom: "10px" }}>Thanh toán thành công!</h2>
                    <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.5" }}>
                        Cảm ơn bạn đã mua sắm tại cửa hàng. Đơn hàng của bạn đã được hoàn tất thanh toán an toàn qua cổng VNPay.
                    </p>

                    {orderId && (
                        <p style={{ color: "#ff69b4", fontWeight: "bold", fontSize: "16px", marginTop: "10px" }}>
                            Mã đơn hàng: #{orderId}
                        </p>
                    )}

                    <div className="confirm-btn-group">
                        <button className="confirm-btn-home" onClick={() => navigate("/")}>
                            Về trang chủ
                        </button>
                        <button className="confirm-btn-primary" onClick={() => navigate("/history")}>
                            Xem đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── THANH TOÁN THẤT BẠI / HỦY ──
    return (
        <div className="confirm-wrapper">
            <div className="confirm-box">
                <div style={{
                    width: "80px", height: "80px", borderRadius: "50%",
                    backgroundColor: "#ffebee", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px auto",
                }}>
                    <span style={{ fontSize: "40px", color: "#f44336" }}>✕</span>
                </div>

                <h2 style={{ color: "#333", marginBottom: "10px" }}>Thanh toán thất bại</h2>
                <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.5" }}>
                    Giao dịch qua VNPay chưa hoàn tất thành công hoặc đã bị khách hàng hủy bỏ giữa chừng.
                </p>

                {orderId && (
                    <p style={{ color: "#999", fontSize: "14px", marginTop: "10px" }}>
                        Mã đơn: #{orderId}
                    </p>
                )}

                <div className="confirm-btn-group">
                    <button className="confirm-btn-home" onClick={() => navigate("/")}>
                        Về trang chủ
                    </button>
                    <button className="confirm-btn-primary" onClick={() => navigate("/cart")}>
                        Quay lại giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VnpayReturn;