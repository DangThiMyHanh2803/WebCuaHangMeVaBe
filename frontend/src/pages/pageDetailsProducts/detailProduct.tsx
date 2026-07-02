import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './detailProduct.css';
import cartIcon from '../../assets/header/cart.svg';

interface ProductImage {
    imageId: number;
    productId: number;
    imageUrl: string;
    isMain: number;
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

    const [mainImage, setMainImage] = useState<string>('/img/default-product.jpg');
    const [productImages, setProductImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    // =================== FETCH DATA ===================
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                // 1. Thông tin sản phẩm
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

                // 2. Ảnh sản phẩm
                try {
                    const imgRes = await axios.get(`http://localhost:5000/api/product-image/product/${id}`);
                    const imgData: ProductImage[] = imgRes.data;

                    const mainImg = imgData.find(img => img.isMain === 1);
                    const thumbImgs = imgData.filter(img => img.isMain === 0);

                    if (mainImg) {
                        setMainImage(mainImg.imageUrl);
                    } else if (data.imageUrl) {
                        setMainImage(
                            data.imageUrl.startsWith('http')
                                ? data.imageUrl
                                : `http://localhost:5000/images/${data.imageUrl}`
                        );
                    }

                    setProductImages(
                        thumbImgs.length > 0
                            ? thumbImgs.map(img => img.imageUrl)
                            : mainImg ? [mainImg.imageUrl] : []
                    );
                } catch {
                    if (data.imageUrl) {
                        const resolved = data.imageUrl.startsWith('http')
                            ? data.imageUrl
                            : `http://localhost:5000/images/${data.imageUrl}`;
                        setMainImage(resolved);
                        setProductImages([resolved]);
                    }
                }

                // 3. Tồn kho
                try {
                    const stockRes = await axios.get(`http://localhost:5000/api/product-stock/product/${id}`);
                    setStockQuantity(stockRes.data?.quantity ?? 0);
                } catch {
                    setStockQuantity(0);
                }

                // 4. Thông số kỹ thuật
                try {
                    const specRes = await axios.get(`http://localhost:5000/api/product-spec/product/${id}`);
                    setProductSpecs(Array.isArray(specRes.data) ? specRes.data : []);
                } catch {
                    // bỏ qua
                }

                // 5. Đánh giá
                try {
                    const reviewRes = await axios.get(`http://localhost:5000/api/review/product/${id}`);
                    setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
                } catch {
                    // bỏ qua
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

    // =================== HANDLERS ===================
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

    const handleAddToCart = () => {
        if (!product) return;

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

    // =================== RENDER ===================
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
                    {/* ---- Gallery ---- */}
                    <div className="col-md-7 product-gallery">
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

                    {/* ---- Thông tin mua hàng ---- */}
                    <div className="col-md-5 product-shop-ops d-flex flex-column justify-content-center ps-md-5">
                        <h1 className="product-title">{product.productName}</h1>
                        {product.description && (
                            <p className="product-short-desc">{product.description}</p>
                        )}

                        <div className="product-rating-row">
                            <div className="stars" style={{ color: '#fb71b0' }}>
                                {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                                <span style={{ color: '#333' }}>({avgRating})</span>
                            </div>
                            <span className="divider">|</span>
                            <span className="text-muted">{reviews.length} Đánh giá</span>
                            <span className="divider">|</span>
                            <span className="text-muted">{stockQuantity} Đã bán</span>
                        </div>

                        <div className="product-price-box">
                            {discount > 0 ? (
                                <>
                                    <span className="original-price">{originalPrice} đ</span>
                                    <span className="final-price">{finalPrice} đ</span>
                                    <span className="discount-tag">-{discount}%</span>
                                </>
                            ) : (
                                <span className="final-price">{finalPrice} đ</span>
                            )}
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

                        <div className="dynamic-total-box" style={{ marginTop: '20px', padding: '12px 18px', background: '#fff5f8', borderRadius: '10px', border: '1px dashed #fb71b0' }}>
                            <span style={{ fontSize: '15px', fontWeight: '500', color: '#555' }}>
                                Tổng tạm tính ({quantity} sản phẩm):
                            </span>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fb71b0', marginTop: '4px' }}>
                                {totalPrice} đ
                            </div>
                        </div>

                        <div className="action-buttons">
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

                {/* ---- Tab Mô tả / Đánh giá ---- */}
                <div className="product-bottom-info">
                    <div className="tab-headers">
                        <button
                            className={`tab-link ${activeTab === 'desc' ? 'active' : ''}`}
                            onClick={() => setActiveTab('desc')}
                        >
                            MÔ TẢ SẢN PHẨM
                        </button>
                        <button
                            className={`tab-link ${activeTab === 'review' ? 'active' : ''}`}
                            onClick={() => setActiveTab('review')}
                        >
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
                                <h4>Đánh giá từ khách hàng</h4>
                                {reviews.length === 0 ? (
                                    <p className="text-muted">
                                        Chưa có đánh giá nào cho sản phẩm này.
                                    </p>
                                ) : (
                                    <div className="review-list">
                                        {reviews.map((rev, index) => (
                                            <div
                                                key={rev.reviewId ?? index}
                                                className="review-item"
                                                style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}
                                            >
                                                <div className="d-flex align-items-center mb-2">
                                                    <strong style={{ marginRight: '10px' }}>
                                                        {rev.userName || 'Khách hàng ẩn danh'}
                                                    </strong>
                                                    <span style={{ color: '#fb71b0', fontSize: '14px' }}>
                                                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                                    </span>
                                                </div>
                                                <p style={{ margin: '5px 0', color: '#555' }}>{rev.comment}</p>
                                                <span style={{ fontSize: '12px', color: '#999' }}>
                                                    {rev.created_at
                                                        ? new Date(rev.created_at).toLocaleDateString('vi-VN')
                                                        : 'Vừa xong'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailProduct;