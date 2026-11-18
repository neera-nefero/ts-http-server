export async function handlerValidateChirp(req, res) {
    let reqBody = "";
    req.on("data", (chunk) => {
        reqBody += chunk;
    });
    res.header("Content-Type", "application/json");
    req.on("end", () => {
        try {
            const parsedBody = JSON.parse(reqBody);
            if (!parsedBody.body) {
                const resBody = JSON.stringify({
                    error: "Invalid JSON"
                });
                res.status(400).send(resBody);
            }
            if (parsedBody.body.length > 140) {
                const resBody = JSON.stringify({
                    error: "Chirp is too long"
                });
                res.status(400).send(resBody);
            }
            const resBody = JSON.stringify({
                valid: true
            });
            res.status(200).send(resBody);
        }
        catch (error) {
            const resBody = JSON.stringify({
                error: "Invalid JSON"
            });
            res.status(400).send(resBody);
        }
    });
}
