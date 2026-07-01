import React, { useState } from "react";
import "./style/pagination.css";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}
const Pagination: React.FC<PaginationProps> = ({currentPage, totalPages, setCurrentPage}) => {
    const [showInput, setShowInput] = useState(false);
    const [pageInput, setPageInput] = useState("");
    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    const handleInputSubmit = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            const page = Number(pageInput);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                setCurrentPage(page);
            }
            setShowInput(false);
            setPageInput("");
        }
    };
    const renderDots = () => {
        if (showInput) {
            return (
                <input type="number" className="page-input" autoFocus
                    min={1} max={totalPages} value={pageInput}
                    onChange={(e) =>
                        setPageInput(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const page = Number(pageInput);
                            if (
                                page >= 1 &&
                                page <= totalPages
                            ) {
                                setCurrentPage(page);
                            }
                            setShowInput(false);
                            setPageInput("");
                        }
                    }}
                    onBlur={() => {
                        setShowInput(false);
                        setPageInput("");
                    }}
                />
            );
        }
        return (
            <button className="page-dots" onClick={() => setShowInput(true)}>
                ...
            </button>
        );
    };
    const renderPages = () => {
        const pages = [];
        // Trang đầu
        pages.push(
            <button key={1} className={currentPage === 1 ? "active" : ""}
                onClick={() => goToPage(1)}>1
            </button>
        );
        // Trang 2
        if (currentPage === 2) {
            pages.push(
                <button key={2} className="active" onClick={() => goToPage(2)}>2</button>
            );
        }
        // Current > 2
        if (currentPage > 2) {
            pages.push(renderDots());
            pages.push(
                <button key={currentPage - 1} onClick={() => goToPage(currentPage - 1)}>{currentPage - 1}</button>
            );
            if (currentPage !== totalPages) {
                pages.push(
                    <button key={currentPage} className="active"
                        onClick={() => goToPage(currentPage)}>{currentPage}
                    </button>
                );
            }
        }
        // Current + 1
        if (currentPage + 1 < totalPages) {
            pages.push(
                <button key={currentPage + 1}
                    onClick={() => goToPage(currentPage + 1)}>{currentPage + 1}
                </button>
            );
        }
        // Dots cuối
        if (currentPage + 2 < totalPages) {
            pages.push(renderDots());
        }
        // Trang cuối
        if (totalPages > 1) {
            pages.push(
                <button key={totalPages}
                    className={currentPage === totalPages ? "active" : ""}
                    onClick={() => goToPage(totalPages)}>{totalPages}
                </button>
            );
        }
        return pages;
    }
    return (
        <div className="pagination">
            <button className="page-nav" disabled={currentPage === 1} onClick={handlePrev}>◀</button>
            {renderPages()}
            <button className="page-nav" disabled={currentPage === totalPages} onClick={handleNext}>▶</button>
        </div>
    );
};
export default Pagination;