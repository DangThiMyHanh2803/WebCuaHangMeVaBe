import React, { useState, useEffect, useMemo } from "react";
import "./address.css";
import banner from "../../assets/icons/Sanpham.png";
import banner4 from "../../assets/banners/banner4.png";
import banner6 from "../../assets/banners/banner6.png";
import AccoutMenu from "../../components/accoutMenu";
import axios from "axios";
import AccountMenu from "../../components/accoutMenu";
interface AddressItem {
    addressId: number;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    detailAddress: string;
    note: string;
    isDefault: number;
}
const emptyForm = { fullName: "", phone: "", province: "", district: "", detailAddress: "", note: "" };
const Address: React.FC = () => {
    const currentUser = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
    const [form, setForm] = useState(emptyForm);
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const fetchAddresses = async () => {
        if (!currentUser.userId) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/address/user/${currentUser.userId}`);
            const data: AddressItem[] = res.data;
            setAddresses(data);
            const def = data.find(a => a.isDefault === 1) || data[0];
            if (def) {
                setForm({
                    fullName: def.fullName || "",
                    phone: def.phone || "",
                    province: def.province || "",
                    district: def.district || "",
                    detailAddress: def.detailAddress || "",
                    note: def.note || ""
                });
                setEditingId(def.addressId);
            }
        } catch {
            setAddresses([]);
        }
    };
    useEffect(() => { fetchAddresses(); }, []);
    const handleAdd = async () => {
        if (!currentUser.userId) return;
        try {
            const isFirst = addresses.length === 0;
            await axios.post(`http://localhost:5000/api/address`, {...form,
                userId: currentUser.userId, isDefault: isFirst ? 1 : 0});
            setForm(emptyForm);
            setEditingId(null);
            fetchAddresses();
        } catch (err) {
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };
    const handleUpdate = async () => {
        if (!editingId) return;
        try {
            await axios.put(`http://localhost:5000/api/address/${editingId}`, form);
            fetchAddresses();
        } catch {
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };
    const handleSetDefault = async (addressId: number) => {
        try {
            await axios.put(`http://localhost:5000/api/address/${addressId}/default`, { userId: currentUser.userId });
            fetchAddresses();
        } catch {
            alert("Có lỗi xảy ra.");
        }
    };
    const handleDelete = async (addressId: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/address/${addressId}`, { data: { userId: currentUser.userId } });
            fetchAddresses();
        } catch {
            alert("Có lỗi xảy ra.");
        }
    };
    return (
        <div className="address-page">
            <p className="breadcrumb">
                <a href="/">Trang chủ</a> &gt;
                <a href="/account"> Trang cá nhân</a> &gt;
                <a href="/address"> Địa chỉ của bạn</a>
            </p>
            <button className="menu-toggle" onClick={() => setShowMenu(true)}>
                <i className="fa-solid fa-bars"></i>
            </button>
            <div className="address-container">
                <AccountMenu showMenu={showMenu} onClose={() => setShowMenu(false)}/>
                <div className="address-form">
                    <h3>Thêm địa chỉ nhận hàng mới</h3>
                    <p>Vui lòng xác nhận các nội dung bên dưới</p>
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Nhập tên..." />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Nhập số điện thoại..." />
                    <div className="row">
                        <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Tỉnh/Thành phố..." />
                        <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Quận/Huyện..." />
                    </div>
                    <input value={form.detailAddress} onChange={(e) => setForm({ ...form, detailAddress: e.target.value })} placeholder="Địa chỉ chi tiết..." />
                    <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú" />
                    <div className="btn-group">
                        {editingId && (
                            <button className="btn-update" onClick={handleUpdate}>Sửa</button>
                        )}
                        <button className="btn-submit" onClick={handleAdd}>Thêm địa chỉ</button>
                    </div>
                    {/* DANH SÁCH ĐỊA CHỈ */}
                    {addresses.length > 0 && (
                        <div className="address-list">
                            <h4>Địa chỉ của bạn</h4>
                            <div className="address-cards">
                                {addresses.map((addr) => (
                                    <div key={addr.addressId} className={`address-card ${addr.isDefault ? "address-card--default" : ""}`}>
                                        <div className="address-card__main">
                                            <div className="address-card__info">
                                                <div className="address-card__header">
                                                    <span className="address-card__name">{addr.fullName}</span>
                                                    <span className="address-card__phone">{addr.phone}</span>
                                                    {addr.isDefault === 1 && (
                                                        <span className="address-card__badge">✓ Mặc định</span>
                                                    )}
                                                </div>
                                                <p className="address-card__detail">
                                                    {addr.detailAddress}{addr.district ? `, ${addr.district}` : ""}{addr.province ? `, ${addr.province}` : ""}
                                                </p>
                                                {addr.note && <p className="address-card__note">Ghi chú: {addr.note}</p>}
                                            </div>
                                            <div className="address-card__actions">
                                                {addr.isDefault !== 1 && (
                                                    <button className="btn-set-default" onClick={() => handleSetDefault(addr.addressId)}>
                                                        Mặc định
                                                    </button>
                                                )}
                                                <button className="btn-delete" onClick={() => handleDelete(addr.addressId)}>Xóa</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="right-sidebar">
                    <div className="info-card">
                        <img src={banner4} alt="banner" />
                        <p>So sánh các loại tã quần tốt nhất hiện nay</p>
                    </div>
                    <div className="info-card">
                        <img src={banner6} alt="banner" />
                        <p>So sánh các loại tã quần tốt nhất hiện nay</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Address;