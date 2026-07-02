const db = require("../config/db");

/* GET ALL REVIEWS */
const getReviews = (callback) => {
    const sql = `
        SELECT
            reviews.*,
            users.userName,
            products.productName
        FROM reviews
                 LEFT JOIN users ON reviews.userId = users.userId
                 LEFT JOIN products ON reviews.productId = products.productId
    `;
    db.query(sql, callback);
};

/* GET REVIEW BY ID */
const getReviewById = (id, callback) => {
    const sql = `
        SELECT
            reviews.*,
            users.userName,
            products.productName
        FROM reviews
                 LEFT JOIN users ON reviews.userId = users.userId
                 LEFT JOIN products ON reviews.productId = products.productId
        WHERE reviews.reviewId = ?
    `;
    db.query(sql, [id], callback);
};

/* GET REVIEWS BY PRODUCT */
const getReviewsByProductId = (productId, callback) => {
    const sql = `
        SELECT
            reviews.*,
            users.userName
        FROM reviews
                 LEFT JOIN users ON reviews.userId = users.userId
        WHERE reviews.productId = ?
        ORDER BY reviews.created_at DESC
    `;
    db.query(sql, [productId], callback);
};

/* GET REVIEWS BY USER — dùng cho trang "Đánh giá của tôi" */
const getReviewsByUserId = (userId, callback) => {
    const sql = `
        SELECT
            reviews.reviewId,
            reviews.productId,
            reviews.rating,
            reviews.comment,
            reviews.created_at,
            products.productName,
            (
                SELECT pi.imageUrl
                FROM product_images pi
                WHERE pi.productId = reviews.productId AND pi.isMain = 1
                LIMIT 1
            ) AS imageUrl
        FROM reviews
            LEFT JOIN products ON reviews.productId = products.productId
        WHERE reviews.userId = ?
        ORDER BY reviews.created_at DESC
    `;
    db.query(sql, [userId], callback);
};

/* CREATE REVIEW */
const createReview = (data, callback) => {
    const sql = `
        INSERT INTO reviews
            (userId, productId, orderId, orderDetailId, rating, comment)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
        sql,
        [
            data.userId,
            data.productId,
            data.orderId || null,
            data.orderDetailId || null, // Thêm orderDetailId vào đây
            data.rating,
            data.comment
        ],
        callback
    );
};

/* UPDATE REVIEW */
const updateReview = (id, data, callback) => {
    const sql = `
        UPDATE reviews
        SET rating = ?, comment = ?
        WHERE reviewId = ?
    `;
    db.query(sql, [data.rating, data.comment, id], callback);
};

/* DELETE REVIEW */
const deleteReview = (id, callback) => {
    const sql = `DELETE FROM reviews WHERE reviewId = ?`;
    db.query(sql, [id], callback);
};

module.exports = {
    getReviews,
    getReviewById,
    getReviewsByProductId,
    getReviewsByUserId,
    createReview,
    updateReview,
    deleteReview,
};
