import React, { useEffect, useState } from "react";
import axios from "axios";
import "./category.css";

interface Category {
    categoryId: number;
    categoryName: string;
    icon: string;
}

interface CategorySidebarProps {
    selectedCategoryId: number | null;
    onSelectCategory: (id: number | null) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ selectedCategoryId, onSelectCategory }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/category");
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy category:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="category">
            <h3>Danh mục</h3>
            {loading ? (<p>Đang tải...</p>) : (
                <ul>
                    <li
                        className={selectedCategoryId === null ? "active" : ""}
                        onClick={() => onSelectCategory(null)}
                    >
                    </li>
                    {categories.map((item) => (
                        <li
                            key={item.categoryId}
                            className={selectedCategoryId === item.categoryId ? "active" : ""}
                            onClick={() => onSelectCategory(item.categoryId)}
                        >
                            <img src={item.icon} alt={item.categoryName} />
                            <span>{item.categoryName}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CategorySidebar;