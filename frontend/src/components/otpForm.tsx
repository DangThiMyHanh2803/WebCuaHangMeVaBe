import React, { useState } from "react";

import axios from "axios";

type Props = {

    phone: string;

    onNext: () => void;
};

const OtpForm: React.FC<Props> = ({
                                      phone,
                                      onNext
                                  }) => {

    const [otp, setOtp] =
        useState("");

    const [error, setError] =
        useState("");

    const handleVerifyOtp =
        async () => {

            try {

                const res = await axios.post(
                    "http://localhost:5000/api/account/verify-otp",
                    {
                        phone,
                        otp
                    }
                );

                // OTP đúng
                if (res.data.success) {

                    onNext();
                }

                // OTP sai
                else {

                    setError(
                        "Mã OTP không đúng"
                    );
                }

            } catch (error) {

                console.log(error);
            }
        };

    return (

        <div className="form-box">

            <h3>Xác thực OTP</h3>

            <p>
                Vui lòng nhập mã OTP
            </p>

            <input
                type="text"
                placeholder="Nhập mã OTP..."
                value={otp}
                onChange={(e) =>
                    setOtp(e.target.value)
                }
            />

            {
                error && (
                    <p className="error">
                        {error}
                    </p>
                )
            }

            <button   onClick={handleVerifyOtp} >    Xác nhận  </button>
            <p className="resend-text">
                Chưa nhận được mã?
                <span> Gửi lại  </span>
            </p>

        </div>
    );
};

export default OtpForm;