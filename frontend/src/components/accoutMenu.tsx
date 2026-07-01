import React from "react";
import map from "../assets/icons/icondiachi.png";
import './style/accountMenu.css';

const AccountMenu: React.FC = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const path = window.location.pathname;

    return (
        <div className="menu-account">
            <div className="user-box">
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt="avatar"
                        className="avatar"
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                    />
                ) : (
                    <div className="avatar" />
                )}
                <p>{user.userName || "Tài khoản"}</p>
                <div className="address-link">
                    <img src={map} alt="map" className="promo-map" />
                    <button onClick={() => window.location.href = "/address"}>
                        <a href="/address">Địa chỉ nhận hàng</a>
                    </button>
                </div>
            </div>

            <ul className="menu">
                <li>Thẻ thành viên</li>
                <li>Xu của bạn</li>
                <li className={path === "/voucher" ? "active" : ""}>
                    <a href="/voucher">Gói ưu đãi</a>
                </li>
                <li className={path === "/address" ? "active" : ""}>
                    <a href="/address">Địa chỉ nhận hàng</a>
                </li>
                <a href="/history" className={path === "/history" ? "active" : ""}>Lịch sử đơn hàng</a>
                <li>Voucher của tôi</li>
                <li>Đánh giá của tôi</li>
                <li className={path === "/account" ? "active" : ""}>
                    <a href="/account">Thông tin cá nhân</a>
                </li>
            </ul>
            <button
                className="logout-btn"
                onClick={() => {
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                }}
            >
                Đăng xuất
            </button>
        </div>
    );
};

export default AccountMenu;