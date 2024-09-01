import mongoose from "mongoose";

const ithalatSchema = new mongoose.Schema(
  {
    tcgbGumrukIdaresiKodu: { type: String, required: false },
    tcgbGumrukIdaresiAdi: { type: String, required: false },
    tcgbTescilNo: { type: String, required: false },
    tcgbTescilTarihi: { type: Date, required: false },
    tcgbKapanisTarihi: { type: Date, required: false },
    gondericiAliciVergiNo: { type: String, required: false },
    gondericiAliciAdi: { type: String, required: false },
    gonderenAdi: { type: String, required: false },
    cikisUlkesiKodu: { type: String, required: false },
    cikisUlkesiAdi: { type: String, required: false },
    menseUlkeKodu: { type: String, required: false },
    menseUlkeAdi: { type: String, required: false },
    teslimSekliKodu: { type: String, required: false },
    kalemSiraNo: { type: Number, required: false },
    kalemRejimKodu: { type: String, required: false },
    kalemRejimAciklamasi: { type: String, required: false },
    gtipKodu: { type: String, required: false },
    gtipAciklamasi: { type: String, required: false },
    ticariTanimi31: { type: String, required: false },
    faturaTutari: { type: Number, required: false },
    faturaTutariDovizTuruKodu: { type: String, required: false },
    faturaTutariDovizTuru: { type: String, required: false },
    olcuEsyaMiktari: { type: Number, required: false },
    olcuBirimiAciklamasi: { type: String, required: false },
    netAgirlikKg: { type: Number, required: false },
    hesaplanmisKalemKiymetiUsdDegeri: { type: Number, required: false },
    istatistikiKiymetUsdDegeri: { type: Number, required: false },
  },
  {
    timestamps: true,
  },
  "ithalat"
);

const Ithalat = mongoose.model("Ithalat", ithalatSchema, "ithalat");

export default Ithalat;
