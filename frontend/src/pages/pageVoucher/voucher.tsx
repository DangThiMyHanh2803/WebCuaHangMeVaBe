import React, { useEffect, useState } from "react";
import axios from "axios";
import AccountMenu from "../../components/accoutMenu";
import "./voucher.css";
interface Discount {
    discountId: number;
    discountCode: string;
    discountValue: number;
    discountType: "percent" | "fixed";
    startDate: string;
    endDate: string;
    status: boolean;
}

const VoucherPage: React.FC = () => {

    const [discounts, setDiscounts] = useState<Discount[]>([]);

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/discount"
            );

            setDiscounts(res.data);

        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="account-page">

            <p className="breadcrumb">
                <a href="/">Trang chủ</a> &gt;
                <a href="/frontend/src/pages/pageVoucher/voucher">Gói ưu đãi</a>
            </p>

            <div className="account-container">

                <AccountMenu />

                <div className="account-form">

                    <h3>Gói ưu đãi của tôi</h3>

                    <p className="desc">
                        Các mã giảm giá hiện có.
                    </p>

                    <div className="voucher-list">

                        {discounts.map((item) => (

                            <div
                                className="voucher-card"
                                key={item.discountId}
                            >

                                <div className="voucher-left">

                                    <span className="voucher-value">

                                        {item.discountType === "percent"
                                            ? `${item.discountValue}%`
                                            : `${item.discountValue.toLocaleString()}đ`}

                                    </span>

                                </div>

                                <div className="voucher-center">

                                    <h4>{item.discountCode}</h4>

                                    <p>

                                        {item.discountType === "percent"
                                            ? `Giảm ${item.discountValue}%`
                                            : `Giảm ${item.discountValue.toLocaleString()}đ`}

                                    </p>

                                    <small>

                                        {item.startDate} - {item.endDate}

                                    </small>

                                </div>

                                <div className="voucher-right">

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(item.discountCode);
                                            alert("Đã sao chép mã");
                                        }}
                                    >
                                        Sao chép
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default VoucherPage;