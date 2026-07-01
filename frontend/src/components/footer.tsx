import React, {useState} from "react";
import './style/footer.css';
import youtube from "../assets/icons/youtobe.jpg";
import intergram from "../assets/icons/intergram.jpg";
import tiktok from "../assets/icons/tiktok.jpg";
import zalo from "../assets/icons/zalo.jpg";
import facebook from "../assets/icons/facebook.jpg";
import shield from "../assets/icons/icon2.png";
import returnIcon from "../assets/icons/icon3.png";
import truck from "../assets/icons/icon4.png";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
const Footer: React.FC = () => {
    const [openFooter, setOpenFooter] = useState<string | null>(null);
    const toggleFooter = (section: string) => {
        setOpenFooter(openFooter === section ? null : section);
    };
    return (
        <footer className="footer">
            {/* TOP ICON */}
            <div className="footer-top">
                <div className="footer-feature">
                    <img src={truck} alt="truck" />
                    <span>Giao hàng nhanh</span>
                </div>

                <div className="footer-feature">
                    <img src={shield} alt="shield" />
                    <span>Đảm bảo chất lượng</span>
                </div>

                <div className="footer-feature">
                    <img src={returnIcon} alt="return" />
                    <span>Đổi trả dễ dàng</span>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="footer-content">
                <div className="footer-column">
                    <h4>KẾT NỐI</h4>

                    <div className="social-icons">
                        <img src={facebook} alt="facebook" />
                        <img src={intergram} alt="intergram" />
                        <img src={tiktok} alt="tiktok" />
                        <img src={zalo} alt="zalo" />
                        <img src={youtube} alt="youtube" />
                    </div>
                </div>
                {/* COLUMN 1 */}
                <div className="footer-column">
                    <h4 onClick={() => toggleFooter("store")}>
                        HỆ THỐNG CỬA HÀNG
                        {openFooter === "store" ? <FaChevronUp/> : <FaChevronDown/>}
                    </h4>
                    <div className={openFooter === "store" ? "footer-body open" : "footer-body"}>
                        <p>Chi nhánh Quy Nhơn</p>
                        <p>Chi nhánh TP.HCM</p>
                        <p>Chi nhánh Hà Nội</p>
                    </div>
                </div>
                {/* COLUMN 2 */}
                <div className="footer-column">
                    <h4 onClick={() => toggleFooter("store")}>
                        HỖ TRỢ KHÁCH HÀNG
                        {openFooter === "store" ? <FaChevronUp /> : <FaChevronDown />}
                    </h4>
                    <div className={openFooter === "store" ? "footer-body open" : "footer-body"}>
                        <p>Chính sách đổi trả</p>
                        <p>Chính sách bảo hành</p>
                        <p>Hướng dẫn mua hàng</p>
                    </div>
                </div>
                {/* COLUMN 3 */}
                <div className="footer-column">
                    <h4 onClick={() => toggleFooter("store")}>
                        VỀ THƯƠNG HIỆU
                        {openFooter === "store" ? <FaChevronUp /> : <FaChevronDown />}
                    </h4>
                    <div className={openFooter === "store" ? "footer-body open" : "footer-body"}>
                        <p>Giới thiệu</p>
                        <p>Tin tức</p>
                        <p>Liên hệ</p>
                    </div>
                </div>
            </div>
            {/* BOTTOM */}
            <div className="footer-bottom">
                © 2026 Cửa hàng mẹ và bé. All rights reserved.
            </div>
        </footer>
    );
};
export default Footer;