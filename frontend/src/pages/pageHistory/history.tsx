import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AccoutMenu from "../../components/accoutMenu";
import sanpham from "../../assets/icons/Sanpham.png";
import "./history.css";

interface OrderItem {
    orderDetailId: number;
    productId: number;
    name: string;
    size: "S" | "M" | "L";
    quantity: number;
    price: number;
    image: string;
}

interface OrderGroup {
    orderId: number;
    userId: number;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    paymentMethod: string;
    status: string;
    items: OrderItem[];
}

const STATUS_MAP: { [key: string]: string } = {
    "Tất cả": "all",
    "Chờ thanh toán": "pending",
    "Vận chuyển":     "confirmed",
    "Chờ giao hàng":  "shipping",
    "Hoàn thành":     "delivered",
    "Đã huỷ":         "cancelled"
};

const History: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>("Tất cả");
    const [orders, setOrders] = useState<OrderGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAccountMenu, setShowAccountMenu] = useState(false);

    // States cho chức năng Đánh giá
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewData, setReviewData] = useState({
        orderId: 0,
        orderDetailId: 0,
        productId: 0,
        rating: 5,
        comment: ""
    });

    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : {};
    const currentUserId = currentUser.userId || currentUser.id;

    const tabs = ["Tất cả", "Chờ thanh toán", "Vận chuyển", "Chờ giao hàng", "Hoàn thành", "Đã huỷ"];

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            if (!currentUserId) {
                console.error("❌ Lỗi: Không lấy được userId từ localStorage.");
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/orders/user/${currentUserId}`);
            setOrders(response.data || []);
        } catch (error) {
            console.error("❌ Lỗi kết nối API lịch sử đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrderHistory(); }, []);

    const handleCancelOrder = async (orderId: number) => {
        if (!window.confirm("Bạn có chắc muốn huỷ toàn bộ đơn hàng này không?")) return;
        try {
            await axios.patch(`http://localhost:5000/api/orders/${orderId}/cancel`);
            alert("Huỷ đơn hàng thành công!");
            fetchOrderHistory();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Có lỗi xảy ra khi huỷ đơn hàng";
            alert(msg);
        }
    };

    // Hàm mở Modal đánh giá
    const openReviewModal = (orderId: number, orderDetailId: number, productId: number) => {
        setReviewData({
            orderId,
            orderDetailId,
            productId,
            rating: 5,
            comment: ""
        });
        setReviewModalOpen(true);
    };

    // Hàm submit Đánh giá
    const handleReviewSubmit = async () => {
        if (!reviewData.comment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá!");
            return;
        }

        try {
            if (!currentUserId) return alert("Vui lòng đăng nhập!");
            setIsSubmittingReview(true);

            await axios.post("http://localhost:5000/api/review", {
                userId: currentUserId,
                productId: reviewData.productId,
                orderId: reviewData.orderId,
                orderDetailId: reviewData.orderDetailId,
                rating: reviewData.rating,
                comment: reviewData.comment
            });

            alert("Cảm ơn bạn đã đánh giá sản phẩm!");
            setReviewModalOpen(false);
            setReviewData({ ...reviewData, comment: "", rating: 5 });

        } catch (error: any) {
            console.error("Lỗi khi gửi đánh giá:", error);
            if (error.response) {
                alert(`Gửi đánh giá thất bại: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("Đã xảy ra lỗi khi gửi đánh giá.");
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const filteredOrders = activeTab === "Tất cả"
        ? orders
        : orders.filter(o => (o.status || "").toLowerCase() === STATUS_MAP[activeTab].toLowerCase());

    const getImageSrc = (image: string) => {
        if (!image) return sanpham;
        if (image.startsWith("data:") || image.startsWith("http")) return image;
        return `http://localhost:5000${image}`;
    };

    const getUniqueItems = (items: OrderItem[]) => {
        if (!items) return [];
        const seen = new Set();
        return items.filter(item => {
            if (item.orderDetailId) {
                if (seen.has(item.orderDetailId)) return false;
                seen.add(item.orderDetailId);
                return true;
            }
            const fallbackKey = `${item.productId}_${item.size}`;
            if (seen.has(fallbackKey)) return false;
            seen.add(fallbackKey);
            return true;
        });
    };

    return (
        <div className="history">
            <p className="history-breadcrumb">
                <a href="/">Trang chủ</a> &gt;
                <a href="/account"> Trang cá nhân</a> &gt;
                <span> Lịch sử đơn hàng</span>
                <button
                    className="menu-mobile-toggle"
                    onClick={() => setShowAccountMenu(true)}
                >
                    ☰ Tài khoản
                </button>
            </p>

            <div className="history-container">
                <AccoutMenu
                    showMenu={showAccountMenu}
                    onClose={() => setShowAccountMenu(false)}
                />

                <div className="history-section">
                    <div className="history-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                className={activeTab === tab ? "active" : ""}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="history-header">
                        <div className="history-col-product">Sản phẩm</div>
                        <div>Giá lẻ</div>
                        <div>Kích cỡ</div>
                        <div>Số lượng</div>
                        <div>Tạm tính</div>
                    </div>

                    <div className="history-list">
                        {loading ? (
                            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                Đang tải lịch sử đơn hàng...
                            </p>
                        ) : filteredOrders.length === 0 ? (
                            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                Không có đơn hàng nào trong trạng thái này.
                            </p>
                        ) : (
                            filteredOrders.map((order) => (
                                <div key={order.orderId} className="order-group-wrapper" style={{
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "8px",
                                    marginBottom: "20px",
                                    padding: "15px",
                                    backgroundColor: "#fff"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px", marginBottom: "12px", fontSize: "14px" }}>
                                        <span><strong>Mã đơn hàng:</strong> #{order.orderId}</span>
                                        <span style={{ color: "#ff4d4f", fontWeight: "bold", textTransform: "uppercase" }}>
                                            Trạng thái: {order.status}
                                        </span>
                                    </div>

                                    <div className="order-items-list">
                                        {getUniqueItems(order.items).map((product) => (
                                            <div key={product.orderDetailId || `${product.productId}_${product.size}`} className="history-item">
                                                <div
                                                    className="history-col-product"
                                                    onClick={() => navigate(`/detailproduct/${product.productId}`)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <img
                                                        src={getImageSrc(product.image)}
                                                        alt={product.name}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).onerror = null;
                                                            (e.target as HTMLImageElement).src = sanpham;
                                                        }}
                                                    />
                                                    <span className="history-item-name">{product.name}</span>
                                                </div>

                                                <div className="history-col-price">
                                                    {(product.price || 0).toLocaleString()} VNĐ
                                                </div>

                                                <div className="history-col-size">
                                                    <span>{product.size}</span>
                                                </div>

                                                <div className="history-col-quantity">
                                                    <span>{product.quantity}</span>
                                                </div>

                                                <div className="history-col-total" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                    <div>{((product.price || 0) * (product.quantity || 0)).toLocaleString()} VNĐ</div>

                                                    {/* NÚT ĐÁNH GIÁ NẾU ĐƠN HÀNG ĐÃ HOÀN THÀNH */}
                                                    {(order.status || "").toLowerCase() === "delivered" && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openReviewModal(order.orderId, product.orderDetailId, product.productId);
                                                            }}
                                                            style={{
                                                                marginTop: "8px",
                                                                backgroundColor: "#fb71b0",
                                                                color: "#fff",
                                                                border: "none",
                                                                padding: "5px 12px",
                                                                borderRadius: "4px",
                                                                fontSize: "12px",
                                                                cursor: "pointer",
                                                                fontWeight: "bold",
                                                                transition: "0.2s"
                                                            }}
                                                        >
                                                            Đánh giá
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                                        <div style={{ fontSize: "13px", color: "#666" }}>
                                            Phương thức thanh toán: <strong style={{ textTransform: "uppercase" }}>{order.paymentMethod}</strong>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "15px", marginBottom: "8px" }}>
                                                Thành tiền (gồm ship): <span style={{ color: "#ff4d4f", fontWeight: "bold", fontSize: "18px" }}>
                                                    {(order.finalAmount || order.totalAmount || 0).toLocaleString()} VNĐ
                                                </span>
                                            </div>

                                            {(order.paymentMethod || "").toLowerCase() === "cod" &&
                                            (order.status || "").toLowerCase() === "pending" ? (
                                                <button
                                                    onClick={() => handleCancelOrder(order.orderId)}
                                                    style={{
                                                        backgroundColor: "#ff4d4f",
                                                        color: "#fff",
                                                        border: "none",
                                                        padding: "6px 16px",
                                                        borderRadius: "20px",
                                                        fontSize: "13px",
                                                        cursor: "pointer",
                                                        fontWeight: "bold"
                                                    }}
                                                >
                                                    Huỷ đơn hàng
                                                </button>
                                            ) : (order.status || "").toLowerCase() === "cancelled" ? (
                                                <span style={{ color: "#ff4d4f", fontSize: "13px", fontWeight: "bold" }}>
                                                    Đã huỷ
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL ĐÁNH GIÁ SẢN PHẨM */}
            {reviewModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', width: '450px', maxWidth: '90%', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            Đánh giá sản phẩm
                        </h3>

                        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                            <label style={{ fontWeight: 'bold', marginRight: '15px' }}>Chất lượng: </label>
                            <select
                                value={reviewData.rating}
                                onChange={(e) => setReviewData({...reviewData, rating: Number(e.target.value)})}
                                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none', cursor: 'pointer', flex: 1 }}
                            >
                                <option value={5}>⭐⭐⭐⭐⭐ Tuyệt vời</option>
                                <option value={4}>⭐⭐⭐⭐ Tốt</option>
                                <option value={3}>⭐⭐⭐ Khá</option>
                                <option value={2}>⭐⭐ Trung bình</option>
                                <option value={1}>⭐ Tệ</option>
                            </select>
                        </div>

                        <textarea
                            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                            value={reviewData.comment}
                            onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                            style={{
                                width: '100%', height: '120px', padding: '12px', borderRadius: '8px',
                                border: '1px solid #ccc', marginBottom: '20px', outline: 'none', resize: 'vertical'
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setReviewModalOpen(false)}
                                style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #ccc', background: '#f9f9f9', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                disabled={isSubmittingReview}
                                style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#fb71b0', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;