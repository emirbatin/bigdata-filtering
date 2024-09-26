import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    // Token'ı cookies'ten veya Authorization header'dan alıyoruz
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    // Token yoksa
    if (!token) {
      return res
        .status(401)
        .json({ message: "Token bulunamadı. Kullanıcı doğrulanamadı." });
    }

    // Token'ı doğruluyoruz
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Doğrulama başarısız olursa
    if (!decodedToken) {
      return res.status(401).json({ message: "Geçersiz token" });
    }

    // Kullanıcının id'sini request'e ekliyoruz
    req.user = {
      id: decodedToken.userId,
      permission: decodedToken.permission,
    };

    next();
  } catch (error) {
    console.error("Token doğrulama hatası:", error);

    // JWT doğrulama hatalarını daha açıklayıcı hale getiriyoruz
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token süresi dolmuş." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Geçersiz token." });
    } else {
      return res.status(401).json({ message: "Token doğrulama başarısız." });
    }
  }
};

export default isAuthenticated;
