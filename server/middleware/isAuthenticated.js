import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token bulunamadı. Kullanıcı doğrulanamadı." });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decode) {
      return res.status(401).json({ message: "Geçersiz token" });
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    console.error("Token doğrulama hatası:", error);
    return res.status(401).json({ message: "Token doğrulama başarısız." });
  }
};

export default isAuthenticated;
