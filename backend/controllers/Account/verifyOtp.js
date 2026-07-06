const Account =
    require("../../model/accountModel");

const verifyOtp = (req, res) => {
    const { phone, otp } = req.body;
    
    Account.verifyOtp(  phone, otp,
        (err, result) => {
            if (err) {
                return res
                    .status(500)
                    .json(err);
            }

            if (result.length === 0) {

                return res.json({
                    success: false
                });
            }

            res.json({
                success: true
            });
        }
    );
};

module.exports = verifyOtp;