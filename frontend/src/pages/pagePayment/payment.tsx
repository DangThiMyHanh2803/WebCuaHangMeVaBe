import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./payment.css";
import map from "../../assets/icons/icondiachi.png";
import voucher from "../../assets/header/voucher.svg";
import sanpham from "../../assets/icons/Sanpham.png";

interface CheckoutProduct {
    id: number;
    name: string;
    priceBySize: { [key: string]: number };
    image: string;
    quantity: number;
    size: "S" | "M" | "L";
}
interface Discount{
    discountId:number;
    discountCode:string;
    discountValue:number;
    discountType:"percent"|"fixed";
}
const Payment: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentMethod, setPaymentMethod] = useState<string>("cod");
    const [userInfo, setUserInfo] = useState({ name: "", phone: "" });

    // State quản lý địa chỉ để tự động cập nhật khi fetch API
    const [shippingAddress, setShippingAddress] = useState<string>("Đang tải địa chỉ...");
    const [shippingAddressId, setShippingAddressId] = useState<number>(0);
    const [savedDiscounts,setSavedDiscounts]=useState<Discount[]>([]);
    const [selectedVoucher,setSelectedVoucher]=useState<Discount|null>(null);
    const [voucherCode,setVoucherCode]=useState("");
    // Lấy thông tin đơn hàng từ location.state (ngoại trừ địa chỉ)
    const {
        checkoutProducts = [],
        temporaryTotal = 0,
        discountAmount = 0,
        finalTotal = 0
    } = (location.state || {}) as {
        checkoutProducts?: CheckoutProduct[];
        temporaryTotal?: number;
        discountAmount?: number;
        finalTotal?: number;
    };
    const shippingFee = 25000;

// tiền sau khuyến mãi sản phẩm
    const subtotal = finalTotal;

// tiền giảm từ voucher
    const voucherDiscount =
        selectedVoucher == null
            ? 0
            : selectedVoucher.discountType === "percent"
                ? subtotal * selectedVoucher.discountValue / 100
                : selectedVoucher.discountValue;

