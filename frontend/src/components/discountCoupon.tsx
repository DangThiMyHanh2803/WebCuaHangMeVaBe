import React, {useEffect, useState} from "react";
import "./style/discountCoupon.css";
import { FaTicketAlt, FaRegClock } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
interface Discount {
    discountId: number;
    discountCode: string;
    discountValue: number;
    discountType: "percent" | "fixed";
    startDate: string;
    endDate: string;
    status: boolean;
}

interface Props {
    discount: Discount;
    onUse?: (code: string) => void;
}

const DiscountCoupon: React.FC<Props> = ({ discount, onUse }) => {
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem(
            "savedDiscount",
            JSON.stringify(discount)
        );

        onUse?.(discount.discountCode);
    };
    const formatValue = () => {
        if (discount.discountType === "percent") {
            return `${discount.discountValue}%`;
        }
        return `${discount.discountValue.toLocaleString()}`;
    };
    useEffect(() => {
        const saved = JSON.parse(
            localStorage.getItem("savedDiscount") || "null"
        );

        setIsSaved(saved?.discountId === discount.discountId);
    }, [discount.discountId]);
    useEffect(() => {

        const updateSaved = () => {

            const saved = JSON.parse(
                localStorage.getItem("savedDiscount") || "null"
            );

            setIsSaved(saved?.discountId === discount.discountId);

        };

        updateSaved();

        window.addEventListener("storage", updateSaved);

        return () =>
            window.removeEventListener("storage", updateSaved);

    }, [discount.discountId]);
    return (
        <div className={`discount-card ${!discount.status ? "disabled" : ""}`}>
            <div className="discount-left">
                <FaTicketAlt className="ticket-icon"/>
                <h2>{formatValue()}</h2>
            </div>
            <div className="discount-center">
                <h3>{discount.discountCode}</h3>
                <p>
                    {discount.discountType === "percent"
                        ? `Giảm ${discount.discountValue}%`
                        : `Giảm ${discount.discountValue.toLocaleString()}đ`}
                </p>
            </div>
            <div className="discount-right">
                <button
                    disabled={!discount.status}
                    onClick={() => {
                        localStorage.setItem(
                            "savedDiscount",
                            JSON.stringify(discount)
                        );

                        setIsSaved(true);

                        window.dispatchEvent(new Event("storage"));

                        onUse?.(discount.discountCode);
                    }}
                >
                    {isSaved ? "Đã lưu" : "Lưu"}
                </button>
            </div>
        </div>
    );
};

export default DiscountCoupon;