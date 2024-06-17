function asyncWrap(asyncController) {
    return async (req, res, next) => {
        try {
            await asyncController(req, res)
        }
        catch (error) {
            next(error);
        }
    };
}