import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
type Props = {
     phone: string;
};

function InfoForm({ phone }: Props) {
    const navigate =  useNavigate();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const handleLogin =
        async () => {
            try {
                const res = await axios.post("http://localhost:5000/api/account/login", { phone, password });
                // lưu user
                localStorage.setItem( "user", JSON.stringify( res.data.user ));
                // chuyển trang chủ
                navigate("/");
            } catch (error) {
                setError( "Sai mật khẩu" );
                console.log(error);
            }
        };
    return (
        <div className="form-box">
            <h3>
                Nhập thông tin
            </h3>
            <input  type="password"  placeholder="Mật khẩu..."  value={password}
                onChange={(e) =>
                    setPassword( e.target.value )
                }
            />
            {
                error && (
                    <p className="error">
                        {error}
                    </p>
                )
            }
            <button onClick={handleLogin}>
                Hoàn tất
            </button>
        </div>
    );
}

export default InfoForm;