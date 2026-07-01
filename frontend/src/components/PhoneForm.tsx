import React, {useState} from "react";
import axios from "axios";
import TermsModal from "./TermsModal";
type Props = {
    onLogin: () => void;
    onOtp: () => void;
    setPhone: (phone: string) => void;
};
const PhoneForm: React.FC<Props> = ({onLogin, onOtp, setPhone}) => {
    const [phone, setLocalPhone] = useState("");
    const [showTerms, setShowTerms] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [termsError, setTermsError] = useState(false);
    const handleContinue = async () => {
        if (!agreed) {
            setTermsError(true);
            return;
        }
        setTermsError(false);
        try {
            const res = await axios.post(
                "http://localhost:5000/api/account/check-phone",
                {phone}
            );
            // lưu phone lên Login.tsx
            setPhone(phone);
            // tài khoản tồn tại
            if (res.data.exists) {
                onLogin();
            }
            else {
                await axios.post(
                    "http://localhost:5000/api/account/send-otp",
                    {phone}
                );
                onOtp();
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="form-box">
            <h3>Vui chào đón bố mẹ</h3>
            <p>Đăng nhập hoặc Đăng ký ngay tài khoản</p>
            <input type="text" placeholder="Bố mẹ vui lòng nhập số điện thoại..."
                value={phone} onChange={(e) =>
                    setLocalPhone(e.target.value)}
            />
            <div className="checkbox">
                <input type="checkbox" id="agree" checked={agreed}
                    onChange={(e) => {
                        setAgreed(e.target.checked);
                        if (e.target.checked) setTermsError(false);
                    }}
                />
                <label htmlFor="agree">
                    Ba mẹ đã đọc và đồng ý với
                    <span className="terms-link"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowTerms(true);
                        }}>
                        Điều Khoản Chung & Chính Sách Bảo Mật
                    </span>
                </label>
            </div>
            {termsError && (
                <p className="terms-error">Vui lòng đồng ý với điều khoản để tiếp tục</p>
            )}
            {
                showTerms && (
                    <TermsModal onClose={() => setShowTerms(false)}/>
                )
            }
            <button onClick={handleContinue}>Tiếp tục</button>
        </div>
    );
};
export default PhoneForm;