// không cho giảm quá tiền hàng
    const realVoucherDiscount = Math.min(
        voucherDiscount,
        subtotal
    );

    const finalAmountWithShip =
        subtotal - realVoucherDiscount + shippingFee;

    // Effect: Kiểm tra giỏ hàng rỗng
    useEffect(() => {
        if (checkoutProducts.length === 0) {
            alert("Giỏ hàng thanh toán của bạn đang trống! Vui lòng chọn sản phẩm trước.");
            navigate("/cart");
        }
    }, [checkoutProducts, navigate]);

    // Effect: Xử lý thông tin User và Địa chỉ nhận hàng
    // Effect: Xử lý thông tin User và Địa chỉ nhận hàng
    useEffect(() => {
        const fetchUserDataAndAddress = async () => {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setShippingAddress("Chưa có địa chỉ");
                return;
            }

            const user = JSON.parse(userStr);
            setUserInfo({
                name: user.userName || user.name || "Chưa cập nhật",
                phone: user.phone || "Chưa cập nhật"
            });

            const stateData = location.state as any;

            // TRƯỜNG HỢP 1: Có sẵn địa chỉ truyền từ trang Giỏ Hàng
            if (stateData && stateData.address && stateData.address !== "Chưa có địa chỉ") {
                setShippingAddress(stateData.address);
                setShippingAddressId(stateData.addressId || 1);
            }
            // TRƯỜNG HỢP 2: Đi từ nút "Mua ngay", gọi API để lấy địa chỉ mặc định
            else {
                try {
                    const userId = user.userId || user.id;

                    // ĐÃ SỬA LẠI ĐÚNG ĐƯỜNG LINK API CỦA BẠN (address thay vì addresses)
                    const response = await axios.get(`http://localhost:5000/api/address/user/${userId}`);
                    const addressList = response.data;

                    if (addressList && addressList.length > 0) {
                        // Tìm địa chỉ mặc định, nếu không có thì lấy địa chỉ đầu tiên trong mảng
                        const defaultAddress = addressList.find((addr: any) => addr.isDefault || addr.is_default === 1 || addr.isDefault === true) || addressList[0];

                        // Nối chuỗi địa chỉ (kiểm tra lại tên biến ward, district, province cho khớp với Backend nếu cần)
                        const addressParts = [defaultAddress.ward, defaultAddress.district, defaultAddress.province].filter(Boolean);
                        const fullAddressString = addressParts.join(', ');

                        setShippingAddress(fullAddressString || "Chưa cập nhật chi tiết địa chỉ");
                        setShippingAddressId(defaultAddress.id || defaultAddress.addressId);
                    } else {
                        setShippingAddress("Chưa có địa chỉ");
                    }
                } catch (error) {
                    console.error("Lỗi khi gọi API lấy địa chỉ:", error);
                    setShippingAddress("Chưa có địa chỉ");
                }
            }
        };

        fetchUserDataAndAddress();
    }, [location.state]);
    useEffect(() => {
        const saved = JSON.parse(
            localStorage.getItem("savedDiscount") || "null"
        );

        if (saved) {
            setSelectedVoucher(saved);          // nếu muốn lưu luôn voucher
            setVoucherCode(saved.discountCode); // hiển thị lên ô input
        }
    }, []);
    useEffect(() => {
        console.log("Voucher:", selectedVoucher);
        console.log("Voucher Discount:", voucherDiscount);
        console.log("Final:", finalAmountWithShip);
    }, [selectedVoucher]);
    const handleBackToCart = () => navigate("/cart");

    // LUỒNG XỬ LÝ THANH TOÁN THẬT KHI BẤM NÚT XÁC NHẬN
    const handleConfirmPayment = async () => {
        if (!shippingAddressId || shippingAddressId === 0) {
            alert("Vui lòng thêm địa chỉ nhận hàng trước khi thanh toán!");
            return;
        }

        const passState = {
            addressId: shippingAddressId, // Sử dụng ID địa chỉ đã lấy được
            checkoutProducts,
            temporaryTotal,
            discountAmount,
            finalTotal,
        };

        if (paymentMethod === "cod") {
            navigate("/payment/confirm-cod", { state: passState });
        } else if (paymentMethod === "vnpay") {
            try {
                // Định dạng danh sách mặt hàng để gửi lên API Backend
                const items = checkoutProducts.map((p: any) => ({
                    productId: p.id || p.productId,
                    quantity: p.quantity || 1,
                    price: p.priceBySize ? (p.priceBySize[p.size] || 0) : (p.price || 0),
                    size: p.size || "M"
                }));

                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                const userId = currentUser.userId || null;

                // Gọi API backend khởi tạo đơn hàng Pending và nhận Link VNPAY thật
                const response = await axios.post("http://localhost:5000/api/vnpay/create_payment", {
                    userId,
                    addressId: shippingAddressId, // Gửi ID địa chỉ chính xác
                    items,
                    totalAmount: finalAmountWithShip,
                    finalAmount: finalAmountWithShip
                });

                if (response.data && response.data.success && response.data.paymentUrl) {
                    // CHUYỂN HƯỚNG TRÌNH DUYỆT SANG THIẾT BỊ/CỔNG THANH TOÁN VNPAY THẬT
                    window.location.href = response.data.paymentUrl;
                } else {
                    alert("Không thể kết nối cổng thanh toán VNPAY. Vui lòng thử lại!");
                }
            } catch (error) {
                console.error("Lỗi khi kết nối API thanh toán VNPAY thật:", error);
                alert("Có lỗi kết nối hệ thống xảy ra, vui lòng thử lại sau!");
            }
        }
    };
    const applyVoucher = () => {
        const voucher = savedDiscounts.find(
            v =>
                v.discountCode.trim().toUpperCase() ===
                voucherCode.trim().toUpperCase()
        );

        if (!voucher) {
            alert("Voucher không tồn tại!");
            return;
        }

        setSelectedVoucher(voucher);

        alert("Áp dụng thành công!");
    };

    return (
        <div className="payment-page">
            <div className="payment-body-page">

                {/* ADDRESS */}
                <div className="payment-address">
                    <div className="payment-title"><span>Địa chỉ nhận hàng</span></div>
                    <div className="payment-container-address">
                        <div className="payment-icon">
                            <img src={map} alt="map" className="promo-map" />
                        </div>
                        <div className="payment-info-user">
                            <div className="payment-name-phone">
                                <span className="payment-name">{userInfo.name}</span>
                                <span className="payment-phone">{userInfo.phone}</span>
                            </div>
                            <div className="payment-address-detail">
                                <p>{shippingAddress}</p>
                            </div>
                        </div>
                        <div className="payment-btn-change-address">
                            <button onClick={handleBackToCart} title="Quay lại sửa địa chỉ">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* PRODUCT ORDER */}
                <div className="payment-product-order">
                    <div className="payment-order-header">
                        <span className="payment-col-sp">Sản phẩm</span>
                        <span>Size</span>
                        <span>Số lượng</span>
                        <span>Đơn giá</span>
                        <span>Thành tiền</span>
                    </div>
                    <div className="payment-container-product">
                        {checkoutProducts.map((product) => {
                            const unitPrice = product.priceBySize[product.size];
                            return (
                                <div className="payment-product-card" key={`${product.id}-${product.size}`}>
                                    <div className="payment-product-info">
                                        <img
                                            src={product.image.startsWith("http") ? product.image : `http://localhost:5000/image/${product.image}`}
                                            alt={product.name}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = sanpham;
                                            }}
                                        />
                                        <span className="payment-name-sp">{product.name}</span>
                                    </div>
                                    <div className="payment-type-sp">Size {product.size}</div>
                                    <div className="payment-qty-sp">{product.quantity}</div>
                                    <div className="payment-price-sp">{unitPrice.toLocaleString()}đ</div>
                                    <div className="payment-total-sp">{(unitPrice * product.quantity).toLocaleString()}đ</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SHIPPING */}
                <div className="payment-ship-type">
                    <div className="payment-title"><span>Phương thức vận chuyển</span></div>
                    <div className="payment-container-ship">
                        <div className="payment-ship-info">
                            <i className="fa-solid fa-truck-fast payment-icon-ship"></i>
                            <div className="payment-ship-text">
                                <strong>Giao hàng nhanh tiết kiệm</strong>
                                <p>Nhận hàng trong ngày (Dự kiến trước 18h)</p>
                            </div>
                            <div className="payment-ship-price">25.000đ</div>
                        </div>
                    </div>
                </div>

                {/* METHOD PAYMENT */}
                <div className="payment-method-section" style={{ marginTop: "20px" }}>
                    <div className="payment-title"><span>Phương thức thanh toán</span></div>
                    <div className="payment-container-method" style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", marginTop: "10px" }}>
                        {/* COD */}
                        <div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
                            <input
                                type="radio" id="method_cod" name="payment_choice" value="cod"
                                checked={paymentMethod === "cod"}
                                onChange={() => setPaymentMethod("cod")}
                                style={{ width: "18px", height: "18px", marginRight: "12px", accentColor: "#ff69b4", cursor: "pointer" }}
                            />
                            <label htmlFor="method_cod" style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "15px" }}>
                                <i className="fa-solid fa-money-bill-wave" style={{ color: "#4caf50", marginRight: "10px" }}></i>
                                Thanh toán tiền mặt khi nhận hàng (COD)
                            </label>
                        </div>

                        {/* VNPAY */}
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <input
                                type="radio" id="method_vnpay" name="payment_choice" value="vnpay"
                                checked={paymentMethod === "vnpay"}
                                onChange={() => setPaymentMethod("vnpay")}
                                style={{ width: "18px", height: "18px", marginRight: "12px", accentColor: "#ff69b4", cursor: "pointer" }}
                            />
                            <label htmlFor="method_vnpay" style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "15px" }}>
                                <i className="fa-solid fa-credit-card" style={{ color: "#005baa", marginRight: "10px" }}></i>
                                Thanh toán trực tuyến qua Cổng VNPAY (ATM / Visa / QR Code)
                            </label>
                        </div>
                    </div>
                </div>

                {/* SUMMARY */}
                <div className="payment-section" style={{ marginTop: "20px" }}>
                    <div className="payment-voucher-box">
                        <img src={voucher} alt="voucher" />
                        <span>Mã giảm giá:</span>
                        <input
                            value={voucherCode}
                            onChange={(e)=>setVoucherCode(e.target.value)}
                            placeholder="Nhập mã voucher"
                        />

                        <button
                            className="payment-btn-apply"
                            onClick={applyVoucher}
                        >
                            Áp dụng
                        </button>
                    </div>

                    <div className="payment-total-summary">
                        <div className="payment-row">
                            <span>Tiền hàng</span>
                            <span>{temporaryTotal.toLocaleString()}đ</span>
                        </div>

                        <div className="payment-row">
                            <span>Khuyến mãi sản phẩm</span>
                            <span>-{discountAmount.toLocaleString()}đ</span>
                        </div>

                        <div className="payment-row">
                            <span>Voucher</span>
                            <span>-{realVoucherDiscount.toLocaleString()}đ</span>
                        </div>

                        <div className="payment-row">
                            <span>Phí ship</span>
                            <span>{shippingFee.toLocaleString()}đ</span>
                        </div>

                        <div className="payment-row payment-final">
                            <strong>Tổng thanh toán</strong>
                            <strong>
                                {finalAmountWithShip.toLocaleString()}đ
                            </strong>
                        </div>
                    </div>

                    <div className="payment-btn-group">
                        <button className="payment-btn-back" onClick={handleBackToCart}>Quay lại giỏ hàng</button>
                        <button className="payment-btn-confirm" onClick={handleConfirmPayment}>
                            Xác nhận thanh toán
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Payment;
