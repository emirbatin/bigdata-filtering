import Ithalat from "../models/ithalatModel.js";
import Ihracat from "../models/ihracatModel.js";

// İndeks oluşturma (Bu kısmı bir kez çalıştırın, her sorgu için değil)
const createIndexes = async (Model) => {
  try {
    await Model.createIndex({
      tcgb_tescil_no: 1,
      gonderici_alici_vergi_no: 1,
      gumruk_istatistik_tarihi_bordro_tarihi: 1,
      fatura_tutari: 1,
    });
    await Model.createIndex({
      ticari_tanimi_31: "text",
      gtip_aciklamasi: "text",
    });
    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
};

// createIndexes(Ithalat);
// createIndexes(Ihracat);

const createFilterQuery = (filters) => {
  const query = { $and: [] };
  const regexFields = [
    "tcgbTescilNo",
    "vergiNo",
    "aliciAdi",
    "gonderenAdi",
    "cikisUlkeKodu",
    "cikisUlkeAdi",
    "menseUlkeKodu",
    "gtipKodu",
    "gondericiAliciAdi",
  ];

  regexFields.forEach((field) => {
    if (filters[field]) {
      let dbField = field.replace(/([A-Z])/g, "_$1").toLowerCase();

      // Özel durum: gondericiAliciAdi için
      if (field === "gondericiAliciAdi") {
        dbField = "gonderici_alici_adi";
      }
      if (field === "vergiNo") {
        dbField = "gonderici_alici_vergi_no"; // Veritabanındaki alan adını burada ayarladık
      }

      query.$and.push({
        [dbField]: {
          $regex: filters[field],
          $options: "i",
        },
      });
    }
  });

  if (filters.tescilTarihi || filters.kapanisTarihi) {
    const dateQuery = {};
    if (filters.tescilTarihi) dateQuery.$gte = new Date(filters.tescilTarihi);
    if (filters.kapanisTarihi) dateQuery.$lte = new Date(filters.kapanisTarihi);
    query.$and.push({ gumruk_istatistik_tarihi_bordro_tarihi: dateQuery });
  }

  if (filters.minFaturaTutari || filters.maxFaturaTutari) {
    const faturaQuery = {};
    if (filters.minFaturaTutari)
      faturaQuery.$gte = Number(filters.minFaturaTutari);
    if (filters.maxFaturaTutari)
      faturaQuery.$lte = Number(filters.maxFaturaTutari);
    query.$and.push({ fatura_tutari: faturaQuery });
  }

  return query.$and.length ? query : {};
};

const getData = async (req, res, Model) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "gumruk_istatistik_tarihi_bordro_tarihi",
    sortOrder = "desc",
    searchTerm,
    ...filters
  } = req.query;

  try {
    const matchStage = createFilterQuery(filters);
    const pipeline = [{ $match: matchStage }];

    if (searchTerm) {
      pipeline.push({
        $match: {
          $text: {
            $search: searchTerm,
            $caseSensitive: false,
            $diacriticSensitive: false,
          },
        },
      });
    }

    const [{ total = 0 } = {}] = await Model.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);

    pipeline.push(
      { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    );

    const data = await Model.aggregate(pipeline);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      data,
      currentPage: Number(page),
      totalPages, // Değişiklik burada: totalPages direkt olarak gönderiliyor
      total,
    });
  } catch (error) {
    res.status(500).json({
      error: "Veriler alınırken bir hata oluştu.",
      details: error.message,
    });
  }
};

export const getImportData = async (req, res) => getData(req, res, Ithalat);
export const getExportData = async (req, res) => getData(req, res, Ihracat);

// Sorgu performansını analiz etmek için
export const analyzeQuery = async (req, res, Model) => {
  try {
    const { ...filters } = req.query;
    const query = createFilterQuery(filters);
    const result = await Model.find(query).explain();
    res.json(result);
  } catch (error) {
    console.error("Error in analyzeQuery:", error);
    res.status(500).json({
      error: "Sorgu analizi yapılırken bir hata oluştu.",
      details: error.message,
    });
  }
};
