import React from "react";

import "./style/termsModal.css";
type Props = {
    onClose: () => void;
};
const TermsModal: React.FC<Props> = ({onClose}) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* HEADER */}
                <div className="modal-header">
                    <div>
                        <h2>Điều Khoản Chung</h2>
                        <p>GreenBaby - Hệ thống cửa hàng Mẹ & Bé</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                {/* BODY */}
                <div className="terms-body">
                    <section>
                        <h3>Chào mừng đến với GreenBaby</h3>
                        <p>
                            Cảm ơn bạn đã truy cập và
                            sử dụng hệ thống GreenBaby.
                            Khi sử dụng website, bạn đồng
                            ý tuân thủ các điều khoản,
                            chính sách và quy định được
                            nêu dưới đây.
                        </p>
                    </section>
                    <section>
                        <h3>1. Điều kiện sử dụng</h3>
                        <p>
                            Người dùng phải từ 18 tuổi
                            trở lên hoặc truy cập dưới
                            sự giám sát của phụ huynh
                            hoặc người giám hộ hợp pháp.
                        </p>
                        <p>
                            Mỗi tài khoản phải được đăng
                            ký bằng thông tin chính xác.
                            Người dùng chịu trách nhiệm
                            bảo mật thông tin tài khoản
                            và mật khẩu cá nhân.
                        </p>
                    </section>
                    <section>
                        <h3>2. Chính sách bảo mật</h3>
                        <p>
                            GreenBaby cam kết bảo mật
                            tuyệt đối thông tin cá nhân
                            và thông tin thanh toán của
                            khách hàng.
                        </p>
                        <p>
                            Chúng tôi không chia sẻ dữ
                            liệu khách hàng cho bên thứ
                            ba nếu không có sự đồng ý
                            từ người dùng hoặc yêu cầu
                            từ cơ quan pháp luật.
                        </p>
                    </section>
                    <section>
                        <h3>3. Quy định đặt hàng</h3>
                        <p>
                            GreenBaby có quyền xác nhận,
                            từ chối hoặc hủy đơn hàng
                            trong trường hợp thông tin
                            không chính xác hoặc phát
                            sinh lỗi hệ thống.
                        </p>
                        <p>
                            Giá sản phẩm và chương trình
                            khuyến mãi có thể thay đổi
                            mà không cần thông báo trước.
                        </p>
                    </section>
                    <section>
                        <h3>4. Bản quyền</h3>
                        <p>
                            Toàn bộ nội dung, hình ảnh,
                            thiết kế và dữ liệu trên
                            website thuộc quyền sở hữu
                            của GreenBaby và được bảo hộ
                            theo pháp luật Việt Nam.
                        </p>
                    </section>
                    <section>
                        <h3>5. Chính sách đổi trả</h3>
                        <p>
                            Khách hàng có quyền yêu cầu
                            đổi trả sản phẩm theo đúng
                            chính sách đổi trả được công
                            bố trên website GreenBaby.
                        </p>
                    </section>
                    <section>
                        <h3>6. Cam kết dịch vụ</h3>
                        <p>
                            GreenBaby luôn nỗ lực mang
                            đến trải nghiệm mua sắm an
                            toàn, minh bạch và tiện lợi
                            dành cho các gia đình và em bé.
                        </p>
                    </section>
                    <section>
                        <h3>7. Thay đổi điều khoản</h3>
                        <p>
                            GreenBaby có quyền thay đổi
                            nội dung điều khoản bất kỳ
                            lúc nào. Các thay đổi sẽ có
                            hiệu lực ngay khi được cập
                            nhật trên website.
                        </p>
                    </section>
                </div>
                {/* FOOTER */}
                <div className="modal-footer">
                    <button className="agree-btn" onClick={onClose}>
                        Tôi đã hiểu
                    </button>
                </div>
            </div>
        </div>
    );
};
export default TermsModal;