import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './detailProduct.css';
import cartIcon from '../../assets/header/cart.svg';
import DiscountCoupon from "../../components/discountCoupon";
interface ProductImage {
    imageId: number;
    productId: number;
    imageUrl: string;
    isMain: number; // 1 = ảnh chính, 0 = thumbnail
}
interface Product {
    productId: number;
    productName: string;
    price: number;
    description: string | null;
    status: boolean;
    created_at?: string;
    categoryName?: string | null;
    imageUrl?: string | null;
    categoryId?: number;
    discountPercentage?: number | null;
    size?: string | null;
    stockQuantity?: number;
}

interface ProductSpec {
    specId: number;
    productId: number;
    specName: string;
    specValue: string;
}

interface Review {
    reviewId?: number;
    userId?: number;
    userName?: string;
    rating: number;
    comment: string;
    created_at?: string;
}
interface Discount {
    discountId: number;
    discountCode: string;
    discountValue: number;
    discountType: "percent" | "fixed";
    startDate: string;
    endDate: string;
    status: boolean;
}
const DetailProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [selectedSize, setSelectedSize] = useState<string>('S');
    const [quantity, setQuantity] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<'desc' | 'review'>('desc');

    const [productSpecs, setProductSpecs] = useState<ProductSpec[]>([]);
    const [stockQuantity, setStockQuantity] = useState<number>(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userRating, setUserRating] = useState<number>(5);
    const [userComment, setUserComment] = useState<string>('');
    const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
    const [filterRating, setFilterRating] = useState<number>(0);

    const [mainImage, setMainImage] = useState<string>('/img/default-product.jpg');
    const [productImages, setProductImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                // 1. Lấy thông tin sản phẩm
                const response = await axios.get(`http://localhost:5000/api/product/${id}`);
                const raw = Array.isArray(response.data) ? response.data[0] : response.data;

                if (!raw) {
                    alert("Không tìm thấy sản phẩm.");
                    setLoading(false);
                    return;
                }

                const data: Product = raw;
                setProduct(data);

                if (data.size && typeof data.size === 'string') {
                    const sizes = data.size.split(',').map(s => s.trim());
                    if (sizes.length > 0) setSelectedSize(sizes[0]);
                }

                // 2. Lấy ảnh từ API product-image
                try {
                    const imgRes = await axios.get(`http://localhost:5000/api/product-image/product/${id}`);
                    const imgData: ProductImage[] = imgRes.data;

                    // Ảnh chính (isMain = 1)
                    const mainImg = imgData.find(img => img.isMain === 1);
                    // Ảnh phụ (isMain = 0)
                    const thumbImgs = imgData.filter(img => img.isMain === 0);

                    if (mainImg) {
                        setMainImage(mainImg.imageUrl);
                    } else if (data.imageUrl) {
                        // Fallback sang imageUrl từ product nếu không có ảnh main
                        setMainImage(
                            data.imageUrl.startsWith('http')
                                ? data.imageUrl
                                : `http://localhost:5000/images/${data.imageUrl}`
                        );
                    }

                    // Thumbnails: ảnh phụ, nếu không có thì dùng ảnh main
                    setProductImages(
                        thumbImgs.length > 0
                            ? thumbImgs.map(img => img.imageUrl)
                            : mainImg ? [mainImg.imageUrl] : []
                    );
                } catch {
                    // Fallback nếu API product-image lỗi
                    if (data.imageUrl) {
                        const resolved = data.imageUrl.startsWith('http')
                            ? data.imageUrl
                            : `http://localhost:5000/images/${data.imageUrl}`;
                        setMainImage(resolved);
                        setProductImages([resolved]);
                    }
                }

                // 3. Lấy tồn kho từ product_stock
                try {
                    const stockRes = await axios.get(`http://localhost:5000/api/product-stock/product/${id}`);
                    console.log('[Stock API]', stockRes.data);
                    setStockQuantity(stockRes.data?.quantity ?? 0);
                } catch (err) {
                    console.error('[Stock API error]', err);
                    setStockQuantity(0);
                }

                // 5. Lấy thông số kỹ thuật
                try {
                    const specRes = await axios.get(`http://localhost:5000/api/product-spec/product/${id}`);
                    setProductSpecs(Array.isArray(specRes.data) ? specRes.data : []);
                } catch {
                    // Chưa có specs — bỏ qua
                }

                // 6. Lấy đánh giá
                try {
                    const reviewRes = await axios.get(`http://localhost:5000/api/review/product/${id}`);
                    setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
                } catch {
                    // Chưa có review — bỏ qua
                }
                // 7. Lấy mã giảm giá
                try {
                    const discountRes = await axios.get(
                        "http://localhost:5000/api/discount"
                    );

                    setDiscounts(
                        Array.isArray(discountRes.data)
                            ? discountRes.data.filter((d: Discount) => d.status)
                            : []
                    );

                } catch (err) {
                    console.log("Không lấy được voucher", err);
                }
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
                alert("Không thể tải thông tin sản phẩm.");
                setLoading(false);
            }
        };

        if (id) fetchProductData();
        window.scrollTo(0, 0);
    }, [id]);


    const handleQuantityChange = (type: 'plus' | 'minus') => {
        setQuantity(prev => {
            const maxStock = stockQuantity || 100;
            if (type === 'plus') return prev < maxStock ? prev + 1 : prev;
            return prev > 1 ? prev - 1 : 1;
        });
    };

    const calculatePrices = () => {
        if (!product) return {
            originalPrice: '0', finalPrice: '0', discount: 0,
            rawFinalPrice: 0, totalPrice: '0', rawTotalPrice: 0,
            temporaryTotal: 0, discountAmount: 0
        };

        let basePrice = product.price || 0;
        if (selectedSize === 'M') basePrice += 20000;
        if (selectedSize === 'L') basePrice += 40000;

        const discount = product.discountPercentage || 0;
        const finalPricePerItem = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
        const rawTemporaryTotal = basePrice * quantity;
        const rawFinalTotal = finalPricePerItem * quantity;

        return {
            originalPrice: basePrice.toLocaleString('vi-VN'),
            finalPrice: finalPricePerItem.toLocaleString('vi-VN'),
            discount,
            rawFinalPrice: finalPricePerItem,
            totalPrice: rawFinalTotal.toLocaleString('vi-VN'),
            rawTotalPrice: rawFinalTotal,
            temporaryTotal: rawTemporaryTotal,
            discountAmount: rawTemporaryTotal - rawFinalTotal
        };
    };

    const { originalPrice, finalPrice, discount, rawFinalPrice, totalPrice, rawTotalPrice, temporaryTotal, discountAmount } = calculatePrices();
    const checkAuth = (): boolean => {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            navigate("/login");
            return false;
        }
        const user = JSON.parse(userStr);
        if (user.isVerified === false || user.isVerified === 0) {
            navigate("/login");
            return false;
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!product) return;
        if (!checkAuth()) return;

        const cartItem = {
            id: product.productId,
            name: product.productName,
            image: mainImage,
            quantity,
            size: selectedSize,
            checked: true,
            priceBySize: { [selectedSize]: rawFinalPrice }
        };

        const existingCart = localStorage.getItem("cart_products");
        let cart = existingCart ? JSON.parse(existingCart) : [];

        const existingIndex = cart.findIndex(
            (item: any) => item.id === cartItem.id && item.size === cartItem.size
        );

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem("cart_products", JSON.stringify(cart));
        alert("Đã thêm vào giỏ hàng!");
    };

    const handleBuyNow = () => {
        if (!product) return;
        if (!checkAuth()) return;

        navigate("/payment", {
            state: {
                checkoutProducts: [{
                    id: product.productId,
                    name: product.productName,
                    image: mainImage,
                    quantity,
                    size: selectedSize,
                    checked: true,
                    priceBySize: { [selectedSize]: rawFinalPrice }
                }],
                temporaryTotal,
                discountAmount,
                finalTotal: rawTotalPrice
            }
        });
    };

    const handleSubmitReview = async () => {
        if (!userComment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá!");
            return;
        }

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert("Vui lòng đăng nhập để gửi đánh giá!");
            return;
        }
        const currentUser = JSON.parse(storedUser);

        try {
            setIsSubmittingReview(true);
            const newReview = {
                productId: product?.productId,
                userId: currentUser.userId,
                orderId: null,
                rating: userRating,
                comment: userComment
            };
            await axios.post('http://localhost:5000/api/review', newReview);
            alert("Cảm ơn bạn đã gửi đánh giá!");
            setReviews([{ ...newReview, userName: currentUser.userName || 'Bạn', created_at: new Date().toISOString() }, ...reviews]);
            setUserComment('');
            setUserRating(5);
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            alert("Có lỗi xảy ra, không thể gửi đánh giá!");
        } finally {
            setIsSubmittingReview(false);
        }
    };
    const listRef = useRef<HTMLDivElement>(null);

    const nextDiscount = () => {
        listRef.current?.scrollBy({
            left: 240,
            behavior: "smooth"
        });
    };

    const prevDiscount = () => {
        listRef.current?.scrollBy({
            left: -240,
            behavior: "smooth"
        });
    };

    if (loading) return <div className="loading-container">Đang tải...</div>;
    if (!product) return <div className="error-container">Không tìm thấy sản phẩm.</div>;

    const availableSizes = (product.size && typeof product.size === 'string')
        ? product.size.split(',').map(s => s.trim())
        : ['S', 'M', 'L'];

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1)
        : '5.0';

    return (
        <div className="product-detail-page">
            <div className="container detail-content-wrapper">
                <div className="breadcrumb-container">
                    <Link to="/">Trang chủ</Link> /
                    <Link to={product.categoryId ? `/category/${product.categoryId}` : '#'}>
                        {product.categoryName || 'Danh mục'}
                    </Link> /
                    <span>{product.productName}</span>
                </div>

                <div className="product-main-info row">
                    <div className="col-md-7 product-gallery">
                        {/* Ảnh chính + nút prev/next */}
                        <div className="main-image-wrapper">
                            <button
                                className="img-nav-btn img-nav-prev"
                                onClick={() => {
                                    const allImgs = [mainImage, ...productImages.filter(img => img !== mainImage)];
                                    const newIndex = (currentImageIndex - 1 + allImgs.length) % allImgs.length;
                                    setCurrentImageIndex(newIndex);
                                    setMainImage(allImgs[newIndex]);
                                }}
                            >&#8249;</button>
                            <div className="main-image-container">
                                <img
                                    src={mainImage}
                                    alt={product.productName}
                                    className="img-fluid main-img"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/img/default-product.jpg';
                                    }}
                                />
                            </div>
                            <button
                                className="img-nav-btn img-nav-next"
                                onClick={() => {
                                    const allImgs = [mainImage, ...productImages.filter(img => img !== mainImage)];
                                    const newIndex = (currentImageIndex + 1) % allImgs.length;
                                    setCurrentImageIndex(newIndex);
                                    setMainImage(allImgs[newIndex]);
                                }}
                            >&#8250;</button>
                        </div>
                        {/* Thumbnails căn giữa */}
                        <div className="thumbnail-list">
                            {productImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail-item ${mainImage === img ? 'active' : ''}`}
                                    onClick={() => {
                                        setMainImage(img);
                                        setCurrentImageIndex(index + 1);
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`thumb-${index}`}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/img/default-product.jpg';
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-md-5 product-shop-ops d-flex flex-column justify-content-center ps-md-5">
                        <h1 className="product-title">{product.productName}</h1>
                        {product.description && (
                            <p className="product-short-desc">{product.description}</p>
                        )}

                        <div className="product-rating-row">
                            <div className="stars">
                                {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                                <span className="rating-text">({avgRating})</span>
                            </div>
                            <span className="divider">|</span>
                            <span className="text-muted">{reviews.length} Đánh giá</span>
                            <span className="divider">|</span>
                            <span className="text-muted">{stockQuantity} Đã bán</span>
                        </div>
                        <div className="discount-slider">
                            <button className="discount-nav" onClick={prevDiscount}>❮</button>
                            <div className="discount-slider-list" ref={listRef}>
                                {discounts.map(discount => (
                                    <DiscountCoupon
                                        key={discount.discountId}
                                        discount={discount}
                                        onUse={(code) => {

                                            if (!code) {
                                                localStorage.removeItem("savedDiscount");
                                                return;
                                            }

                                            localStorage.setItem(
                                                "savedDiscount",
                                                JSON.stringify(discount)
                                            );

                                        }}
                                    />
                                ))}
                            </div>
                            <button className="discount-nav" onClick={nextDiscount}>❯</button>
                        </div>

                        <div className="variant-group">
                            <div className="variant-label-row">
                                <span className="variant-label-text">Kích cỡ</span>
                                <span className="variant-selected-badge">{selectedSize}</span>
                            </div>
                            <div className="variant-options">
                                {availableSizes.map(size => (
                                    <button
                                        key={size}
                                        className={`btn-variant ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="quantity-group">
                            <div className="variant-label-row">
                                <span className="variant-label-text">Số lượng</span>
                                <span className="stock-badge">
                                    Còn {stockQuantity} sản phẩm
                                </span>
                            </div>
                            <div className="quantity-controller">
                                <button
                                    className="qty-btn"
                                    onClick={() => handleQuantityChange('minus')}
                                    disabled={quantity <= 1}
                                >−</button>
                                <span className="qty-display">{quantity}</span>
                                <button
                                    className="qty-btn"
                                    onClick={() => handleQuantityChange('plus')}
                                    disabled={quantity >= stockQuantity}
                                >+</button>
                            </div>
                        </div>

                        <div className="dynamic-total-box">
                            <span className="dynamic-total-label">
                                Tổng tạm tính ({quantity} sản phẩm):
                            </span>
                            <div className="dynamic-total-price">
                                {totalPrice} đ
                            </div>
                        </div>
                        <div className="action-buttons">
                            {/* GIỎ HÀNG — icon only */}
                            <button className="btn-cart" onClick={handleAddToCart}>
                                <img
                                    src={cartIcon}
                                    alt="cart"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        filter: 'invert(56%) sepia(71%) saturate(748%) hue-rotate(292deg) brightness(101%) contrast(97%)'
                                    }}
                                />
                            </button>
                            {/* MUA NGAY */}
                            <Link
                                to="/payment"
                                state={{
                                    checkoutProducts: [{
                                        id: product.productId,
                                        name: product.productName,
                                        image: mainImage,
                                        quantity,
                                        size: selectedSize,
                                        checked: true,
                                        priceBySize: { [selectedSize]: rawFinalPrice }
                                    }],
                                    temporaryTotal,
                                    discountAmount,
                                    finalTotal: rawTotalPrice
                                }}
                            >
                                <button className="btn-buy-now">MUA NGAY</button>
                            </Link>
                        </div>
                </div>
            </div>

                <div className="product-bottom-info">
                    <div className="tab-headers">
                        <button className={`tab-link ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>
                            MÔ TẢ SẢN PHẨM
                        </button>
                        <button className={`tab-link ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
                            ĐÁNH GIÁ ({reviews.length})
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'desc' ? (
                            <div className="description-content">
                                <h4>Thông tin chi tiết</h4>
                                {productSpecs.length > 0 ? (
                                    <table className="spec-table">
                                        <tbody>
                                            {productSpecs.map((spec) => (
                                                <tr key={spec.specId}>
                                                    <td className="spec-name">{spec.specName}</td>
                                                    <td className="spec-value">{spec.specValue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-muted" style={{ fontSize: '15px' }}>
                                        Chưa có thông số kỹ thuật cho sản phẩm này.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="reviews-content">
                                {/* TỔNG QUAN ĐÁNH GIÁ */}
                                <div className="reviews-overview">
                                    <div className="review-avg-box">
                                        <div className="review-avg-score">{avgRating}</div>
                                        <div className="review-avg-stars">
                                            {'★'.repeat(Math.round(Number(avgRating)))}
                                            {'☆'.repeat(5 - Math.round(Number(avgRating)))}
                                        </div>
                                        <div className="review-avg-count">{reviews.length} đánh giá</div>
                                    </div>

                                    <div className="review-bars">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = reviews.filter(r => r.rating === star).length;
                                            const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                            return (
                                                <div
                                                    key={star}
                                                    onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                                                    className={`review-bar-row${filterRating !== 0 && filterRating !== star ? ' dimmed' : ''}`}
                                                >
                                                    <span className="review-bar-label">{star} sao</span>
                                                    <div className="review-bar-track">
                                                        <div className="review-bar-fill" style={{ width: `${percent}%` }} />
                                                    </div>
                                                    <span className="review-bar-count">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* FILTER THEO SAO — hàng ngang */}
                                <div className="review-filter-btns">
                                    <button
                                        onClick={() => setFilterRating(0)}
                                        className={`review-filter-btn${filterRating === 0 ? ' active' : ''}`}
                                    >Tất cả</button>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                                            className={`review-filter-btn${filterRating === star ? ' active' : ''}`}
                                        >{star} sao</button>
                                    ))}
                                </div>

                                {/* FORM VIẾT ĐÁNH GIÁ */}
                                {/*<div className="review-form-box">
                                    <h5 className="review-form-title">Viết đánh giá của bạn</h5>
                                    <div className="review-star-row">
                                        <span className="review-star-label">Chọn số sao:</span>
                                        <div className="review-star-selector">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span
                                                    key={star}
                                                    onClick={() => setUserRating(star)}
                                                    style={{ color: star <= userRating ? '#facc15' : '#ddd' }}
                                                >★</span>
                                            ))}
                                        </div>
                                        <span className="review-rating-badge">{userRating} sao</span>
                                    </div>
                                    <textarea
                                        className="review-textarea"
                                        rows={3}
                                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                                        value={userComment}
                                        onChange={(e) => setUserComment(e.target.value)}
                                    />
                                    <button
                                        className="btn-buy-now review-submit-btn"
                                        onClick={handleSubmitReview}
                                        disabled={isSubmittingReview}
                                    >
                                        {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                    </button>
                                </div>*/}

                                {/* DANH SÁCH ĐÁNH GIÁ */}
                                <h4 className="review-list-title">
                                    Đánh giá từ khách hàng
                                    {filterRating > 0 && (
                                        <span className="review-filter-badge">
                                            {filterRating} sao
                                            <span onClick={() => setFilterRating(0)} className="review-filter-badge-close">×</span>
                                        </span>
                                    )}
                                </h4>

                                {(() => {
                                    const filtered = filterRating > 0
                                        ? reviews.filter(r => r.rating === filterRating)
                                        : reviews;

                                    if (filtered.length === 0) return (
                                        <p className="review-empty">
                                            {filterRating > 0
                                                ? `Chưa có đánh giá ${filterRating} sao nào.`
                                                : 'Chưa có đánh giá nào. Hãy là người đầu tiên!'}
                                        </p>
                                    );

                                    return (
                                        <div className="review-list">
                                            {filtered.map((rev, index) => (
                                                <div key={index} className="review-item">
                                                    <div className="review-avatar">
                                                        {(rev.userName || 'K').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="review-body">
                                                        <div className="review-meta">
                                                            <strong className="review-username">{rev.userName || 'Khách hàng ẩn danh'}</strong>
                                                            <span className="review-date">
                                                                {rev.created_at
                                                                    ? new Date(rev.created_at).toLocaleDateString('vi-VN')
                                                                    : 'Vừa xong'}
                                                            </span>
                                                        </div>
                                                        <div className="review-stars-display">
                                                            {'★'.repeat(rev.rating)}
                                                            <span className="review-stars-empty">{'★'.repeat(5 - rev.rating)}</span>
                                                            <span className="review-score-badge">{rev.rating}.0</span>
                                                        </div>
                                                        <p className="review-comment">{rev.comment}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailProduct;
