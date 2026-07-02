import React, {useEffect, useMemo, useRef, useState} from "react";
import "./account.css";
import AccountMenu from "../../components/accoutMenu";
import axios from "axios";
export interface Account {
    userId: number;
    userName: string;
    email: string;
    phone: string;
    isVerified: boolean;
    gender?: string;
    birthDate?: string;
    avatar?: string;
    role: "user" | "admin";
    created_at: string;
    updated_at: string;
}
const AccountPage: React.FC = () => {
    const currentUser = useMemo(
        () => JSON.parse(localStorage.getItem("user") || "{}"),
        []
    );
    const [user, setUser] = useState<Account | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        userName: "",
        phone: "",
        email: "",
        gender: "",
        birthDate: ""
    });
    const [showMenu, setShowMenu] = useState(false);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!currentUser.userId) return;
                const res = await axios.get(
                    `http://localhost:5000/api/account/${currentUser.userId}`
                );
                const data = res.data;
                setUser(data);
                localStorage.setItem("user", JSON.stringify(data));
                setForm({
                    userName: data.userName || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    gender: data.gender || "",
                    birthDate: data.birthDate ? data.birthDate.split("T")[0] : ""
                });
            } catch (err) {
                console.log("Load user lỗi:", err);
            }
        };
        fetchUser();
    }, []);
    // ======================
    const handleUpdate = async () => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/account/${currentUser.userId}`,
                form
            );
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            window.dispatchEvent(new Event("userUpdated"));
            alert("Cập nhật thành công!");
        } catch (err) {
            console.log(err);
            alert("Cập nhật thất bại, vui lòng thử lại!");
        }
    };
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;
            try {
                const res = await axios.put(
                    `http://localhost:5000/api/account/${currentUser.userId}/avatar`,
                    { avatar: base64 }
                );
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
                window.dispatchEvent(new Event("userUpdated"));
            } catch (err) {
                console.log(err);
                alert("Upload ảnh thất bại!");
            }
        };
        reader.readAsDataURL(file);
    };
    return (
        <div className="account-page">
            <p className="breadcrumb">
                <a href="/">Trang chủ</a> &gt;
                <a href="/account">Trang cá nhân</a>
            </p>
            <button
                className="menu-toggle"
                onClick={() => setShowMenu(true)}
            >
                <i className="fa-solid fa-bars"></i>
            </button>
            <div className="account-container">
                <AccountMenu showMenu={showMenu} onClose={() => setShowMenu(false)}/>
                <div className="account-form">
                    <div className="account-form-wrapper">
                        <div className="form-left">
                            <h3>Thông tin cá nhân</h3>
                            <input value={form.userName}
                                onChange={(e) =>
                                    setForm({ ...form, userName: e.target.value })} placeholder="Tên"
                            />
                            <input value={form.phone}
                                onChange={(e) =>
                                    setForm({ ...form, phone: e.target.value })} placeholder="Số điện thoại"
                            />
                            <input value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })} placeholder="Email"
                            />
                            <div className="row">
                                <select value={form.gender}
                                    onChange={(e) =>
                                        setForm({ ...form, gender: e.target.value })}
                                >
                                    <option value="">Giới tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                                <input type="date" value={form.birthDate}
                                    onChange={(e) =>
                                        setForm({ ...form, birthDate: e.target.value })}
                                />
                            </div>
                            <button className="btn-submit" onClick={handleUpdate}>Cập nhật</button>
                        </div>
                        <div className="form-right">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="avatar" className="avatar-large" style={{ objectFit: "cover" }}/>
                            ) : (<div className="avatar-large" />
                            )}
                            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange}/>
                            <button className="btn-upload" onClick={() => fileInputRef.current?.click()}>
                                Chọn ảnh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AccountPage;
