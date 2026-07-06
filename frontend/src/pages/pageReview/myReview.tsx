import React, { useEffect, useMemo, useState } from "react";
import "./myReview.css";
import AccountMenu from "../../components/accoutMenu";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface MyReview {
    reviewId: number;
    productId: number;
    productName: string;
    imageUrl?: string;
    rating: number;
    comment: string;
    created_at: string;
}

const MyReviewsPage: React.FC = () => {
    const currentUser = useMemo(
        () => JSON.parse(localStorage.getItem("user") || "{}"),
        []
    );
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<MyReview[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editRating, setEditRating] = useState<number>(5);
    const [editComment, setEditComment] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                if (!currentUser.userId) return;
                const res = await axios.get(
                    `http://localhost:5000/api/review/user/${currentUser.userId}`
                );
                setReviews(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Lỗi khi tải đánh giá:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyReviews();
    }, [currentUser.userId]);

    const handleEdit = (review: MyReview) => {
        setEditingId(review.reviewId);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async (reviewId: number) => {
        if (!editComment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá!");
            return;
        }
        try {
            setIsSaving(true);
            await axios.put(`http://localhost:5000/api/review/${reviewId}`, {
                rating: editRating,
                comment: editComment,
            });
            setReviews((prev) =>
                prev.map((r) =>
                    r.reviewId === reviewId
                        ? { ...r, rating: editRating, comment: editComment }
                        : r
                )
            );
            setEditingId(null);
            alert("Cập nhật đánh giá thành công!");
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!window.confirm("Bạn có chắc muốn xoá đánh giá này không?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/review/${reviewId}`);
            setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
            alert("Đã xoá đánh giá!");
        } catch (err) {
            console.error(err);
            alert("Xoá thất bại, vui lòng thử lại!");
        }
    };

    const renderStars = (rating: number, interactive = false, onChange?: (v: number) => void) => (
        <div className="star-row">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star ${star <= rating ? "filled" : ""} ${interactive ? "interactive" : ""}`}
                    onClick={() => interactive && onChange && onChange(star)}
                >
                    ★
                </span>
            ))}
        </div>
    );

    // Hàm lấy link ảnh chính xác, tránh bị lỗi gộp thư mục
    const getImageUrl = (url?: string) => {
        if (!url) return "/img/default-product.jpg";
        if (url.startsWith("http")) return url;

        // Bỏ bớt dấu gạch chéo dư thừa nếu có
        const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
        return `http://localhost:5000/${cleanUrl}`;
    };

    return (
        <div className="account-page">
            <p className="breadcrumb">
                <a href="/">Trang chủ</a> &gt;
                <a href="/account">Trang cá nhân</a> &gt;
                <span>Đánh giá của tôi</span>
            </p>

            <div className="account-container">
                <AccountMenu />

                <div className="account-form">
                    <div className="my-reviews-wrapper">
                        <h3 className="reviews-title">Đánh giá của tôi</h3>

                        {loading ? (
                            <p className="reviews-empty">Đang tải...</p>
                        ) : reviews.length === 0 ? (
                            <div className="reviews-empty-box">
                                <span className="reviews-empty-icon">✍️</span>
                                <p>Bạn chưa có đánh giá nào.</p>
                                <button
                                    className="btn-go-shop"
                                    onClick={() => navigate("/")}
                                >
                                    Mua sắm ngay
                                </button>
                            </div>
                        ) : (
                            <div className="review-cards">
                                {reviews.map((review) => (
                                    <div key={review.reviewId} className="review-card">
                                        {/* Ảnh + tên sản phẩm */}
                                        <div
                                            className="review-card-product"
                                            onClick={() => navigate(`/detailproduct/${review.productId}`)}
                                        >
                                            <img
                                                src={getImageUrl(review.imageUrl)}
                                                alt={review.productName}
                                                className="review-card-img"
                                            />
                                            <div className="review-card-product-info">
                                                <span className="review-card-product-name">
                                                    {review.productName}
                                                </span>
                                                <span className="review-card-date">
                                                    {new Date(review.created_at).toLocaleDateString("vi-VN")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Nội dung đánh giá */}
                                        {editingId === review.reviewId ? (
                                            <div className="review-edit-form">
                                                {renderStars(editRating, true, setEditRating)}
                                                <textarea
                                                    className="review-edit-textarea"
                                                    rows={3}
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                    placeholder="Chia sẻ cảm nhận của bạn..."
                                                />
                                                <div className="review-edit-actions">
                                                    <button
                                                        className="btn-save-review"
                                                        onClick={() => handleSaveEdit(review.reviewId)}
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving ? "Đang lưu..." : "Lưu"}
                                                    </button>
                                                    <button
                                                        className="btn-cancel-review"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        Huỷ
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="review-card-body">
                                                {renderStars(review.rating)}
                                                <p className="review-card-comment">{review.comment}</p>
                                                <div className="review-card-actions">
                                                    <button
                                                        className="btn-edit-review"
                                                        onClick={() => handleEdit(review)}
                                                    >
                                                        ✏️ Sửa
                                                    </button>
                                                    <button
                                                        className="btn-delete-review"
                                                        onClick={() => handleDelete(review.reviewId)}
                                                    >
                                                        🗑️ Xoá
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyReviewsPage;