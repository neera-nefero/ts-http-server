export function errorHandler(err, req, res, next) {
    console.log(err);
    res.status(500).json({
        error: "Something went wrong on our end",
    });
}
