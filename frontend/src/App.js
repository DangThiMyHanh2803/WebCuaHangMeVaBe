import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from "./layout/mainLayout";
import LoginLayout from "./layout/loginLayout";
import MyReviewsPage from "./pages/pageReview/myReview";
import Home from "./pages/pageHome/home";
import Login from "./pages/pageLogin/login";
import SearchResults from "./pages/pageSearchResults/searchResults";
import Address from "./pages/pageAddress/address";
import Account from "./pages/pageAccount/account";
import Cart from "./pages/pageCart/cartX";
import Payment from "./pages/pagePayment/payment";
import DetailProduct from "./pages/pageDetailsProducts/detailProduct";
import History from "./pages/pageHistory/history";
import Voucher from "./pages/pageVoucher/voucher";
import { ConfirmCOD, ConfirmMoMo, ConfirmVNPAY } from "./pages/pagePayment/confirmPages";
import VnpayReturn from "./pages/pagePayment/VnpayReturn";
function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Layout chính */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/address" element={<Address />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/voucher" element={<Voucher />} />
                    <Route path="/account/reviews" element={<MyReviewsPage />} />
                    <Route path="/detailproduct/:id" element={<DetailProduct />} />
                </Route>
                <Route path="/payment/confirm-cod" element={<ConfirmCOD />} />
                <Route path="/payment/confirm-vnpay" element={<ConfirmVNPAY />} />
                <Route path="/payment/vnpay-return" element={<VnpayReturn />} />
                {/* Layout login */}
                <Route element={<LoginLayout />}>
                    <Route path="/login" element={<Login />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;