const formidable = require("formidable");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

module.exports.config = {
  api: {
    bodyParser: false
  }
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true
    });

    const [fields, files] = await form.parse(req);
    const file = files.image?.[0];

    if (!file) {
      return res.status(400).json({ error: "Gambar belum dipilih" });
    }

    const data = new FormData();

    data.append(
      "source_image_file",
      fs.createReadStream(file.filepath)
    );

    data.append("format", "png");

    const response = await axios.post(
      "https://api.slazzer.com/v2.0/remove_image_background",
      data,
      {
        headers: {
          ...data.getHeaders(),
          "API-KEY": process.env.SLAZZER_API_KEY
        },
        responseType: "arraybuffer",
        maxBodyLength: Infinity
      }
    );

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(Buffer.from(response.data));
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Gagal menghapus background"
    });
  }
};
